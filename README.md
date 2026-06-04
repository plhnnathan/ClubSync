# ⚽ ClubSync

<div align="center">

### Football Club Management and Performance Analysis Platform

Academic project developed for the **Web Application Architecture** course.

ClubSync helps football clubs manage players, games, match reports, and user access through a RESTful API integrated with MongoDB.

![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-brightgreen)
![Jest](https://img.shields.io/badge/Jest-Testing-red)

</div>

---

## 📖 Overview

ClubSync is a web application designed to support football clubs in managing player information, match records, performance reports, and user permissions.

The project was built to demonstrate key concepts of modern web application development, including:

- RESTful API Design
- MongoDB Integration
- JWT Authentication
- Role-Based Access Control (RBAC)
- OpenAPI / Swagger Documentation
- Unit Testing
- SOLID Principles
- Asynchronous Frontend Communication

---

## ✨ Main Features

### 👥 Player Management

- Create players
- Update player information
- Delete players
- View player profiles
- Access player statistics

### ⚽ Game Management

- Register games
- Update game information
- Remove games
- Retrieve game records

### 📊 Match Reports

- Create performance reports
- Associate reports with players
- Retrieve player report history
- Update report information

### 🏟️ Club Management

- View club information
- Manage club members
- Update club settings

### 🔐 Authentication & Authorization

- User registration
- User login
- JWT Authentication
- Role-Based Access Control

---

## 🛠️ Technology Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- MongoDB
- Mongoose ODM

### Security

- JSON Web Tokens (JWT)

### Testing

- Jest

### Documentation

- Swagger / OpenAPI

### Frontend

- HTML
- CSS
- JavaScript

---

## 📂 Project Structure

```text
src/
├── config/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── __tests__/
└── server.ts

public/
├── css/
├── js/
└── index.html
```

---

## 🚀 Installation

### 📋 Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas or local MongoDB instance

### 📥 Clone Repository

```bash
git clone https://github.com/plhnnathan/ClubSync.git
cd ClubSync
```

### 📦 Install Dependencies

```bash
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

JWT_EXPIRES_IN=1d
```

---

## ▶️ Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

---

## 🧪 Running Tests

```bash
npm test
```

The project includes automated tests for service-layer business logic.

---

## 📚 API Documentation

Swagger documentation is available after starting the application:

```text
http://localhost:3000/api-docs
```

Swagger provides:

- Endpoint documentation
- Request schemas
- Response examples
- Authentication requirements
- Interactive testing interface

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| POST   | /api/auth/analysts |

### Players

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/players           |
| GET    | /api/players/:id       |
| GET    | /api/players/:id/stats |
| POST   | /api/players           |
| PATCH  | /api/players/:id       |
| DELETE | /api/players/:id       |

### Games

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /api/games     |
| GET    | /api/games/:id |
| POST   | /api/games     |
| PATCH  | /api/games/:id |
| DELETE | /api/games/:id |

### Match Reports

| Method | Endpoint                            |
| ------ | ----------------------------------- |
| GET    | /api/match-reports                  |
| GET    | /api/match-reports/:id              |
| GET    | /api/match-reports/player/:playerId |
| POST   | /api/match-reports                  |
| PATCH  | /api/match-reports/:id              |
| DELETE | /api/match-reports/:id              |

### Club

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/club         |
| GET    | /api/club/members |
| PATCH  | /api/club         |

---

## 🛡️ Security Features

- JWT Authentication
- Protected Routes
- Role-Based Authorization
- Password Hashing
- Middleware-Based Access Control

---

## 🎓 Academic Objectives

This project demonstrates:

- REST API Development
- NoSQL Database Usage
- Authentication and Authorization
- API Documentation
- Unit Testing
- Software Architecture Best Practices

---

## 👨‍💻 Author

**Nathan Chaia** | [LinkedIn](www.linkedin.com/in/plhnathan)

Web Application Architecture – Academic Project

2026
