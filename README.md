# Adil Furnitures — Admin panel (static site)

Plain HTML/CSS/JS. No build step. Talks to the backend API.

1. Edit `config.js` -> `window.ADMIN_API_BASE = "https://<your-backend>.onrender.com"`.
2. Deploy this folder as a static site (Render Static Site, Netlify, Vercel, Cloudflare Pages, GitHub Pages).
3. Add this admin site's URL to the backend env var `CORS_ORIGIN` (comma separated with the website URL, no trailing slash).
4. Open the site and enter the backend's `ADMIN_LOGIN_CODE`.

Login token is kept in sessionStorage (cleared when the tab closes) and expires after 12 h; Logout revokes it on the server. The admin code is never stored in this project.
Local test: `npx serve .`
