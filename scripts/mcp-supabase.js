import { spawn } from 'child_process'
import dotenv from 'dotenv'
dotenv.config({ path: './.env.local', override: false })
dotenv.config({ path: './.env', override: false })
const token = process.env.SUPABASE_ACCESS_TOKEN
if (!token) {
  console.error('Missing SUPABASE_ACCESS_TOKEN')
  process.exit(1)
}
  
const args = ['-y', '@supabase/mcp-server-supabase@latest', '--access-token', token]
const cp = spawn('npx', args, { stdio: 'inherit', shell: true })
cp.on('exit', (code) => process.exit(code ?? 0))
