import express from 'express'
import { supabase } from '../../lib/supabase.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id

    // Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()

    // Fetch Latest complete report
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1)

    const latestReport = reports?.[0] || null
    let flaggedMarkers = []
    let insights = []

    if (latestReport) {
      // get markers
      const { data: markersData } = await supabase
        .from('biomarkers')
        .select('*')
        .eq('report_id', latestReport.id)
        .neq('status', 'normal') // all that are flagged

      flaggedMarkers = markersData || []

      // get insights
      const { data: insightsData } = await supabase
        .from('insights')
        .select('*')
        .eq('report_id', latestReport.id)

      insights = insightsData || []
    }

    res.json({
      user: {
        firstName: profile?.full_name?.split(' ')[0] || 'User',
        healthScore: latestReport?.overall_score || 0,
        healthStatus: latestReport?.health_status || 'normal',
      },
      latestReport: latestReport ? {
        id: latestReport.id,
        date: new Date(latestReport.report_date || latestReport.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: latestReport.title || 'Medical Report',
        overallScore: latestReport.overall_score || 0,
        status: latestReport.health_status || 'normal',
        flaggedCount: latestReport.flagged_count || 0,
        totalMarkers: latestReport.total_markers || 0,
      } : null,
      flaggedMarkers: flaggedMarkers.map(m => ({
        id: m.id,
        name: m.name,
        plainName: m.plain_name,
        value: m.value,
        unit: m.unit,
        status: m.status,
        trend: m.trend || 'stable',
        bodySystem: m.body_system || 'General',
        reportId: m.report_id
      })),
      insights: insights.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title,
        body: i.body,
        actionLabel: i.action_label,
        actionRoute: `/report/${i.report_id}`,
        severity: i.severity || 'info'
      })),
      hasReports: !!latestReport
    })

  } catch (error) {
    console.error('Dashboard Error:', error)
    res.status(500).json({ error: 'Failed to build dashboard data' })
  }
})

export default router
