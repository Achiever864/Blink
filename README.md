# Blink

> A modern social communication platform built to make connecting, sharing, and communicating with people simple and engaging.

## 🚀 Overview

**Blink** is a full-stack social platform designed around communication and interaction between users.

The application allows users to create accounts, connect with other users, share posts, interact with content, and communicate through real-time conversations.

The project was built as a hands-on full-stack application, with a focus on building the backend architecture, authentication, database relationships, messaging system, media handling, and responsive frontend experience.

---

# 🛠️ Tech Stack

## Frontend

* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Router
* Lucide React

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT

## Services
* Cloudinary — media storage
* Brevo — transactional emails
* Redis — caching / temporary data where applicable

---

# 🏗️ Project Structure

```text
Blink/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
|   |   ├── utils/
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

# 🚀 Getting Started

Follow the steps below to run Blink locally.

## Prerequisites

Make sure you have the following installed:
* [Node.js](https://nodejs.org/)
* npm
* Git
* MongoDB account/database

You will also need accounts for any external services used by the application, such as Cloudinary and Brevo.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Achiever864/Blink

cd Blink
```

---

# ⚙️ Backend Setup

Navigate into the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

### Environment Variables
Create a `.env` file inside the `backend` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url #optional parameter

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_URL=your_cloudinary_url

METERED_API_KEY=your_metered_api_key  #for TURN servers for calling

BREVO_API_KEY=your_brevo_api_key
```


Start the backend:

```bash
npm run dev
```

The backend should now be running on:

```text
http://localhost:4000
```

---

# 💻 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000 #this should be aligned with the same port you used to setup the backend
```

Start the frontend:

```bash
npm run dev
```

The frontend should now be available at:

```text
http://localhost:5173
```

---

# 🔄 How Blink Works

Blink follows a client-server architecture.

```text
                ┌──────────────────┐
                │     Blink UI     │
                │ React + Vite     │
                └────────┬─────────┘
                         │
                         │ HTTP / API
                         ▼
                ┌──────────────────┐
                │   Express API    │
                │     Node.js      │
                └────────┬─────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        ┌──────────┐ ┌─────────┐ ┌───────────┐
        │ MongoDB  │ │Cloudinary│ │  Brevo    │
        │ Database │ │  Media   │ │   Email   │
        └──────────┘ └─────────┘ └───────────┘
```

The React frontend communicates with the Express backend through REST APIs.

The backend handles authentication, business logic, database operations, relationships between users, posts, conversations, and messages.

MongoDB stores application data while Cloudinary handles uploaded media.

Brevo is used for transactional emails such as password-reset emails.

---

# 💬 Messaging System

One of the core features of Blink is its messaging system.

Messages belong to conversations, allowing Blink to support both individual and group conversations.

The messaging architecture is designed to support:

* Direct conversations
* Group conversations
* Message attachments
* Read receipts
* Audio messages
* Unread message counts

---

# 👥 Recommendation System

Blink also includes a user recommendation system.

Recommendations can be generated using relationships between users, including factors such as:

* Mutual friends
* Shared interests
* Occupation
* Other user attributes

The goal is to recommend users who are more likely to be relevant to the current user rather than simply returning random users.

---

# 🧪 Running the Application

After completing the setup, you should have two development servers running:

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```


---

# 🤝 Contributing

Contributions, suggestions, and improvements are welcome.
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Commit your changes
5. Open a pull request

---

# 👨‍💻 Author

**Adeoluwa Igaga**