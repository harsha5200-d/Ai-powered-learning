"""
StudyQ Backend – Test Suite
Run with: python -m pytest test_api.py -v
"""
import json
import io
import unittest

from app import create_app
from models import db as _db


# ── Minimal test config using in-memory SQLite ─────────────────────────────
class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "test-secret-key"
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
    ALLOWED_EXTENSIONS = {"pdf"}
    GEMINI_API_KEY = ""
    CORS_ORIGINS = ["http://localhost:5173"]


def make_app():
    return create_app(TestConfig)


# ── Base test case ─────────────────────────────────────────────────────────
class BaseTestCase(unittest.TestCase):
    def setUp(self):
        self.app = make_app()
        self.client = self.app.test_client()
        with self.app.app_context():
            _db.create_all()

    def tearDown(self):
        with self.app.app_context():
            _db.drop_all()

    def register(self, username="alice", email="alice@test.com", password="password123"):
        return self.client.post(
            "/api/auth/register",
            data=json.dumps({"username": username, "email": email, "password": password}),
            content_type="application/json",
        )

    def login(self, email="alice@test.com", password="password123"):
        return self.client.post(
            "/api/auth/login",
            data=json.dumps({"email": email, "password": password}),
            content_type="application/json",
        )

    def get_token(self):
        self.register()
        res = self.login()
        return json.loads(res.data)["data"]["token"]


# ── Auth tests ─────────────────────────────────────────────────────────────
class TestAuth(BaseTestCase):

    def test_health(self):
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["status"], "ok")

    def test_register_success(self):
        res = self.register()
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertTrue(data["success"])
        self.assertIn("token", data["data"])

    def test_register_duplicate_email(self):
        self.register()
        res = self.register()
        self.assertEqual(res.status_code, 409)

    def test_register_short_password(self):
        res = self.register(password="short")
        self.assertEqual(res.status_code, 422)
        data = json.loads(res.data)
        self.assertIn("password", data["errors"])

    def test_register_invalid_email(self):
        res = self.register(email="not-an-email")
        self.assertEqual(res.status_code, 422)
        data = json.loads(res.data)
        self.assertIn("email", data["errors"])

    def test_login_success(self):
        self.register()
        res = self.login()
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertIn("token", data["data"])

    def test_login_wrong_password(self):
        self.register()
        res = self.login(password="wrongpassword")
        self.assertEqual(res.status_code, 401)

    def test_login_unknown_email(self):
        res = self.login(email="nobody@test.com")
        self.assertEqual(res.status_code, 401)

    def test_me_authenticated(self):
        token = self.get_token()
        res = self.client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data["data"]["email"], "alice@test.com")

    def test_me_unauthenticated(self):
        res = self.client.get("/api/auth/me")
        self.assertEqual(res.status_code, 401)


# ── Upload tests ───────────────────────────────────────────────────────────
class TestUpload(BaseTestCase):

    def _minimal_pdf_bytes(self):
        """Returns bytes of the smallest valid PDF."""
        return (
            b"%PDF-1.4\n"
            b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
            b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
            b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n"
            b"4 0 obj<</Length 44>>stream\nBT /F1 12 Tf 100 700 Td (Hello World) Tj ET\nendstream\nendobj\n"
            b"5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n"
            b"xref\n0 6\n"
            b"0000000000 65535 f \n"
            b"0000000009 00000 n \n"
            b"0000000058 00000 n \n"
            b"0000000115 00000 n \n"
            b"0000000266 00000 n \n"
            b"0000000360 00000 n \n"
            b"trailer<</Size 6/Root 1 0 R>>\n"
            b"startxref\n452\n%%EOF"
        )

    def test_upload_no_auth(self):
        pdf = self._minimal_pdf_bytes()
        data = {"file": (io.BytesIO(pdf), "test.pdf", "application/pdf")}
        res = self.client.post("/api/upload", data=data, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 401)

    def test_upload_no_file(self):
        token = self.get_token()
        res = self.client.post(
            "/api/upload",
            headers={"Authorization": f"Bearer {token}"},
            data={},
            content_type="multipart/form-data",
        )
        self.assertEqual(res.status_code, 400)

    def test_upload_wrong_extension(self):
        token = self.get_token()
        data = {"file": (io.BytesIO(b"not a pdf"), "doc.txt", "text/plain")}
        res = self.client.post(
            "/api/upload",
            headers={"Authorization": f"Bearer {token}"},
            data=data,
            content_type="multipart/form-data",
        )
        self.assertEqual(res.status_code, 400)

    def test_list_documents_empty(self):
        token = self.get_token()
        res = self.client.get(
            "/api/documents",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.data)["data"], [])


# ── Analytics tests ────────────────────────────────────────────────────────
class TestAnalytics(BaseTestCase):

    def test_summary_empty(self):
        token = self.get_token()
        res = self.client.get(
            "/api/analytics/summary",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)["data"]
        self.assertEqual(data["total_attempts"], 0)

    def test_history_empty(self):
        token = self.get_token()
        res = self.client.get(
            "/api/analytics/history",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.data)["data"], [])

    def test_trends_empty(self):
        token = self.get_token()
        res = self.client.get(
            "/api/analytics/trends",
            headers={"Authorization": f"Bearer {token}"},
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(json.loads(res.data)["data"], [])


if __name__ == "__main__":
    unittest.main()
