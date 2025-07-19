from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from routes import main, craftsmen, jobs, admin, translation_cache
from init_db import create_sample_data
import os

app = FastAPI(title="UstaKıbrıs", description="KKTC Usta ve İş İlanları Platformu")

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    create_sample_data()

# Mount static files
if not os.path.exists("static"):
    os.makedirs("static")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(main.router, tags=["main"])
app.include_router(craftsmen.router, tags=["craftsmen"])
app.include_router(jobs.router, tags=["jobs"])
app.include_router(admin.router, tags=["admin"])
app.include_router(translation_cache.router, tags=["translation-cache"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)