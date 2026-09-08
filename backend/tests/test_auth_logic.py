import unittest
import sys
import os

# Adjust path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.user import get_password_hash, verify_password

class TestAuthLogic(unittest.TestCase):
    def test_password_hashing(self):
        plain_password = "securePassword123"
        hashed = get_password_hash(plain_password)
        
        # Hash should not match plaintext
        self.assertNotEqual(plain_password, hashed)
        
        # Verify correct password
        self.assertTrue(verify_password(plain_password, hashed))
        
        # Verify incorrect password fails
        self.assertFalse(verify_password("wrongPassword", hashed))

if __name__ == "__main__":
    unittest.main()
