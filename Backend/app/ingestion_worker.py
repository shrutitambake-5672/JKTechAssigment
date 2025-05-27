from celery import Celery
from app.services.document_service import upload_document
celery = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/0")
@celery.task(name='process_document')
def process_document(doc_id):
    print(f"[Ingestion] Processing document ID: {doc_id}")
    try:
        # Simulate document upload
        upload_status = upload_document(doc_id)
        if upload_status:
            return {"doc_id": doc_id, "status": "uploaded"}
        else:
            return {"doc_id": doc_id, "status": "upload_failed"}
    except Exception as e:
        return {"doc_id": doc_id, "status": "error", "message": str(e)}

