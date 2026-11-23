import json
import os
import re
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")
Category = Literal["music", "builds"]


class Project(BaseModel):
    id: str
    title: str
    category: Category
    description: str
    image: str
    alt: str
    width: int
    height: int
    video: str | None = None


projects = [
    Project.model_validate(record)
    for record in json.loads((BASE / "projects.json").read_text(encoding="utf-8"))
]

app = FastAPI(title="Signal & Silicon API", version="1.0.0")
origins = [
    value.strip().rstrip("/")
    for value in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173"
    ).split(",")
    if value.strip()
]
preview_host = os.getenv("CLOUDFLARE_PAGES_HOST", "").strip()
preview_pattern = (
    rf"https://[a-z0-9-]+\.{re.escape(preview_host)}"
    if preview_host else None
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=preview_pattern,
    allow_methods=["GET"],
    allow_headers=[],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/projects", response_model=list[Project], response_model_exclude_none=True)
def list_projects(category: Category | None = None):
    return [project for project in projects if category is None or project.category == category]


@app.get("/api/projects/{project_id}", response_model=Project, response_model_exclude_none=True)
def get_project(project_id: str):
    for project in projects:
        if project.id == project_id:
            return project
    raise HTTPException(status_code=404, detail="Project not found")
