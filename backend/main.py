from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv # Env file load karne ke liye

# .env file se variables load karein
load_dotenv()

app = FastAPI()

# --- CORS SETTINGS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Security ke liye production me specific domain dalein
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATA MODEL ---
class ImageRequest(BaseModel):
    url: str

# --- CONFIGURATION ---
API_URL = "https://api-inference.huggingface.co/models/umm-maybe/AI-image-detector"
HF_TOKEN = os.getenv("HF_TOKEN")  # Token ab .env file se aayega

# --- LOGIC FUNCTION ---
def query_huggingface(image_url):
    if not HF_TOKEN:
        return {"error": "Hugging Face Token missing. Check .env file."}

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": image_url}
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# --- API ENDPOINT ---
@app.post("/detect")
async def detect_ai(request: ImageRequest):
    result = query_huggingface(request.url)
    return result

@app.get("/")
def home():
    return {"message": "Tech Hunters Backend is Running!"}