import { createClient } from '@supabase/supabase-js'

import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabaseAuth = supabaseUrl ? createClient(supabaseUrl, supabaseKey) : null;

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