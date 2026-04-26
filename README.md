🌱 EcoTrack Pro
Make sustainability a game. Make impact real. 🌍
Built for HackForge 2.0


EcoTrack Cover

EcoTrack Pro is a gamified, production-ready campus sustainability platform designed to convert eco-friendly actions into fun, rewarding habits. By bridging real-world carbon offset with engaging student-driven leaderboards, we gamify saving the planet.

✨ Key Features
🎮 Gamification Engine
Log Activities: Tell the app you rode a bike instead of taking an auto. Earn dynamic points and track real kg CO₂ saved.
Smart Rewards: Auto-unlock achievement badges for breaking milestones (e.g., 50 points, 10 activities).
Campus Leaderboard: Compete against different departments and students to be the top eco-warrior.
🛡️ Strictly Secure Admin Controls
Role-Based Access (RBAC): Backend-enforced authorization ensures no student can self-assign as an Admin.
Intelligent Tickets: Report broken campus infrastructure (like leaking pipes). Fix it, upload photo-proof, and await manual Admin Verification to claim heavy bonus points.
Control Dashboard: Exclusive dashboard for admins to manage users, reset lost passwords securely, and track platform health.
💎 Premium User Experience
3D Landing Page: Immersive perspective-tilt card animations built using Framer Motion.
Dynamic Analytics: Recharts integration displaying carbon footprints converted into visual equivalents (trees planted, cars off the road).
Glassmorphism Design: A stunning Light/Dark user interface using CSS Variables and responsive design.
🛠️ Tech Stack
Frontend
React 18 (Vite)
Framer Motion (Complex 3D Animations & Micro-interactions)
Recharts (Data Visualization)
Axios (Secure API Intercepting)
Backend
Node.js & Express
MongoDB & Mongoose (Database Architecture)
JWT & bcryptjs (Encrypted sessions & authentication)
Multer (Local file uploads for verification proofs)
🚀 Quick Start Guide
1. Prerequisites
Ensure you have Node.js and MongoDB installed on your system.

2. Backend Setup
cd backend
npm install
Create a .env file in the /backend folder:

PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecotrack
JWT_SECRET=your_super_secret_jwt_key
Start the backend server:

node server.js
3. Frontend Setup
Open a new terminal window:

npm install
npm run dev
The application will launch locally at http://localhost:5173.

🔒 Security Architecture
EcoTrack Pro takes security seriously:

API Interceptors: All authenticated requests automatically format Authorization: Bearer <token> in the background.
Hardened Backends: Direct fetch logic is removed from Gamification state. The local React state only populates from secure database echoes.
Admin Verification: Ticket resolutions are not blindly rewarded. A student must upload a proof of resolution photo, which stays queued until a campus Admin approves it.
🏗️ Folder Structure
eco-track/
├── backend/
│   ├── middleware/   # JWT Auth & Multer Upload Logic
│   ├── models/       # Mongoose Schemas (User, Ticket, Task)
│   ├── routes/       # Express API Endpoints
│   ├── uploads/      # Proof photo storage
│   └── server.js     # Initialization
├── src/
│   ├── components/   # Modular React UI (GlassCards, Navbar, etc)
│   ├── context/      # Token Context Mgmt
│   ├── hooks/        # Gamification (useEcoData)
│   ├── pages/        # Route Views (AdminPanel, Tickets, 3D Home)
│   ├── utils/        # API Configuration & Math calculations
│   └── App.jsx       # Route Protection rules
Engineered with 💚 for Campus Sustainability.
