from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Document
import threading
import time

bp = Blueprint("ingestion", __name__, url_prefix="/ingestion")

# In-memory store for ingestion status (for demo; use DB for production)
ingestion_status = {}

def fake_ingest(doc_id):
    ingestion_status[doc_id] = "processing"
    time.sleep(5)  # Simulate ingestion work
    ingestion_status[doc_id] = "completed"

@bp.route("/trigger/<int:doc_id>", methods=["POST"])
@jwt_required()
def trigger_ingestion(doc_id):
    doc = Document.query.get_or_404(doc_id)
    if ingestion_status.get(doc_id) == "processing":
        return {"msg": "Ingestion already in progress"}, 409
    # Start ingestion in a background thread
    threading.Thread(target=fake_ingest, args=(doc_id,)).start()
    return {"msg": "Ingestion started", "doc_id": doc_id}

@bp.route("/status/<int:doc_id>", methods=["GET"])
@jwt_required()
def ingestion_status_api(doc_id):
    status = ingestion_status.get(doc_id, "not started")
    return {"doc_id": doc_id, "status": status}
