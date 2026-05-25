#!/usr/bin/env python3
"""
AgriVision AI — One-click Setup Script
Runs on Windows, macOS, and Linux
Usage: python setup.py
"""
import os
import sys
import subprocess
import shutil
import platform

def run(cmd, cwd=None, check=True):
    print(f"  → {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if check and result.returncode != 0:
        print(f"  ✗ Command failed: {cmd}")
        sys.exit(1)
    return result.returncode == 0

def header(msg):
    print(f"\n{'='*55}")
    print(f"  {msg}")
    print('='*55)

def main():
    base = os.path.dirname(os.path.abspath(__file__))
    backend = os.path.join(base, "backend")
    frontend = os.path.join(base, "frontend")
    is_win = platform.system() == "Windows"

    header("🌿 AgriVision AI — Setup Starting")
    print(f"  Platform: {platform.system()} {platform.machine()}")
    print(f"  Python:   {sys.version.split()[0]}")

    # ── Backend ───────────────────────────────────────────────
    header("Step 1/4 — Backend: Creating virtual environment")
    venv_path = os.path.join(backend, "venv")
    if not os.path.exists(venv_path):
        run(f'"{sys.executable}" -m venv venv', cwd=backend)
        print("  ✓ Virtual environment created")
    else:
        print("  ✓ Virtual environment already exists")

    pip = os.path.join(venv_path, "Scripts" if is_win else "bin", "pip")

    header("Step 2/4 — Backend: Installing Python dependencies")
    run(f'"{pip}" install --upgrade pip', cwd=backend)
    run(f'"{pip}" install -r requirements.txt', cwd=backend)
    print("  ✓ Backend dependencies installed")

    # Copy .env if missing
    env_src = os.path.join(backend, ".env.example")
    env_dst = os.path.join(backend, ".env")
    if not os.path.exists(env_dst) and os.path.exists(env_src):
        shutil.copy(env_src, env_dst)
        print("  ✓ Created backend/.env — please add your API keys")

    # Create uploads dir
    os.makedirs(os.path.join(backend, "static", "uploads"), exist_ok=True)

    # ── Frontend ──────────────────────────────────────────────
    header("Step 3/4 — Frontend: Installing Node dependencies")
    if not shutil.which("node"):
        print("  ✗ Node.js not found! Install from https://nodejs.org")
        sys.exit(1)
    run("npm install", cwd=frontend)
    print("  ✓ Frontend dependencies installed")

    # Copy frontend .env
    fe_src = os.path.join(frontend, ".env.example")
    fe_dst = os.path.join(frontend, ".env")
    if not os.path.exists(fe_dst) and os.path.exists(fe_src):
        shutil.copy(fe_src, fe_dst)
        print("  ✓ Created frontend/.env")

    # ── Model check ───────────────────────────────────────────
    header("Step 4/4 — Checking ML model")
    model_path = os.path.join(backend, "ml_models", "plant_disease_model_1_latest.pt")
    if os.path.exists(model_path):
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        print(f"  ✓ Model found ({size_mb:.1f} MB)")
    else:
        print("  ⚠ Model NOT found at:")
        print(f"    {model_path}")
        print()
        print("  Download from Google Drive:")
        print("  https://drive.google.com/drive/folders/1ewJWAiduGuld_9oGSrTuLumg9y62qS6A")
        print("  Place the .pt file in: backend/ml_models/")

    # ── Summary ───────────────────────────────────────────────
    header("✅ Setup Complete!")
    print()
    print("  To start the project, open TWO terminals:\n")
    if is_win:
        print("  Terminal 1 (Backend):")
        print("    cd backend")
        print("    venv\\Scripts\\activate")
        print("    python app.py")
        print()
        print("  Terminal 2 (Frontend):")
        print("    cd frontend")
        print("    npm run dev")
    else:
        print("  Terminal 1 (Backend):")
        print("    cd backend && source venv/bin/activate && python app.py")
        print()
        print("  Terminal 2 (Frontend):")
        print("    cd frontend && npm run dev")
    print()
    print("  🌐 Open: http://localhost:3000")
    print()
    print("  (Optional) Add free API keys to backend/.env:")
    print("    GROQ_API_KEY  → https://console.groq.com  (AI Chatbot)")
    print("    NEWS_API_KEY  → https://newsapi.org        (News feed)")
    print()

if __name__ == "__main__":
    main()
