# Testimonials

Record testimonies with name, photo, and text or video/audio

Features
- View all testimonies publicly
- Uses Supabase free tier for database and storage
- Deployable on free hosts like Netlify or Vercel

Setup
- Create `.env` from `.env.example` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Ensure Supabase buckets `photos` and `media` exist and are public
- Apply SQL in `supabase/schema.sql` to create `testimonies` table
- Optional: run `supabase/storage.sql` to create buckets

Scripts
- `npm install`
- `npm run dev`

MCP Setup (Supabase)
- Generate a Supabase personal access token in Dashboard → Account → Tokens
- Put it in `.cursor/mcp.json` under `SUPABASE_ACCESS_TOKEN` or set env
- Start the MCP server: `node scripts/mcp-supabase.js`
- Then use your IDE’s MCP tools to run `supabase/schema.sql`
