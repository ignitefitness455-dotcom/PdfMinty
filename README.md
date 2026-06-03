# PdfMinty - Cloudflare Pages Deployment & Rollback Guide

PdfMinty is a privacy-first, client-side PDF toolkit designed to run seamlessly on Cloudflare Pages. This guide outlines the build, deployment, environment configuration, and rollback procedures.

---

## 🛠️ Build and Deploy Workflow

PdfMinty uses dynamic API functions alongside its optimized, static SPA pages. Both the client-side code and backend serverless endpoints compile successfully into a fast distribution.

**Build Command:**
```bash
npm run build
```
This produces the distribution folder under `dist/` (which is configured as the `pages_build_output_dir` in `wrangler.toml`).

**Manual Wrangler Deployment Command:**
```bash
npx wrangler pages deploy dist --project-name=pdfminty
```

---

## 🔄 Rollback Procedures (রোলব্যাক নির্দেশিকা)

In the event of a deployment failure, production-breaking issue, or P0 security event, follow the procedures below to instantly roll back to a known stable deployment.

---

### Method 1: Instant Rollback via Cloudflare Dashboard (ড্যাশবোর্ড দিয়ে রোলব্যাক)
This is the fastest, safest, and zero-downtime path that requires no terminal commands or source rebuilds.

1. **Log in** to your Cloudflare Dashboard (https://dash.cloudflare.com).
2. Navigate to **Workers & Pages** -> **Pages** -> select **pdfminty**.
3. Go to the **Deployments** tab.
4. Browse your deployment history to find the last known stable deployment (labeled as `Success`).
5. Click on the 📄 **Details** or the **three-dots (...)** context menu of that specific stable deployment.
6. Select **Rollback to this deployment** (এই ডেপ্লয়মেন্টে রোলব্যাক করুন).
7. Confirm the dialog. Cloudflare will instantly route all production traffic back to this older build within seconds.

---

### Method 2: Rollback via Wrangler CLI (কমান্ড লাইন দিয়ে রোলব্যাক)
If you prefer managing deployments programmatically or via continuous integration systems:

1. **View Deployment List**:
   Identify the previous stable deployment ID:
   ```bash
   npx wrangler pages deployment list --project-name=pdfminty
   ```
2. **Rollback to Selected Deployment**:
   Execute the rollback action using the specific deployment ID identified:
   ```bash
   npx wrangler pages deployment rollback <DEPLOYMENT_ID> --project-name=pdfminty
   ```
3. Verify that the production alias now points to the reverted deployment hash.

---

## 📡 Environment Configuration & Verification

Ensure that the environment-specific keys match your active environment:

- **Gemini Model Configuration**: Set `GEMINI_MODEL="gemini-3.1-flash-lite"` (or your preferred optimized production model) inside your Workers Environment Variables.
- **Wrangler KV Binding**: Ensure `RATELIMIT_KV` is bound to the respective namespace IDs as configured in `wrangler.toml`.
