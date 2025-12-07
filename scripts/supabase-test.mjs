import dotenv from 'dotenv'
dotenv.config({ path: './.env.local', override: true })
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY
console.log('ENV_CHECK', { url, key: !!key })
const client = createClient(url, key)

const { data, error } = await client.from('testimonies').select('*').limit(1)
const result = { ok: !error, error: error ? error.message : null, count: Array.isArray(data) ? data.length : 0 }
fs.writeFileSync('scripts/supabase-test-output.json', JSON.stringify(result))
console.log(JSON.stringify(result))
