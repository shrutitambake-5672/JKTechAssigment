from flask import Blueprint, request, jsonify
from app import db
from app.models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or "username" not in data or "password" not in data:
        return {"msg": "Username and password required"}, 400

    if User.query.filter_by(username=data["username"]).first():
        return {"msg": "Username already exists"}, 409

    #role = data.get("role", "viewer")  # Default role is 'viewer' if not provided
    user = User(username=data["username"])
    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return {"msg": "User registered"}, 201

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data["username"]).first()
    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        })
    return {"msg": "Invalid credentials"}, 401

@bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    # For real blacklisting, store the JWT jti in a blacklist here
    return {"msg": "Logout successful"}, 200
