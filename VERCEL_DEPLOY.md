# Vercel deployment

This project is structured as a Vite frontend + FastAPI backend for one Vercel project.

- Frontend build: `frontend/dist`
- Python API entrypoint: `api/index.py`
- API base: `/api`
- Build command: `cd frontend && npm install && npm run build`

In Vercel, keep **Root Directory** at the repository root (the folder containing `vercel.json`). Do not set it to `frontend`.

The frontend calls `/api/...` on the same domain, so no localhost backend URL is used in production.
