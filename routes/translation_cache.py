from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from database import get_db
from models import TranslationCache

router = APIRouter(prefix="/api/translation-cache", tags=["translation-cache"])

@router.post("/batch-get", response_model=Dict[str, str])
def batch_get_translations(
    items: List[Dict[str, str]],  # [{"text": ..., "source_lang": ..., "target_lang": ...}, ...]
    db: Session = Depends(get_db)
):
    result = {}
    for item in items:
        cache = db.query(TranslationCache).filter_by(
            original_text=item["text"],
            source_lang=item["source_lang"],
            target_lang=item["target_lang"]
        ).first()
        if cache:
            result[item["text"]] = cache.translated_text
    return result

@router.post("/save", response_model=bool)
def save_translation(
    item: Dict[str, str],  # {"text": ..., "source_lang": ..., "target_lang": ..., "translated_text": ...}
    db: Session = Depends(get_db)
):
    cache = db.query(TranslationCache).filter_by(
        original_text=item["text"],
        source_lang=item["source_lang"],
        target_lang=item["target_lang"]
    ).first()
    if cache:
        cache.translated_text = item["translated_text"]
    else:
        cache = TranslationCache(
            original_text=item["text"],
            source_lang=item["source_lang"],
            target_lang=item["target_lang"],
            translated_text=item["translated_text"]
        )
        db.add(cache)
    db.commit()
    return True 