# ⚽ ClubSync

<div align="center">

### Football Club Management Platform

A multi-tenant SaaS platform developed for the **Web Application Architecture** course.

Manage players, analyze match performance, generate reports, and control club operations through a secure RESTful API powered by MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Swagger](https://img.shields.io/badge/OpenAPI-Swagger-brightgreen)
![Jest](https://img.shields.io/badge/Jest-Testing-red)

</div>

---

## 📖 Overview

ClubSync is a web application designed to help football clubs manage their squads, track player performance, and analyze match data.

The project was developed to demonstrate modern backend development practices and software architecture concepts, including:

- 🌐 RESTful API Design
- 🍃 MongoDB Integration
- 🔐 JWT Authentication
- 🛡️ Role-Based Access Control (RBAC)
- 📚 OpenAPI / Swagger Documentation
- 🧪 Unit Testing
- 🏗️ SOLID Principles
- ⚡ Asynchronous Frontend Communication

---

## ✨ Features

### 👥 Player Management

- Create new players
- Update player information
- View player profiles
- Delete players
- Search and filter player records

### 📊 Match Reports

- Register match reports
- Record player performance statistics
- Track match results
- Analyze historical performance

### 🏟️ Club Management

- Manage club information
- View club members
- Update club settings

### 👤 User Management

- User registration
- Secure login
- User roles and permissions

### 🔐 Security

- JWT Authentication
- Protected routes
- Role-Based Authorization (RBAC)

---

## 🛠️ Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- MongoDB
- Mongoose

### Authentication

- JSON Web Tokens (JWT)

### Testing

- Jest

### Documentation

- Swagger / OpenAPI

### Frontend

- HTML
- CSS
- JavaScript (Fetch API)

---

## 📂 Project Structure

```text
src/
├── controllers/
├── services/
├── models/
├── routes/
├── middlewares/
├── config/
├── tests/
└── app.ts

public/
├── css/
├── js/
└── pages/
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Before running the project, make sure you have installed:

- Node.js 20+
- npm
- MongoDB Atlas account or local MongoDB instance

---

### 📥 Clone the Repository

```bash
git clone https://github.com/plhnnathan/ClubSync.git
cd ClubSync
```

---

### 📦 Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root directory.

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=1d
```

---

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

---

## 🧪 Running Tests

Execute all unit tests:

```bash
npm test
```

The project includes tests for:

- Authentication Services
- Player Services
- Match Report Services

---

## 📚 API Documentation

After starting the application, Swagger documentation is available at:

```text
http://localhost:3000/api-docs
```

Swagger provides:

- Endpoint descriptions
- Request schemas
- Response examples
- Authentication requirements
- Interactive API testing

---

## 🔐 Authentication

Login endpoint:

```http
POST /api/auth/login
```

Successful authentication returns:

```json
{
  "token": "jwt_token_here"
}
```

Protected routes require:

```http
Authorization: Bearer <token>
```

---

## 🛡️ Role-Based Access Control

ClubSync implements RBAC with multiple user roles.

| Role       | Permissions                              |
| ---------- | ---------------------------------------- |
| 👑 Admin   | Full access to all resources             |
| 📈 Analyst | Analytical and limited access operations |

Authorization is validated through JWT claims and middleware protection.

---

## 🏗️ Software Engineering Practices

This project applies several industry-standard practices:

- ✅ RESTful Architecture
- ✅ Layered Architecture
- ✅ SOLID Principles
- ✅ Dependency Injection Concepts
- ✅ OpenAPI Documentation
- ✅ Automated Testing
- ✅ Secure Authentication
- ✅ Role-Based Authorization

---

## 🎯 Academic Objectives

This project was developed as part of the **Web Application Architecture** course and demonstrates:

- API Design
- NoSQL Database Integration
- Authentication & Authorization
- Documentation Standards
- Testing Practices
- Software Architecture Principles

---

## 👨‍💻 Author

### Nathan Chaia

Academic Project — Web Application Architecture

2026

---

<div align="center">

⭐ If you found this project interesting, feel free to explore the codebase and documentation.

</div>
