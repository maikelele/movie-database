Neo4j Graph PoC — People & Movies Explorer

Opis
- Prosty projekt typu proof-of-concept z bazą grafową Neo4j (AuraDB) oraz interfejsem webowym.
- Backend: Node.js 18+ + Express, REST API (+ opcjonalnie endpoint GraphQL).
- Frontend: lekka aplikacja SPA (HTML/CSS/JS) korzystająca z REST API.

Funkcjonalności
- Dodawanie osób (Person) i filmów (Movie).
- Tworzenie relacji ACTED_IN pomiędzy osobą a filmem (z listą ról).
- Wyszukiwanie po nazwie/tytule i podgląd uproszczonego grafu (nodes/links).

Struktura katalogów
- `server` — serwer Node.js (Express, Neo4j driver, REST + opcjonalnie GraphQL)
- `client` — prosta aplikacja SPA (HTML, CSS, JS)
- `docs` — dokumentacja: UML (PlantUML), opis wdrożenia, kolekcja do testów

Szybki start (lokalnie)
1) Neo4j AuraDB (zalecane)
   - Wejdź na https://console.neo4j.io/, utwórz instancję AuraDB Free i skopiuj: `URI`, `username` (np. `neo4j`), `password`.
   - Skonfiguruj środowisko: skopiuj `server/.env.example` do `server/.env` i ustaw:
     - `NEO4J_URI=neo4j+s://<your-db-id>.databases.neo4j.io`
     - `NEO4J_USERNAME=<twoj-username>`
     - `NEO4J_PASSWORD=<twoje-haslo>`
     - (opcjonalnie) `NEO4J_DATABASE=neo4j`
2) Backend
   - `cd server && npm install`
   - (opcjonalnie) test połączenia: `npm run check:db`
   - Start: `npm start`
   - Aplikacja (SPA + API) działa pod `http://localhost:3000`.
3) Frontend
   - Klient jest serwowany statycznie przez backend (nie otwieraj `client/index.html` bezpośrednio z pliku — SPA oczekuje tego samego originu co API).

Lokalny Neo4j (alternatywa dla AuraDB)
- Uruchom Neo4j lokalnie (Desktop / standalone), np. `bolt://localhost:7687`.
- W pliku `server/.env` ustaw:
  - `NEO4J_URI=neo4j://localhost:7687` (lub `bolt://localhost:7687`)
  - `NEO4J_USERNAME=<twoj-username>`
  - `NEO4J_PASSWORD=<twoje-haslo>`
- Następnie wykonaj kroki z sekcji „Backend”.

Seeding (opcjonalnie)
- `cd server && npm run seed` — doda przykładowe osoby, filmy i relacje.

Ważne endpointy
- REST
  - `GET /health` — kontrola zdrowia serwisu
  - `GET /api/people?search=...`
  - `GET /api/movies?search=...`
  - `POST /api/people` — `{ "name": string, "born"?: number }`
  - `POST /api/movies` — `{ "title": string, "released"?: number }`
  - `POST /api/acted-in` — `{ "personName": string, "movieTitle": string, "roles"?: string[] }`
  - `GET /api/graph?limit=50` — uproszczony graf do wizualizacji
- GraphQL (opcjonalny)
  - `POST /graphql` — body: `{ query, variables }`
  - W trybie deweloperskim dostępny GraphiQL pod `/graphql` (NODE_ENV != production)

Przykładowe GraphQL
- Wyszukiwanie osób z filmami:
  query($q:String){ people(search:$q){ name born actedIn{ title released } } }
  variables: { "q": "Keanu" }
- Filmy z aktorami:
  { movies{ title released actors{ name } } }

Wdrożenie w chmurze
- Zalecane: Render.com (Web Service) lub dowolna platforma Node.js (np. Azure Web Apps, Railway)
- Instrukcje w `docs/deployment.md`.

Licencja
- Materiały edukacyjne do zaliczenia przedmiotu; brak formalnej licencji.
