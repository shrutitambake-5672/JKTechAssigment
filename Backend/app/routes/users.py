from flask import Blueprint, request, jsonify
from app.models import User
from app import db
from app.utils import role_required

bp = Blueprint("users", __name__, url_prefix="/users")

@bp.route("/", methods=["GET"])
@role_required("admin")
def list_users():
    users = User.query.all()
    return jsonify([{"id": u.id, "username": u.username, "role": u.role} for u in users])

@bp.route("/<int:user_id>", methods=["GET"])
@role_required("admin")
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return jsonify({"id": user.id, "username": user.username, "role": user.role})

@bp.route("/", methods=["POST"])
@role_required("admin")
def create_user():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data or "role" not in data:
        return {"msg": "Username, password, and role required"}, 400
    if User.query.filter_by(username=data["username"]).first():
        return {"msg": "Username already exists"}, 409
    user = User(username=data["username"], role=data["role"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username, "role": user.role}), 201

@bp.route("/<int:user_id>", methods=["PUT"])
@role_required("admin")
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    if "username" in data:
        user.username = data["username"]
    if "role" in data:
        user.role = data["role"]
    # if "password" in data:
    #     user.set_password(data["password"])
    db.session.commit()
    return jsonify({"id": user.id, "username": user.username, "role": user.role})

@bp.route("/<int:user_id>", methods=["DELETE"])
@role_required("admin")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return {"msg": "User deleted"}
