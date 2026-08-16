import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .seed import seed
from .routers import auth, services, mechanics, bookings, reviews

Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(
    title="AC-Fix — Local AC Service & Mechanic Finder",
    description="Bridging residential customers with verified local AC technicians.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(services.router)
app.include_router(mechanics.router)
app.include_router(bookings.router)
app.include_router(reviews.router)

# Serve the React frontend from the built dist (single-origin deploy)
FRONTEND_DIST = os.environ.get(
    "FRONTEND_DIST",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
)


@app.get("/")
def root():
    index = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.isfile(index):
        return FileResponse(index)
    return {
        "app": "AC-Fix API (frontend not built)",
        "docs": "/docs",
        "health": "ok",
        "version": "1.0.0",
    }


if os.path.isdir(os.path.join(FRONTEND_DIST, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Never shadow the API — only serve the SPA shell for non-API paths.
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
            return {"detail": "Not Found"}
        index = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index):
            return FileResponse(index)
        return {"detail": "Not Found"}
