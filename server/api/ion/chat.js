import express from 'express'
import { GoogleGenAI } from '@google/genai'
import { supabase } from '../../lib/supabase.js'
import { requireAuth } from '../../middleware/auth.js'

const router = express.Router()
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const withRetry = async (fn, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      const is429 = err.status === 429 || 
                    err.message?.includes('429') ||
                    err.message?.includes('RESOURCE_EXHAUSTED') ||
                    err.message?.includes('quota')
      
      if (is429 && attempt < retries) {
        const waitMs = attempt * 10000
        console.log(`Rate limited (attempt ${attempt}/${retries}). Waiting ${waitMs/1000}s...`)
        await new Promise(resolve => setTimeout(resolve, waitMs))
        continue
      }
      
      throw err
    }
  }
}
const ION_SYSTEM_PROMPT = `You are ION, the AI health assistant for SNJVNI.ai. Answer questions about the patient's medical report clearly and supportively.

Rules:
- Keep responses to 3-5 sentences max
- Never diagnose — say "associated with"  
- Reference specific marker values from the report
- If critical marker involved, end with "Please consult your doctor."
- Use simple language, explain any medical terms
- Mention Indian food and lifestyle where relevant for habits`

router.post('/', requireAuth, async (req, res) => {
  try {
    const { message, reportId, history } = req.body
    const userId = req.user.id

    if (!message || !reportId) {
      return res.status(400).json({
        error: 'message and reportId are required'
      })
    }

    console.log(`[ION] New chat request for report ${reportId} from user ${userId}`)

    // Fetch the report data for context
    const { data: report } = await supabase
      .from('reports')
      .select('title, overall_score, health_status, has_critical')
      .eq('id', reportId)
      .eq('user_id', userId)
      .single()

    // Fetch biomarkers for context
    const { data: biomarkers } = await supabase
      .from('biomarkers')
      .select('name, plain_name, value, unit, reference_range, status, risk_score, explanation')
      .eq('report_id', reportId)

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, age, sex, conditions, medications, language')
      .eq('id', userId)
      .single()

    // Build report context string
    const reportContext = `
=== PATIENT REPORT CONTEXT ===
Report: ${report?.title || 'Medical Report'}
Overall Score: ${report?.overall_score}/10
Status: ${report?.health_status}
Has Critical Values: ${report?.has_critical ? 'YES' : 'No'}

Patient: ${profile?.full_name || 'Patient'}
Age: ${profile?.age || 'Unknown'}
Sex: ${profile?.sex || 'Unknown'}
Conditions: ${profile?.conditions?.join(', ') || 'None'}
Medications: ${profile?.medications?.join(', ') || 'None'}

=== BIOMARKER RESULTS ===
${biomarkers?.map(b =>
      `${b.name} (${b.plain_name}): ${b.value} ${b.unit} | Range: ${b.reference_range} | Status: ${b.status?.toUpperCase()} | Risk: ${b.risk_score}/10
  Explanation: ${b.explanation}`
    ).join('\n\n') || 'No biomarker data available'}

Answer the patient's question based on their 
specific report data above.
`

    // Build conversation history for Gemini
    // Gemini expects alternating user/model roles
    const conversationHistory = (history || []).map(msg => ({
      role: msg.role === 'ion' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }))

    const contents = [
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ]

    const result = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          systemInstruction: ION_SYSTEM_PROMPT + '\n\n' + reportContext
        }
      })
    )

    const reply = result.text

    console.log(`[ION] Reply generated successfully`)

    // Save conversation to database
    const { data: existingConvo } = await supabase
      .from('ion_conversations')
      .select('id, messages')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .single()

    const updatedMessages = [
      ...(existingConvo?.messages || []),
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'ion', content: reply, timestamp: new Date().toISOString() }
    ]

    if (existingConvo) {
      await supabase
        .from('ion_conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConvo.id)
    } else {
      await supabase
        .from('ion_conversations')
        .insert({
          report_id: reportId,
          user_id: userId,
          messages: updatedMessages
        })
    }

    res.json({ reply })

  } catch (error) {
    console.error('ION chat error:', error)
    res.status(500).json({
      error: 'ION failed to respond. Please try again.'
    })
  }
})

export default router
