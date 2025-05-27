import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Document
from app.utils import role_required
bp = Blueprint("documents", __name__, url_prefix="/documents")

@bp.route("/uuui", methods=["POST"])
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
