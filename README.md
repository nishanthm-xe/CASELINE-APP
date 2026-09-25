<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6c12a342-3865-4107-99fc-0f7b489bc56b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Server-Side Supabase Configuration

Encounter and mobile timeline synchronization uses Supabase when both server-only variables are configured:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
```

Never place `SUPABASE_SERVICE_ROLE_KEY` in React code, `public/`, frontend environment variables, or source control. Apply the additive encounter migration in [supabase-schema.sql](supabase-schema.sql) before enabling these variables. Without them, encounter APIs use the temporary local `caseline-db.json` fallback.

## 3D Model Attribution

The body surface model in `public/models/caseline-human-body.glb` is from [hpfrei/body-anatomy-3d-viewer](https://github.com/hpfrei/body-anatomy-3d-viewer), derived from [Z-Anatomy](https://www.z-anatomy.com/). It is used under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/). The model is used here as a body-surface selection tool, with its anatomical meshes grouped into CASE LINE clinical regions.
