Dokumentacja

Opis rozwiązania
- Cel: proof-of-concept z użyciem bazy grafowej Neo4j, z prostą aplikacją webową realizującą operacje CRUD na węzłach i krawędziach oraz prezentującą uproszczony graf.
- Backend: Express (REST + opcjonalnie GraphQL), sterownik `neo4j-driver`.
- Frontend: SPA (vanilla JS), wywołania `fetch` do REST API, wizualizacja grafu przy użyciu `vis-network` (CDN).
- Baza: Neo4j AuraDB (DBaaS) — bezobsługowe, darmowe w planie Free.

Diagramy UML (PlantUML)
- Diagram klas: `diagrams/class_diagram.puml`
- Diagram sekwencji (dodawanie osoby): `diagrams/sequence_add_person.puml`
- Diagram komponentów: `diagrams/component.puml`
- Diagram wdrożenia: `diagrams/deployment.puml`

Atrakcyjność technologiczna (przykład)
- SPA w przeglądarce (bez przeładowań, proste UI).
- Opcjonalny interfejs GraphQL pod `/graphql` (działa równolegle z REST).
- Możliwość łatwego wdrożenia w chmurze (Render/Azure).

Uruchomienie i wdrożenie
- Lokalnie: patrz `projekt/README.md` i `server/README.md`.
- W chmurze: instrukcja w `deployment.md`.

