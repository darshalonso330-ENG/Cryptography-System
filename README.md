# RSA Cryptography System
**Applied Number Theory Project — FCAI**

A full-stack web conversion of the CustomTkinter desktop application.
The UI is pixel-faithful to the original. All RSA and Affine cipher math
runs unchanged on the Flask backend.

---

## Project Structure

```
project/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── assets/          # (place any images/icons here)
│
└── backend/
    ├── app.py
    ├── requirements.txt
    └── routes/
        ├── __init__.py
        └── api.py
```

---

## Running Locally

### 1 — Backend (Flask)

```bash
# From the project root
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

The API will be available at `http://127.0.0.1:5000`.

### 2 — Frontend

Open `frontend/index.html` directly in your browser:

```bash
# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html

# Windows
start frontend/index.html
```

Or serve it with any static file server:

```bash
# Python built-in server (from the frontend/ directory)
cd frontend
python -m http.server 8080
# Then open http://localhost:8080
```

> **Both servers must be running at the same time.**

---

## API Endpoints

| Method | Path                   | Description              |
|--------|------------------------|--------------------------|
| POST   | `/api/rsa/compute-keys`| Compute n, φ(n), d       |
| POST   | `/api/rsa/encrypt`     | RSA encrypt text         |
| POST   | `/api/rsa/decrypt`     | RSA decrypt text         |
| POST   | `/api/affine/encrypt`  | Affine encrypt text      |
| POST   | `/api/affine/decrypt`  | Affine decrypt text      |
| GET    | `/api/health`          | Server health check      |

All POST endpoints accept and return `application/json`.

### Example — RSA Encrypt

```bash
curl -X POST http://127.0.0.1:5000/api/rsa/encrypt \
  -H "Content-Type: application/json" \
  -d '{"p": 3, "q": 11, "e": 7, "text": "HELLO"}'
```

---

## Team

| Name                      | ID       |
|---------------------------|----------|
| Mostafa Ali Maher         | 20250726 |
| Omar Mohammed Abdallah    | 20250643 |
| Mahmoud Nabil Ahmed       | 20250708 |
| Abdallah Shams Saeed      | 20250621 |
| Youssef Mohammed Elngar   | 20240195 |

**Instructor:** Eng. Farida Azab  
**Subject:** Applied Number Theory  
**Faculty:** Faculty of Computers & AI (FCAI)  
**Year:** 2024 / 2025
