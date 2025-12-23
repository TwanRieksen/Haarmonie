# HaarMonie Hairdesign — Static HTML/CSS/JS + Decap CMS (OAuth)

Deze site is een pure static site (HTML/CSS/JS/JSON). Content komt uit `content/*.json` en wordt op elke pagina ingeladen door `assets/js/content-loader.js`.

## CMS
- Admin: `/admin/`
- Config: `admin/config.yml`
- Backend: `github` (commits direct naar je repo)

## OAuth (zonder Netlify Identity)
Gebruik Netlify's OAuth provider tokens voor GitHub (via de Netlify UI). Zie Netlify docs:
- Project configuration → Access & security → OAuth → Install provider → GitHub
- Client ID / Client Secret invullen (van je GitHub OAuth App)

## Netlify deploy
- Publish directory: `.`
- Build command: leeg

## Let op
- Upload eigen foto's via het CMS (media folder: `assets/img/uploads`).
