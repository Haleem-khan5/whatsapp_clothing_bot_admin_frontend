# whatsapp_clothing_bot_admin_frontend
this repository is used to built a clothing bot admin frontend 

## Environment configuration

This app is built with Vite. Environment variables must be prefixed with `VITE_` to be exposed to the browser.

- `VITE_SERVER_URL`: Optional. Absolute API base (e.g. `https://clothing-bot-uw4d.onrender.com`). If omitted, the app uses a relative `/api` base and relies on the Vite dev proxy defined in `vite.config.ts`.

Usage:

1. Create a `.env` file in `whatsapp_clothing_bot_admin_frontend/` and set:

   ```
   # Use proxy (dev): leave empty to default to /api
   # VITE_SERVER_URL=

   # Or set absolute API base (prod or when not using proxy)
   # VITE_SERVER_URL=https://clothing-bot-uw4d.onrender.com
   ```

2. Restart the dev server after changing `.env`.