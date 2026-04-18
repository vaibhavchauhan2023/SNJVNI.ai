import express from 'express'
import { supabase } from '../../lib/supabase.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get all complete reports for this user ordered by date
    const { data: reports, error: reportsError } = await supabase
      .from('reports')
      .select('id, title, report_date, created_at, overall_score')
      .eq('user_id', userId)
      .eq('status', 'complete')
      .order('report_date', { ascending: true, nullsFirst: false })

    if (reportsError) throw reportsError

    if (!reports || reports.length === 0) {
      return res.json({ markers: [], trendData: {} })
    }

    const reportIds = reports.map(r => r.id)

    // Get all biomarkers across all reports
    const { data: biomarkers, error: bioError } = await supabase
      .from('biomarkers')
      .select(`
        id,
        report_id,
        name,
        plain_name,
        value,
        unit,
        reference_range,
        status,
        risk_score,
        body_system,
        explanation
      `)
      .in('report_id', reportIds)

    if (bioError) throw bioError

    // Group biomarkers by name
    const markerMap = {}
    biomarkers.forEach(b => {
      const report = reports.find(r => r.id === b.report_id)
      if (!report) return

      const date = report.report_date || report.created_at
      
      if (!markerMap[b.name]) {
        markerMap[b.name] = {
          name: b.name,
          plainName: b.plain_name,
          unit: b.unit,
          referenceRange: b.reference_range,
          bodySystem: b.body_system,
          explanation: b.explanation,
          dataPoints: []
        }
      }

      markerMap[b.name].dataPoints.push({
        date: date,
        value: parseFloat(b.value) || 0,
        status: b.status,
        riskScore: b.risk_score,
        reportId: b.report_id,
        reportTitle: report.title
      })
    })

    // Sort data points by date for each marker
    Object.values(markerMap).forEach(marker => {
      marker.dataPoints.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      )

      // Calculate trend direction
      const points = marker.dataPoints
      if (points.length >= 2) {
        const first = points[0].value
        const last = points[points.length - 1].value
        const change = ((last - first) / first) * 100

        // For most markers lower is better
        // Exceptions where higher is better:
        const higherIsBetter = [
          'Haemoglobin', 'Vitamin D', 'HDL', 
          'HDL Cholesterol', 'Vitamin B12'
        ]
        
        const isHigherBetter = higherIsBetter.some(m => 
          marker.name.toLowerCase().includes(m.toLowerCase())
        )

        if (Math.abs(change) < 2) {
          marker.trend = 'stable'
          marker.trendPercent = 0
        } else if (isHigherBetter) {
          marker.trend = change > 0 ? 'improving' : 'worsening'
          marker.trendPercent = Math.abs(change)
        } else {
          marker.trend = change < 0 ? 'improving' : 'worsening'
          marker.trendPercent = Math.abs(change)
        }
      } else {
        marker.trend = 'stable'
        marker.trendPercent = 0
      }

      // Add latest value and status
      const latest = points[points.length - 1]
      marker.latestValue = latest?.value
      marker.latestStatus = latest?.status
      marker.latestDate = latest?.date

      // Generate projected path (simple linear projection)
      if (points.length >= 2) {
        const last2 = points.slice(-2)
        const slope = last2[1].value - last2[0].value
        const lastDate = new Date(last2[1].date)
        
        marker.projectedPoints = [1, 2, 3].map(i => {
          const projDate = new Date(lastDate)
          projDate.setMonth(projDate.getMonth() + (i * 3))
          return {
            date: projDate.toISOString(),
            value: Math.max(0, last2[1].value + (slope * i)),
            projected: true
          }
        })
      }
    })

    // Build available markers list for dropdown
    const availableMarkers = Object.values(markerMap)
      .filter(m => m.dataPoints.length >= 1)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(m => ({
        name: m.name,
        plainName: m.plainName,
        unit: m.unit,
        referenceRange: m.referenceRange,
        bodySystem: m.bodySystem,
        trend: m.trend,
        trendPercent: m.trendPercent,
        latestValue: m.latestValue,
        latestStatus: m.latestStatus,
        dataPoints: m.dataPoints,
        projectedPoints: m.projectedPoints || []
      }))

    console.log(`Trends: ${availableMarkers.length} markers found for user ${userId}`)

    res.json({
      markers: availableMarkers,
      totalReports: reports.length
    })

  } catch (err) {
    console.error('Trends error:', err)
    res.status(500).json({ error: 'Failed to fetch trend data' })
  }
})

export default router
