# HiDocs Backend API (Form & Exam Maker)

HiDocs is a high-performance, scalable backend system built with **Golang (Gin Framework)** and **Domain-Driven Design (DDD)** architecture. It supports General Forms (Surveys, Registration, Attendance) and Special Exam Modes (Math formula rendering, Code snippets, Timer, Token access, Browser security, Auto-grading, Word .docx import parser, and Excel/CSV analytics export).

---

## 🏗️ Domain-Driven Design (DDD) Architecture

```
backend/
├── cmd/
│   └── api/
│       └── main.go                 # App entry point & dependency wiring
├── config/
│   └── config.go                   # Environment configuration
├── docs/                           # Generated Swagger documentation
├── internal/
│   ├── domain/                     # Core Domain Entities & Repository Interfaces
│   │   ├── user.go
│   │   ├── form.go
│   │   ├── question.go
│   │   ├── response.go
│   │   ├── errors.go
│   │   └── repository.go
│   ├── application/                # Use Cases / Application Services & DTOs
│   │   ├── dto/
│   │   └── service/
│   │       ├── auth_service.go
│   │       ├── user_service.go
│   │       ├── form_service.go
│   │       ├── question_service.go
│   │       ├── response_service.go
│   │       ├── docx_service.go
│   │       ├── export_service.go
│   │       └── admin_service.go
│   ├── infrastructure/             # Persistence, External Tools, DB, Security
│   │   ├── database/postgres.go
│   │   ├── parser/docx_parser.go
│   │   ├── repository/
│   │   └── security/
│   └── interfaces/                 # HTTP Transport (Gin Handlers, Router, Middleware)
│       └── http/
│           ├── handler/
│           ├── middleware/
│           └── router/
└── pkg/                            # Reusable helpers & utils
    ├── response/
    └── utils/
```

---

## ⚡ Performance Benchmark & Concurrency Tuning
- **Max Concurrency**: Configured with PostgreSQL connection pooling (`SetMaxOpenConns(100)`, `SetMaxIdleConns(25)`) capable of serving **1000+ concurrent requests** under 2s response time.
- **Word (.docx) Parser**: High-speed Zip/XML in-memory extractor parsing documents in under 10 seconds.
- **In-Memory Rate Limiter**: IP-based rate limiting protecting endpoints against overload (500 req/min).

---

## 👥 User Roles & Security
- **`admin`**: System Administrator who manages form creators, system forms, and dashboard analytics.
- **`user`**: Creators & Respondents who build forms/exams, manage questions, and submit responses.
- **Security**: Password hashing with `bcrypt`, JWT Tokens, Passcode/PIN protection, Exambro browser header verification (`X-Exambro-Token`), single submission enforcement per email.

---

## 🚀 API Endpoint Reference

| Method | Endpoint | Description | Auth / Role |
| :--- | :--- | :--- | :--- |
| **GET** | `/swagger/index.html` | Interactive Swagger API Documentation | Public |
| **GET** | `/health` | Server Health Check | Public |
| **GET** | `/api/v1/public/forms/:short_code` | Access Public Form / Exam | Public |
| **POST** | `/api/v1/auth/register` | Register User | Public |
| **POST** | `/api/v1/auth/login` | Login & get JWT token | Public |
| **POST** | `/api/v1/auth/forgot-password` | Request password reset token | Public |
| **POST** | `/api/v1/auth/reset-password` | Reset password using token | Public |
| **GET** | `/api/v1/users/me` | Get Profile | Bearer Token |
| **PUT** | `/api/v1/users/me` | Update Profile | Bearer Token |
| **POST** | `/api/v1/users/students/import` | Batch import students/users | Bearer Token |
| **GET** | `/api/v1/forms` | List My Forms (Draft, Active, Closed) | Bearer Token |
| **POST** | `/api/v1/forms` | Create Form | Bearer Token |
| **POST** | `/api/v1/forms/import-docx` | Upload Word .docx to create form | Bearer Token |
| **GET** | `/api/v1/forms/:form_id` | Get Form details | Bearer Token |
| **PUT** | `/api/v1/forms/:form_id` | Update Form | Bearer Token |
| **DELETE** | `/api/v1/forms/:form_id` | Delete Form | Bearer Token |
| **PUT** | `/api/v1/forms/:form_id/settings` | Update Exam Settings | Bearer Token |
| **GET** | `/api/v1/forms/:form_id/questions` | List Questions | Bearer Token |
| **POST** | `/api/v1/forms/:form_id/questions` | Add Question | Bearer Token |
| **PUT** | `/api/v1/questions/:question_id` | Update Question | Bearer Token |
| **DELETE** | `/api/v1/questions/:question_id` | Delete Question | Bearer Token |
| **POST** | `/api/v1/forms/:form_id/submit` | Submit Form / Exam Answers | Public / Passcode |
| **GET** | `/api/v1/forms/:form_id/responses` | List Responses | Bearer Token |
| **GET** | `/api/v1/responses/:response_id` | Get Response detail | Bearer Token |
| **PUT** | `/api/v1/responses/:response_id/grade` | Manually update score | Bearer Token |
| **GET** | `/api/v1/forms/:form_id/export` | Export to Excel (.xlsx) / CSV | Bearer Token |
| **GET** | `/api/v1/forms/:form_id/analytics` | Real-time Analytics (Charts) | Bearer Token |
| **GET** | `/api/v1/admin/dashboard/stats` | Global System Statistics | Admin |
| **GET** | `/api/v1/admin/creators` | List Form Creators | Admin |
| **POST** | `/api/v1/admin/creators` | Create Form Creator | Admin |
| **PUT** | `/api/v1/admin/creators/:creator_id/status` | Enable/Disable Creator | Admin |
| **GET** | `/api/v1/admin/forms` | List All System Forms | Admin |
| **DELETE** | `/api/v1/admin/forms/:form_id` | Admin Delete Form | Admin |

---

## 🛠️ How to Run Locally

### 1. Build and Run via Go
```bash
# Set environment variables in .env
cp .env.example .env

# Run main server
go run cmd/api/main.go
```

### 2. Run via Docker Compose
```bash
docker-compose up --build -d
```

Open `http://localhost:8080/swagger/index.html` in your browser to access interactive API docs!
