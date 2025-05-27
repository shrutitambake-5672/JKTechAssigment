from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_cors import CORS
import os
from celery import Celery


load_dotenv()

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'])
    db.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)
    CORS(app, origins=["http://localhost:4200"],supports_credentials=True)   # Enable CORS for all routes
    
    from app.routes import auth, users, documents, ingestion
    app.register_blueprint(auth.bp)
    app.register_blueprint(users.bp)
    app.register_blueprint(documents.bp)
    app.register_blueprint(ingestion.bp)

    return app
