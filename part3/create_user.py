from app import create_app, db
from app.models.user import User

# Créer l'app et initialiser le contexte
app = create_app()

with app.app_context():
    try:
        # Créer un utilisateur
        user = User(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            password="secret123",     # sera hashé automatiquement via @validates
            is_admin=False
        )

        db.session.add(user)
        db.session.commit()

        print(f"✅ Utilisateur {user.email} créé avec succès.")
    except Exception as e:
        print(f"❌ Erreur : {e}")

