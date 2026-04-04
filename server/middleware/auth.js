import { createClient } from '@supabase/supabase-js'

// Anon key for verifying user JWT
const supabaseAuth = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
)

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error } = await supabaseAuth.auth.getUser(token)

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid token' })
        }

        req.user = user  // attach user to request
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Auth failed' })
    }
}