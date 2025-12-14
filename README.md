Opis
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

Licencja
- Materiały edukacyjne do zaliczenia przedmiotu; brak formalnej licencji.
