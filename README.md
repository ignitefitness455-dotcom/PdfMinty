<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ff1d94ca-8844-480c-a061-c7a76b7ce750

## Local Development Flow

**Prerequisites:** Node.js, Wrangler CLI

1. Install dependencies:
   `npm install`
2. Set up environment variables (see `.env.example`). Note that `GEMINI_API_KEY` is a Cloudflare secret in production.
3. **Set up KV namespace for local development (Optional but recommended):**
   - Create a preview KV namespace in the Cloudflare dashboard (Workers & Pages → KV → Create namespace, name it `pdfminty-preview-ratelimit`).
   - Copy the namespace ID.
   - Paste it into `wrangler.toml` as the `preview_id` (line 14).
4. Run the Vite frontend app:
   `npm run dev`
5. Test Cloudflare Pages Functions locally:
   `npm run pages:dev`
6. Create a production build:
   `npm run build`
