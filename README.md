# 🎓 SmartSched AI  
### AI-Based Academic Timetable Generation System

---

## 📌 Overview

**SmartSched AI** is an intelligent academic scheduling system designed to automatically generate optimized timetables while avoiding conflicts between lecturers, rooms, and student groups.

The system uses **Artificial Intelligence (Genetic Algorithm)** to improve timetable quality and provides **smart suggestions** when conflicts occur.

---

## 🚀 Features

### ✅ Core Features
- Student, Lecturer, Room, Subject & Department Management (CRUD)
- Role-Based Access (Admin, Lecturer, Student)
- Timetable Creation & Management
- Conflict Detection (Room, Lecturer, Group)

### 🤖 AI Features
- Genetic Algorithm-based timetable generation
- Fitness-based optimization
- Conflict-free timetable generation
- Adaptive mutation & diversity handling

### 💡 Smart Suggestions
- Suggest available rooms when a conflict occurs
- Suggest available time slots for lecturers
- User can select alternative options interactively

---

## 🧠 How AI Works

The system uses a **Genetic Algorithm (GA)** to generate optimized timetables:

1. Generate initial population (valid schedules)
2. Evaluate using a fitness function
3. Apply:
   - Selection (Tournament Selection)
   - Crossover
   - Mutation (Adaptive)
4. Repair conflicts
5. Improve over multiple generations

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React (Vite)
- Tailwind CSS
- Axios

### 🔹 Backend
- Node.js
- Express.js
- MongoDB (Mongoose)

### 🔹 AI / Logic
- Genetic Algorithm
- Conflict Detection Engine
- Time Slot Optimization

---

## 📁 Project Structure
backend/
controllers/
models/
routes/
services/
utils/

frontend/
src/
components/
pages/
api/


---

## ⚙️ Installation

### 🔹 Backend

```bash
cd backend
npm install
npm run dev

Admin:
email: admin@example.com
password: adminpass

Lecturer:
email: lecturer@example.com
password: lecturerpass

Student:
email: student@example.com
password: studentpass
