from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import os
import uuid
from app.database import get_db
from app.models import User, TrainingDocument
from app import schemas, security
from app.config import get_settings
from app.training.document_processor import DocumentProcessor
from app.training.vector_store import VectorStore

settings = get_settings()
router = APIRouter(prefix="/training", tags=["training"])

vector_store = VectorStore()

ALLOWED_EXTENSIONS = {"pdf", "txt", "md", "json"}


def validate_file_extension(filename: str) -> str:
    if "." not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must have an extension"
        )
    
    ext = filename.rsplit(".", 1)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Allowed file types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    return ext


@router.post("/upload", response_model=schemas.TrainingDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File name is required"
        )
    
    file_ext = validate_file_extension(file.filename)
    
    if file.size and file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
        )
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}_{file.filename}")
    
    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)
    
    try:
        chunks, full_text = DocumentProcessor.process_document(file_path, file_ext)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing document: {str(e)}"
        )
    
    source_name = f"{file.filename}_{file_id}"
    
    try:
        chunk_count = vector_store.add_documents(
            user_id=current_user.id,
            source_name=source_name,
            chunks=chunks,
            metadata={"filename": file.filename}
        )
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error storing document in vector database: {str(e)}"
        )
    
    content_preview = full_text[:500] if full_text else ""
    
    db_document = TrainingDocument(
        user_id=current_user.id,
        filename=file.filename,
        source_name=source_name,
        file_type=file_ext,
        content_preview=content_preview,
        chunk_count=chunk_count
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    
    return {
        "id": db_document.id,
        "filename": db_document.filename,
        "source_name": db_document.source_name,
        "file_type": db_document.file_type,
        "chunk_count": db_document.chunk_count,
        "created_at": db_document.created_at
    }


@router.get("/documents", response_model=list[schemas.TrainingDocumentResponse])
async def get_documents(
    current_user: User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(TrainingDocument).filter(
        TrainingDocument.user_id == current_user.id
    ).order_by(TrainingDocument.created_at.desc()).all()
    
    return documents


@router.delete("/documents/{source_name}")
async def delete_document(
    source_name: str,
    current_user: User = Depends(security.get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(TrainingDocument).filter(
        TrainingDocument.source_name == source_name,
        TrainingDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    vector_store.delete_collection_by_source(current_user.id, source_name)
    
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}


@router.get("/test-retrieval", response_model=schemas.RetrievalTestResponse)
async def test_retrieval(
    query: str,
    current_user: User = Depends(security.get_current_user)
):
    results = vector_store.retrieve(current_user.id, query, n_results=5)
    
    return {
        "query": query,
        "results": results,
        "count": len(results)
    }
