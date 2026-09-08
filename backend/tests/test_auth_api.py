import unittest
import sys
import os
from fastapi.testclient import TestClient

# Adjust path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from models.database import init_db

class TestAuthAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize SQLite DB and seed default users
        init_db()
        cls.client = TestClient(app)

    def test_login_success_admin(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "password123"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")
        self.assertEqual(data["role"], "SecurityAdmin")

    def test_login_success_analyst(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "analyst", "password": "password123"}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["role"], "FraudAnalyst")

    def test_login_failed_wrong_password(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "admin", "password": "wrongPassword123"}
        )
        self.assertEqual(response.status_code, 401)
        data = response.json()
        self.assertIn("detail", data)

    def test_login_failed_invalid_username(self):
        response = self.client.post(
            "/api/auth/login",
            json={"username": "non_existent_operator", "password": "password123"}
        )
        self.assertEqual(response.status_code, 401)

if __name__ == "__main__":
    unittest.main()
