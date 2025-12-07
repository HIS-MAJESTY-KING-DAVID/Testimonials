Initial setup
- Scaffolded Vite React app
- Added Supabase client integration
- Implemented submit and list pages
- Added local Supabase schema and storage definitions
Next steps
- Set environment variables in `.env`
- Apply `supabase/schema.sql` and create public buckets
- Deploy to Netlify or Vercel free tier
MCP
- Added `.cursor/mcp.json` and `scripts/mcp-supabase.js`
- Configure `SUPABASE_ACCESS_TOKEN` and start MCP server
Done via MCP
- Created `public.testimonies` table in project `cvuvdnisnxzpqnxqaaaz`
- Inserted `photos` and `media` buckets in `storage.buckets`
- Seeded 3 mock testimonies for UI verification
UI Refresh
- Added global modern styles and fonts
- Redesigned home hero, grid, and cards
- Styled submit page
- Added load-more pagination and skeleton loaders
Admin & Validation
- Added `is_validated`, `phone`, and `email` columns via migration
- Home lists only validated testimonies
- Submit collects contact info
- Admin page `/admin` with password gate and CRUD
