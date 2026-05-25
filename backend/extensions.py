"""
extensions.py — Flask extensions initialized here to avoid circular imports.
Import db, bcrypt, jwt from THIS file in all routes and models.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

db     = SQLAlchemy()
bcrypt = Bcrypt()
jwt    = JWTManager()
