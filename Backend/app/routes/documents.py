import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Document
from app.utils import role_required
from app.ingestion_worker import celery
from flask_cors import CORS

bp = Blueprint("documents", __name__, url_prefix="/documents")
CORS(bp)  # bp is your Blueprint instance

ALLOWED_EXTENSIONS = {"pdf"}
job_to_doc = {}  # job_id -> doc_id mapping
@bp.route('/ingestion/jobs/<string:job_id>', methods=['GET'])
@jwt_required()
def get_job_status(job_id):
    task = celery.AsyncResult(job_id)
    status = task.status

    def map_status(status, result):
        if status == 'PENDING':
            return 'Pending'
        elif status == 'SUCCESS':
            # Check the result returned by the Celery task
            if isinstance(result, dict) and result.get("status") == "uploaded":
                return 'Ingested'
            else:
                return 'Unknown'
        elif status == 'FAILURE':
            return 'Failed'
        else:
            return status or 'Unknown'

    mapped_status = map_status(status, task.result)

    if status == 'SUCCESS':
        return jsonify({'status': mapped_status, 'result': task.result}), 200
    elif status == 'FAILURE':
        return jsonify({'status': mapped_status, 'error': str(task.result)}), 500
    elif status == 'PENDING':
        return jsonify({'status': mapped_status}), 200
    else:
        return jsonify({'status': mapped_status}), 200


@bp.route('/ingestion/trigger', methods=['POST'])
@jwt_required()
def trigger_ingestion():
    data = request.get_json()
    doc_id = data.get('doc_id')
    if not doc_id:
        return jsonify({'error': 'doc_id is required'}), 400

    # Trigger the Celery task
    task = celery.send_task('process_document', args=[doc_id])
    job_to_doc[task.id] = doc_id

    return jsonify({'task_id': task.id, 'status': 'pending'}), 202
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route("/", methods=["POST"])
@jwt_required()
def upload_document():
    print("request.content_type:", request.content_type)
    print("request.form:", request.form)
    print("request.files:", request.files)
    data = request.form
    file = request.files.get("file")
    title = request.form["title"]
    if not file or not title:
        print("Missing file or title")
        return {"msg": "Title and file required"}, 400
    if not allowed_file(file.filename):
        return {"msg": "Only PDF files are allowed"}, 400
    filename = file.filename
    print("Uploading file:", filename)
    path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
    os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
    file.save(path)
    doc = Document(title=title, filename=filename)
    db.session.add(doc)
    db.session.commit()
    print("Document uploaded:", doc.id)
    return {"msg": "Document uploaded", "id": doc.id}, 201

@bp.route("/", methods=["GET"])
@jwt_required()
def list_documents():
    docs = Document.query.all()
    return jsonify([{"id": d.id, "title": d.title, "filename": d.filename} for d in docs])

@bp.route("/<int:doc_id>", methods=["GET"])
@jwt_required()
def get_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    return jsonify({"id": doc.id, "title": doc.title, "filename": doc.filename})

@bp.route("/<int:doc_id>", methods=["DELETE"])
@role_required("admin")
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    db.session.delete(doc)
    db.session.commit()
    return {"msg": "Document deleted"}

@bp.route("/<int:doc_id>", methods=["PUT"])
@role_required("admin")
@jwt_required()
def update_document(doc_id):
    print("request.form:", request.form)
    print("request.files:", request.files)
    doc = Document.query.get_or_404(doc_id)
    data = request.form
    file = request.files.get("file")
    updated = False

    if "title" in data:
        print("Updating title:",data["title"])
        doc.title = data["title"]
        updated = True

    if file:
        filename = file.filename
        path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
        os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(path)
        doc.filename = filename
        updated = True

    if updated:
        db.session.commit()
        return {"msg": "Document updated"}
    else:
        return {"msg": "No changes provided"}, 400

@bp.route("/<int:doc_id>/download", methods=["GET"])
@jwt_required()
def download_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    upload_folder = current_app.config["UPLOAD_FOLDER"]
    full_path = os.path.join(upload_folder, doc.filename)
    print("UPLOAD_FOLDER:", upload_folder)
    print("doc.filename:", doc.filename)
    print("Full path:", full_path)
    print("File exists:", os.path.exists(full_path))
    return send_from_directory(upload_folder, doc.filename, as_attachment=True)

@bp.route('/ingestion/status/by_doc/<int:doc_id>', methods=['GET'])
@jwt_required()
def get_job_status_by_doc_id(doc_id):
    # Find the job_id for this doc_id
    job_id = None
    for k, v in job_to_doc.items():
        if v == doc_id:
            job_id = k
            break
    if not job_id:
        return jsonify({'error': 'No job found for this document'}), 404
    # Reuse your existing status logic
    task = celery.AsyncResult(job_id)
    status = task.status

    def map_status(status, result):
        if status == 'PENDING':
            return 'Pending'
        elif status == 'SUCCESS':
            if isinstance(result, dict) and result.get("status") == "uploaded":
                return 'Ingested'
            else:
                return 'Unknown'
        elif status == 'FAILURE':
            return 'Failed'
        else:
            return status or 'Unknown'

    mapped_status = map_status(status, task.result)

    if status == 'SUCCESS':
        return jsonify({'status': mapped_status, 'result': task.result}), 200
    elif status == 'FAILURE':
        return jsonify({'status': mapped_status, 'error': str(task.result)}), 500
    elif status == 'PENDING':
        return jsonify({'status': mapped_status}), 200
    else:
        return jsonify({'status': mapped_status}), 200

