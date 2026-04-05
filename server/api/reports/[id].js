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

        // Map DB format to Dashboard UI format
        const biomarkersList = biomarkers.data || []
        
        // Calculate Risk Magnitude
        const riskMagnitudeMap = {};
        biomarkersList.forEach(b => {
            const sys = b.body_system || 'General';
            if (!riskMagnitudeMap[sys] || b.risk_score > riskMagnitudeMap[sys]) {
                riskMagnitudeMap[sys] = b.risk_score || 0;
            }
        });
        const riskMagnitude = Object.entries(riskMagnitudeMap)
            .map(([system, score]) => ({ system, score }))
            .sort((a,b) => b.score - a.score);

        const reportData = {
            patient: {
                name: req.user.user_metadata?.full_name || 'User',
                age: null,
                sex: null,
                initials: (req.user.user_metadata?.full_name || 'U')
                    .split(' ').map(n => n[0]).join('').toUpperCase(),
                healthScore: report.overall_score || 0,
                healthStatus: report.health_status || 'normal'
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
            biomarkers: biomarkersList.map(b => ({
                ...b,
                system: b.body_system,
                range: b.reference_range,
                riskScore: b.risk_score
            })),
            riskMagnitude,
            futureProjection: (insights.data?.filter(i => i.type === 'future_risk') || []).map(r => ({
                timeframe: r.timeframe,
                severity: r.severity,
                text: r.body
            })),
            habits: (insights.data?.filter(i => i.type === 'habit') || []).map(h => ({
                id: h.id,
                label: h.body || 'Healthy Habit',
                icon: (h.title || '').toLowerCase().includes('sleep') ? 'clock' : 'leaf',
                relatedMarker: h.related_marker
            })),
            glossary: glossary.data || [],
            insights: (insights.data?.filter(i => i.type === 'insight') || []).map(i => ({
                ...i,
                icon: i.severity === 'critical' ? 'alert-circle' : 'trending-up'
            })),
            ionMessages: []
        }

        res.json(reportData)

    } catch (error) {
        console.error('Fetch report error:', error)
        res.status(500).json({ error: 'Failed to fetch report' })
    }
})

export default router