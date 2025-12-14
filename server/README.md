Backend (Node.js + Express)

Wymagania
- Node.js 18+
- Poświadczenia do Neo4j AuraDB (URI, username, password)

Konfiguracja
1) Skopiuj `.env.example` do `.env` i uzupełnij:
   - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`
   - opcjonalnie `NEO4J_DATABASE` (domyślnie `neo4j`)
   - opcjonalnie `ALLOWED_ORIGINS` (lista originów do CORS)
2) Zainstaluj zależności: `npm install`
3) Uruchom: `npm start`

Endpointy
- Patrz: główne `README.md` w katalogu projektu.

