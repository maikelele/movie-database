Wdrożenie w chmurze (przykład: Render.com)

Wymagania
- Publiczne repozytorium (np. GitHub) z tym projektem.
- Konto na Neo4j AuraDB z działającą instancją (URI/username/password).

Kroki
1) Utwórz Web Service w Render.com:
   - Connect: repo z aplikacją.
   - Root Directory: `projekt/server` (katalog backendu).
   - Build Command: `npm install`.
   - Start Command: `npm start`.
   - Region: domyślny.
2) Ustaw zmienne środowiskowe (Environment):
   - `PORT` = `3000` (lub pozwól Render ustawić; Express użyje `process.env.PORT`).
   - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` — z AuraDB.
   - `NEO4J_DATABASE` (opcjonalnie, zwykle `neo4j`).
   - `ALLOWED_ORIGINS` — np. `https://twoj-front.ktoś.pl,https://twoj-back.onrender.com`.
3) Frontend
   - Opcja A: serwuj statyki bezpośrednio z Express (już skonfigurowane). Wtedy otwórz URL serwisu Render — powinno działać SPA i API.
   - Opcja B: wdrożenie `client/` jako Static Site (np. Render Static Sites, Netlify, Vercel). Ustaw `ALLOWED_ORIGINS` na adres frontendu.
4) Testy
   - `GET /health` powinno zwrócić `{ ok: true }`.
   - Dodaj przykładowe dane przez REST lub GraphQL i sprawdź widoki w SPA.

Alternatywy
- Azure App Service for Linux (Node.js): analogicznie — repo + zmienne środowiskowe.
- Railway.app: podobnie jak Render.
- Heroku: jeśli dostępny plan, konfiguracja podobna (Procfile nie jest wymagany, ale można dodać).

