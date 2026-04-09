import express from 'express'
import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import { supabase } from '../../lib/supabase.js'
import { reportModel, SYSTEM_PROMPT } from '../../lib/gemini.js'
import { fileToBase64, getMimeType } from '../../lib/fileProcessor.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()

// Multer — save file temporarily
const upload = multer({
    dest: '/tmp/uploads/',
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
})

router.post('/', requireAuth, upload.single('report'), async (req, res) => {
    const tempFilePath = req.file?.path;
    let reportId;

    try {
        const userId = req.user.id
        const file = req.file

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        // ── STEP 1: Create report row with "processing" status ──
        reportId = uuidv4()
        const { error: insertError } = await supabase
            .from('reports')
            .insert({
                id: reportId,
                user_id: userId,
                status: 'processing',
                title: 'Analyzing...'
            })

        if (insertError) throw insertError

        // Return reportId immediately so frontend can redirect
        // and show processing screen
        res.json({ reportId, status: 'processing' })

        // ── STEP 2: Save file to Supabase Storage ──
        const fileBuffer = fs.readFileSync(tempFilePath)
        const storagePath = `reports/${userId}/${reportId}/original${file.originalname.includes('.')
                ? '.' + file.originalname.split('.').pop()
                : '.jpg'
            }`

        const { error: storageError } = await supabase.storage
            .from('medical-reports')
            .upload(storagePath, fileBuffer, {
                contentType: file.mimetype,
                upsert: false
            })

        if (storageError) throw storageError

        const { data: { publicUrl } } = supabase.storage
            .from('medical-reports')
            .getPublicUrl(storagePath)

        // ── STEP 3: Fetch user profile for personalisation ──
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            full_name,
            age,
            date_of_birth,
            sex,
            height,
            weight,
            height_unit,
            weight_unit,
            ethnicity,
            conditions,
            medications,
            allergies,
            is_pregnant,
            family_history,
            track_goals,
            language
          `)
          .eq('id', userId)
          .maybeSingle()

        console.log('User profile for context:', profile)

        // ── STEP 4: Fetch past report summaries for trend context ──
        const { data: pastReports } = await supabase
            .from('reports')
            .select('title, overall_score, health_status, created_at')
            .eq('user_id', userId)
            .eq('status', 'complete')
            .order('created_at', { ascending: false })
            .limit(3)

        // ── STEP 5: Convert file to base64 for Gemini ──
        const base64Data = fileToBase64(tempFilePath)
        const mimeType = getMimeType(file.originalname)

        // ── STEP 6: Build prompt with user context ──
        const userContext = `
=== PATIENT PROFILE CONTEXT ===
Use this information to personalize the analysis 
and adjust reference ranges accordingly.

Name: ${profile?.full_name || 'Not provided'}
Age: ${profile?.age || (profile?.date_of_birth ? 
  Math.floor((new Date() - new Date(profile.date_of_birth)) / 
  (365.25 * 24 * 60 * 60 * 1000)) : 'Unknown')} years
Biological Sex: ${profile?.sex || 'Not provided'}
Height: ${profile?.height ? 
  `${profile.height} ${profile.height_unit || 'cm'}` : 
  'Not provided'}
Weight: ${profile?.weight ? 
  `${profile.weight} ${profile.weight_unit || 'kg'}` : 
  'Not provided'}
Ethnicity: ${profile?.ethnicity || 'Not provided'}
Existing conditions: ${
  profile?.conditions?.length > 0 
    ? profile.conditions.join(', ') 
    : 'None reported'
}
Current medications: ${
  profile?.medications?.length > 0 
    ? profile.medications.join(', ') 
    : 'None reported'
}
Allergies: ${profile?.allergies || 'None reported'}
Pregnancy status: ${profile?.is_pregnant ? 'Currently pregnant' : 'Not pregnant'}
Family history: ${
  profile?.family_history?.length > 0 
    ? profile.family_history.join(', ') 
    : 'Not provided'
}
Health goals: ${
  profile?.track_goals?.length > 0 
    ? profile.track_goals.join(', ') 
    : 'Not provided'
}
Preferred language: ${profile?.language || 'English'}

=== PAST REPORTS CONTEXT ===
${pastReports?.length > 0 
  ? `This patient has ${pastReports.length} previous report(s):
${pastReports.map(r => 
  `- ${r.title} | Score: ${r.overall_score}/10 | Status: ${r.health_status} | Date: ${r.created_at?.split('T')[0]}`
).join('\n')}
Compare current results with past reports and 
note any worsening or improving trends per marker.`
  : 'This is the patient\'s first report. No historical data available for trend comparison.'
}

=== ANALYSIS INSTRUCTIONS ===
1. Adjust ALL reference ranges based on the 
   patient's age, sex, and existing conditions above.
2. If the patient is on medications that affect 
   markers (e.g. statins affect liver enzymes, 
   metformin affects B12), note this in the 
   explanation field for those markers.
3. If pregnant, use pregnancy-specific reference ranges.
4. Give habit recommendations relevant to Indian 
   lifestyle — mention dal, roti, seasonal vegetables, 
   morning walks rather than only Western food references.
5. Respond in ${profile?.language || 'English'}.
6. Compare with past reports if available and 
   set trend field accordingly for each marker.

Now analyze the attached medical report:
`

        // ── STEP 7: Call Gemini Vision API ──
        const result = await reportModel.generateContent([
          { text: SYSTEM_PROMPT },
          { text: userContext },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          }
        ])

        const rawResponse = result.response.text()

        // ── STEP 8: Parse JSON response ──
        let analysisData
        try {
            // Clean response in case Gemini adds markdown
            const cleaned = rawResponse
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim()
            analysisData = JSON.parse(cleaned)
        } catch (parseError) {
            throw new Error('Gemini returned invalid JSON: ' + rawResponse)
        }

        // ── STEP 9: Save everything to database ──

        // Update main report row
        const flaggedMarkers = analysisData.biomarkers?.filter(
            b => b.status !== 'normal'
        ) || []
        const hasCritical = flaggedMarkers.some(b => b.status === 'critical')

        // Clean up date for postgres (must be YYYY-MM-DD)
        let safeDate = analysisData.patientSnapshot?.date;
        if (safeDate && safeDate.includes('/')) {
            const parts = safeDate.split('/');
            // If it's DD/MM/YYYY
            if (parts[0].length <= 2 && parts[2]?.length === 4) {
                safeDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        // If it's still not YYYY-MM-DD length, just drop it to avoid crash
        if (safeDate && !/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) safeDate = null;

        const { error: updateError } = await supabase.from('reports').update({
            title: analysisData.patientSnapshot?.reportType || 'Medical Report',
            type: analysisData.patientSnapshot?.reportType,
            report_date: safeDate,
            lab: analysisData.patientSnapshot?.lab,
            doctor: analysisData.patientSnapshot?.doctor,
            file_url: publicUrl,
            status: 'complete',
            overall_score: analysisData.healthScore?.score,
            health_status: analysisData.healthScore?.status,
            flagged_count: flaggedMarkers.length,
            total_markers: analysisData.biomarkers?.length || 0,
            has_critical: hasCritical,
            critical_message: hasCritical
                ? analysisData.biomarkers.find(b => b.status === 'critical')?.name +
                ' requires immediate attention'
                : null
        }).eq('id', reportId)
        
        if (updateError) throw new Error(`Supabase Update Error: ${updateError.message}`);

        // Save biomarkers
        if (analysisData.biomarkers?.length > 0) {
            const { error: bioError } = await supabase.from('biomarkers').insert(
                analysisData.biomarkers.map(b => ({
                    report_id: reportId,
                    name: b.name,
                    plain_name: b.plainName,
                    value: b.value,
                    unit: b.unit,
                    reference_range: b.referenceRange,
                    status: b.status,
                    risk_score: b.riskScore,
                    body_system: b.bodySystem,
                    explanation: b.explanation,
                    trend: b.trend
                }))
            )
            if (bioError) throw new Error(`Supabase Biomarker Insert Error: ${bioError.message}`);
        }

        // Save insights
        if (analysisData.insights?.length > 0) {
            const { error: insError } = await supabase.from('insights').insert(
                analysisData.insights.map(i => ({
                    report_id: reportId,
                    type: 'insight',
                    title: i.title,
                    body: i.body,
                    severity: i.severity,
                    related_marker: i.relatedMarker
                }))
            )
            if (insError) throw new Error(`Supabase Insight Insert Error: ${insError.message}`);
        }

        // Save future risks
        if (analysisData.futureRisks?.length > 0) {
            const { error: riskError } = await supabase.from('insights').insert(
                analysisData.futureRisks.map(r => ({
                    report_id: reportId,
                    type: 'future_risk',
                    body: r.risk,
                    severity: r.severity,
                    related_marker: r.relatedMarker,
                    timeframe: r.timeframe
                }))
            )
            if (riskError) throw new Error(`Supabase Future Risk Insert Error: ${riskError.message}`);
        }

        // Save habits
        if (analysisData.habits?.length > 0) {
            const { error: habError } = await supabase.from('insights').insert(
                analysisData.habits.map(h => ({
                    report_id: reportId,
                    type: 'habit',
                    title: h.category,
                    body: h.action,
                    severity: 'info',
                    related_marker: h.relatedMarker
                }))
            )
            if (habError) throw new Error(`Supabase Habit Insert Error: ${habError.message}`);
        }

        // Save glossary
        if (analysisData.glossary?.length > 0) {
            const { error: glosError } = await supabase.from('glossary_terms').insert(
                analysisData.glossary.map(g => ({
                    report_id: reportId,
                    term: g.term,
                    definition: g.definition
                }))
            )
            if (glosError) throw new Error(`Supabase Glossary Insert Error: ${glosError.message}`);
        }

        console.log(`✓ Report ${reportId} analyzed and saved successfully`)

    } catch (error) {
        console.error('Upload error:', error)

        // If we haven't answered the client yet, answer them with error
        if (!res.headersSent) {
            return res.status(500).json({ error: error.message || 'Internal Server Error' })
        }

        // If we already told the client we are 'processing', tell DB we failed
        // so the frontend stops polling!
        if (typeof reportId !== 'undefined' && reportId) {
            await supabase.from('reports')
                .update({ status: 'failed' })
                .eq('id', reportId)
        }
    } finally {
        // Always clean up temp file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath)
        }
    }
})

export default router