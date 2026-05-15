# SentinelAI - Continuous Risk Engine & Behavioral Auth

SentinelAI is an advanced, AI-driven security platform that provides **continuous authentication** and **real-time risk assessment**. By analyzing behavioral biometrics (typing patterns, mouse movements), device fingerprints, and geographic anomalies, SentinelAI can detect account takeovers, bot scripts, and session hijacking in real-time.

---

## 🚀 Key Features

- **Behavioral Biometrics**: Analyzes typing cadence (dwell/flight times) and mouse dynamics (speed, clicks) to verify user identity beyond passwords.
- **AI Risk Engine**: Uses an **Isolation Forest** anomaly detection model to assign a risk score (0-100) to every session.
- **Continuous Monitoring**: Real-time WebSocket integration for live threat monitoring on the admin dashboard.
- **Automated Threat Response**:
  - **Success**: Low risk scores allow standard access.
  - **MFA Challenge**: Medium risk triggers step-up authentication.
  - **Blocked**: High-risk anomalies (e.g., bot signatures, impossible travel) result in immediate session termination.
- **Impossible Travel Detection**: Geo-location analysis to detect logins from physically impossible locations in short timeframes.
- **Attack Simulator**: Built-in tool to simulate various attack vectors (Bot Scripts, Stolen Credentials, Geo-Spoofing) to test the engine's response.

---

## 🛠️ Tech Stack

### **Backend**
- **FastAPI**: High-performance Python web framework.
- **Scikit-Learn**: Machine learning library for the Isolation Forest model.
- **SQLAlchemy**: ORM for session and behavioral data persistence.
- **WebSockets**: For real-time alert broadcasting to the dashboard.
- **SQLite**: Local database for historical behavior tracking.

### **Frontend**
- **React 19**: Modern UI library with functional components.
- **Tailwind CSS v4**: CSS-first utility framework for premium, responsive UI.
- **Framer Motion**: Smooth animations for the dashboard and simulator.
- **Recharts**: Real-time data visualization of risk levels.
- **Lucide React**: Premium icon set for security metrics.

---

## 📂 Project Structure

```text
SentiAI/
├── backend/                # FastAPI Application
│   ├── ml/                 # AI Model & Feature Extraction
│   │   ├── features.py     # Biometric feature engineering
│   │   └── train.py        # Model training script
│   ├── routes/             # API Endpoints
│   │   └── auth.py         # Risk-aware authentication logic
│   ├── database.py         # DB Configuration
│   ├── models.py           # Data Models (SQLAlchemy & Pydantic)
│   ├── main.py             # App Entry Point & WebSockets
│   └── ws.py               # WebSocket Manager
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Simulator, etc.)
│   │   ├── utils/          # Fingerprinting & Behavioral Trackers
│   │   └── index.css       # Tailwind v4 Configuration
│   └── vite.config.js      # Vite Configuration
└── docker-compose.yml      # Orchestration for Dev/Prod
```

---

## ⚙️ Setup & Installation

### **Prerequisites**
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose (Optional)

### **Local Development Setup**

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python ml/train.py   # Train the initial AI model
uvicorn main:app --reload
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### **Running with Docker**
```bash
docker-compose up --build
```

---

## 🧪 Security Simulation

SentinelAI includes an **Attack Simulator** (located in the bottom-left of the frontend) that allows you to test the AI's detection capabilities:

1. **Inject Bot Script**: Simulates a script with perfect, non-human timing.
2. **Stolen Credentials**: Simulates a login where the password is correct but behavior deviates from the established profile.
3. **Impossible Travel**: Simulates a geo-location jump that is physically impossible (e.g., login from USA, then 1 minute later from China).

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:
```env
ADMIN_USER=admin
ADMIN_PASS=admin123
JWT_SECRET=your_secret_key_here
MODEL_PATH=models/isolation_forest.pkl
```

---

## 📜 License
MIT License. Created for advanced security research and AI-driven threat detection.
