from fastapi import FastAPI, Request, HTTPException
from routes import translation_cache
from database import Base, engine
import os

app = FastAPI(title="UstaKıbrıs", description="KKTC Usta ve İş İlanları Platformu")

# Mount only the translation_cache router for now
app.include_router(translation_cache.router, tags=["translation-cache"])

SETUP_TOKEN = os.getenv('SETUP_TOKEN', 'a1FxB+uQT1QRbel3+SkMw2PiI6rtoa2ivJjLq2eVEz4=')

@app.post("/api/admin/init-schema")
async def init_schema(request: Request):
    token = request.headers.get("X-Setup-Token")
    if token != SETUP_TOKEN:
        raise HTTPException(status_code=403, detail="Unauthorized")
    try:
        Base.metadata.create_all(bind=engine)
        return {"success": True, "message": "Schema created/updated successfully."}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)