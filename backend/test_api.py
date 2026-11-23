import unittest

from fastapi.testclient import TestClient

from main import app


class PortfolioApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        self.assertEqual(self.client.get("/api/health").json(), {"status": "ok"})

    def test_catalog_and_categories(self):
        all_projects = self.client.get("/api/projects").json()
        for category in ("music", "builds"):
            expected = [project for project in all_projects if project["category"] == category]
            self.assertTrue(expected)
            self.assertEqual(self.client.get(f"/api/projects?category={category}").json(), expected)
        self.assertEqual(self.client.get("/api/projects?category=unknown").status_code, 422)

    def test_project_details(self):
        project = self.client.get("/api/projects").json()[0]
        self.assertEqual(self.client.get(f"/api/projects/{project['id']}").json(), project)
        self.assertEqual(self.client.get("/api/projects/missing").status_code, 404)

    def test_cors(self):
        localhost = "http://localhost:5173"
        response = self.client.get("/api/projects", headers={"Origin": localhost})
        self.assertEqual(response.headers["access-control-allow-origin"], localhost)
        response = self.client.get("/api/projects", headers={"Origin": "https://untrusted.example"})
        self.assertNotIn("access-control-allow-origin", response.headers)
