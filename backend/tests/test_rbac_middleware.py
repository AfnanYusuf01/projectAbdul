import unittest
import sys
import os
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from models.database import init_db, SessionLocal, DBTransaction
from services import crypto_helper

class TestRBACMiddleware(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Initialize DB and seed default users
        init_db()
        cls.client = TestClient(app)
        
        # Authenticate all 3 roles to get Bearer tokens
        cls.admin_headers = cls.get_headers("admin")
        cls.analyst_headers = cls.get_headers("analyst")
        cls.operator_headers = cls.get_headers("operator")

        # Create a mock transaction to test decryption
        cls.db = SessionLocal()
        cls.mock_tx = DBTransaction(
            transaction_id="TX-RBAC-TEST-999",
            customer_id="CUST-RBAC",
            amount=500000.0,
            channel="QRIS",
            encrypted_payload="dummy_ciphertext",
            encrypted_session_key="dummy_session_key",
            iv="dummy_iv",
            tag="dummy_tag",
            status="SUCCESS"
        )
        cls.db.add(cls.mock_tx)
        cls.db.commit()
        cls.db.refresh(cls.mock_tx)

    @classmethod
    def tearDownClass(cls):
        cls.db.query(DBTransaction).filter(DBTransaction.transaction_id == "TX-RBAC-TEST-999").delete()
        cls.db.commit()
        cls.db.close()

    @classmethod
    def get_headers(cls, username: str) -> dict:
        r = cls.client.post("/api/auth/login", json={"username": username, "password": "password123"})
        token = r.json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_unauthenticated_access_blocked(self):
        # Accessing rules without authorization headers should fail with 401
        response = self.client.get("/api/rules")
        self.assertEqual(response.status_code, 401)

    def test_rules_read_allowed_for_all_authenticated(self):
        # All authenticated users should be able to view rules
        for headers in [self.admin_headers, self.analyst_headers, self.operator_headers]:
            response = self.client.get("/api/rules", headers=headers)
            self.assertEqual(response.status_code, 200)

    def test_rules_write_restricted_to_admin(self):
        # Operator tries to toggle rule - should get 403 Forbidden
        response = self.client.put(
            "/api/rules/1/toggle", 
            json={"is_active": False}, 
            headers=self.operator_headers
        )
        self.assertEqual(response.status_code, 403)

        # Analyst tries to toggle rule - should get 403 Forbidden
        response = self.client.put(
            "/api/rules/1/toggle", 
            json={"is_active": False}, 
            headers=self.analyst_headers
        )
        self.assertEqual(response.status_code, 403)

        # Admin tries to toggle rule - should get 200 Success
        response = self.client.put(
            "/api/rules/1/toggle", 
            json={"is_active": True}, 
            headers=self.admin_headers
        )
        self.assertEqual(response.status_code, 200)

    def test_decryption_restricted_to_analyst(self):
        # Operator tries to decrypt - 403 Forbidden
        response = self.client.post(
            f"/api/transactions/{self.mock_tx.id}/decrypt",
            headers=self.operator_headers
        )
        self.assertEqual(response.status_code, 403)

        # Super Admin (SecurityAdmin) tries to decrypt - passes 403 RBAC check (400 due to dummy test key)
        response = self.client.post(
            f"/api/transactions/{self.mock_tx.id}/decrypt",
            headers=self.admin_headers
        )
        self.assertEqual(response.status_code, 400)
        # Analyst tries to decrypt - 400 (or 200 if key is valid, but mock tx has invalid crypto key)
        # Because the dummy keys are invalid, it throws a decryption error which returns 400,
        # but the request passes the 403 RBAC check! If it was blocked by RBAC it would be 403.
        # This confirms the Analyst bypassed the RBAC guard!
        response = self.client.post(
            f"/api/transactions/{self.mock_tx.id}/decrypt",
            headers=self.analyst_headers
        )
        self.assertEqual(response.status_code, 400)

if __name__ == "__main__":
    unittest.main()
