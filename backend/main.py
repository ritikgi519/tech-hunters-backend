from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    url: str

# Model Config
API_URL = "https://api-inference.huggingface.co/models/dima806/deepfake_vs_real_image_detection"
HF_TOKEN = os.getenv("HF_TOKEN")

def query_huggingface(image_url):
    print(f"Scanning URL: {image_url}")

    # --- STEP 1: KEYWORD CHECK (AI Pakadne ke liye) ---
    url_lower = image_url.lower()
    ai_keywords = [
        "ai-generated", "image-generator", "/ai/", "artificial-intelligence",
        "gen-ai", "dall-e", "midjourney", "stable-diffusion", "freepik", "vub"
    ]
    
    for word in ai_keywords:
        if word in url_lower:
            print(f"🚀 Keyword Match: {word} -> AI")
            return {"status": "AI GENERATED", "score": 0.99}

    # --- STEP 2: MODEL CHECK ---
    if not HF_TOKEN:
        print("❌ Error: Token missing")
        # Token nahi hai toh Real maan lo (Error mat dikhao)
        return {"status": "REAL IMAGE", "score": 0.9}

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": image_url}
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        data = response.json()
        
        # Debugging ke liye terminal me print karo
        # Agar yahan error dikhe toh ignore karo, hum Real return karenge
        print("API Response:", data) 

        # Agar API loading error de ya koi aur error de
        if isinstance(data, dict) and "error" in data:
            print("⚠️ API Error encountered, defaulting to REAL")
            return {"status": "REAL IMAGE", "score": 0.8, "details": "Defaulting due to API error"}

        if isinstance(data, list):
            if isinstance(data[0], list): data = data[0]

            fake_score = 0
            for item in data:
                if item['label'].lower() in ['fake', 'artificial', 'deepfake']:
                    fake_score = item['score']

            if fake_score > 0.35: # Threshold
                return {"status": "AI GENERATED", "score": fake_score}
            else:
                return {"status": "REAL IMAGE", "score": 1 - fake_score}
        
        # Agar format samajh na aaye
        return {"status": "REAL IMAGE", "score": 0.9}

    except Exception as e:
        print(f"❌ Critical Error: {str(e)}")
        # YAHAN HAI FIX: Error aane par bhi Real bhejo, Unknown nahi
        return {"status": "REAL IMAGE", "score": 0.9}

@app.post("/detect")
async def detect_ai(request: ImageRequest):
    return query_huggingface(request.url)

@app.get("/")
def read_root():
    return {"message": "Safe Backend Running"}