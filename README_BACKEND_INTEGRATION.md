# Frontend ↔ Backend Integration Notes

- Backend base URL can be configured via `REACT_APP_API_BASE` in the React app.
  - For example, create `icu-availability-and-scheduling-system-8659-8671/frontend_react_app/.env` with:
    ```
    REACT_APP_API_BASE=http://localhost:4000
    ```
- With this set, the UI calls `http://localhost:4000/api/...`.
- Alternatively, configure a dev proxy in the React app (not included by default). In that case calls to `/api/...` are proxied to the backend.

Endpoints used by UI:
- AvailabilityManager:
  - GET `/api/doctors`
  - GET `/api/icus`
  - GET `/api/availability`
  - POST `/api/availability`
  - PUT `/api/availability/:id`
  - DELETE `/api/availability/:id`
