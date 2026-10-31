# LearnHub – React + Spring MVC + MySQL

1. **Database**: `mysql -u root -p < db/schema.sql`
2. **Backend** (Java 17, Maven): edit `backend/src/main/resources/application.properties` (DB password), then
   `cd backend && mvn spring-boot:run`  → http://localhost:8080
3. **Frontend** (Node 18+): `cd frontend && npm install && npm run dev` → http://localhost:5173

Features: register/login (BCrypt + bearer token), course catalog, enrollment, server-graded quizzes, progress dashboard.

REST API: POST /api/auth/register|login · GET /api/courses, /api/courses/{id} · POST /api/courses/{id}/enroll, /api/courses/{id}/quiz · GET /api/me/enrollments
