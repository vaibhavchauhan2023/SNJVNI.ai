import express from 'express'
import { supabase } from '../../lib/supabase.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch all reports for this user
    const { data: reports, error } = await supabase
      .from('reports')
      .select(`
        id,
        title,
        type,
        report_date,
        created_at,
        status,
        overall_score,
        health_status,
        flagged_count,
        total_markers,
        has_critical
      `)
      .eq('user_id', userId)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch reports error:', error)
      return res.status(500).json({ error: 'Failed to fetch reports' })
    }

    // For each report fetch top 2 flagged markers
    const reportsWithMarkers = await Promise.all(
      reports.map(async (report) => {
        const { data: flaggedMarkers } = await supabase
          .from('biomarkers')
          .select('name, status, risk_score')
          .eq('report_id', report.id)
          .neq('status', 'normal')
          .order('risk_score', { ascending: false })
          .limit(2)

        return {
          ...report,
          flaggedMarkers: flaggedMarkers || []
        }
      })
    )

    // Calculate summary stats
    const totalReports = reports.length

    // Most flagged marker across all reports
    const { data: allFlagged } = await supabase
      .from('biomarkers')
      .select('name')
      .in('report_id', reports.map(r => r.id))
      .neq('status', 'normal')

    const markerCounts = {}
    allFlagged?.forEach(b => {
      markerCounts[b.name] = (markerCounts[b.name] || 0) + 1
    })
    const mostFlagged = Object.entries(markerCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null

    // Health trend — compare latest two reports
    let healthTrend = null
    if (reports.length >= 2) {
      const latest = reports[0].overall_score
      const previous = reports[1].overall_score
      if (latest > previous) healthTrend = 'improving'
      else if (latest < previous) healthTrend = 'worsening'
      else healthTrend = 'stable'
    }

    res.json({
      reports: reportsWithMarkers,
      summary: {
        totalReports,
        mostFlagged,
        healthTrend,
        longestStreak: null
      }
    })

  } catch (err) {
    console.error('Reports index error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
