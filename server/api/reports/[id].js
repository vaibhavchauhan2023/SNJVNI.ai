import express from 'express'
import { supabase } from '../../lib/supabase.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

router.get('/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.user.id

        // Fetch report
        const { data: report, error } = await supabase
            .from('reports')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId) // security check
            .single()

        if (error || !report) {
            return res.status(404).json({ error: 'Report not found' })
        }

        // Fetch all related data
        const [biomarkers, insights, glossary] = await Promise.all([
            supabase.from('biomarkers')
                .select('*').eq('report_id', id),
            supabase.from('insights')
                .select('*').eq('report_id', id),
            supabase.from('glossary_terms')
                .select('*').eq('report_id', id)
        ])

        // Shape response to match frontend reportData structure
        const reportData = {
            patient: {
                name: req.user.user_metadata?.full_name || 'User',
                age: null,
                sex: null,
                initials: (req.user.user_metadata?.full_name || 'U')
                    .split(' ').map(n => n[0]).join('').toUpperCase()
            },
            report: {
                id: report.id,
                title: report.title,
                date: report.report_date,
                lab: report.lab,
                doctor: report.doctor,
                type: report.type,
                status: report.status,
                flaggedCount: report.flagged_count,
                totalMarkers: report.total_markers,
                hasCritical: report.has_critical,
                criticalMessage: report.critical_message
            },
            healthScore: {
                score: report.overall_score,
                status: report.health_status
            },
            biomarkers: biomarkers.data || [],
            insights: insights.data?.filter(i => i.type === 'insight') || [],
            futureRisks: insights.data?.filter(i => i.type === 'future_risk') || [],
            habits: insights.data?.filter(i => i.type === 'habit') || [],
            glossary: glossary.data || []
        }

        res.json(reportData)

    } catch (error) {
        console.error('Fetch report error:', error)
        res.status(500).json({ error: 'Failed to fetch report' })
    }
})

export default router