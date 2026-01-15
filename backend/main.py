# --- HACKATHON SPECIAL FUNCTION (AGGRESSIVE MODE) ---
def simulate_ai_detection(url):
    url_lower = url.lower()
    
    # List of words jo pakka AI hote hain
    ai_keywords = [
        'lexica', 'stablediffusion', 'dalle', 'midjourney', 'artstation', 
        'ai', 'gen', 'bot', 'chatgpt', 'cyber', 'robot', 'future', 
        'anime', 'cartoon', 'fantasy', 'dream', 'space', 'prompts'
    ]
    
    # List of words jo pakka Real hote hain
    real_keywords = [
        'photo', 'camera', 'dcim', 'whatsapp', 'img', 'screenshot', 
        'news', 'bbc', 'ndtv', 'capture', 'portrait', 'selfie'
    ]

    # 1. Check for AI Keywords (Sabse Pehle)
    if any(x in url_lower for x in ai_keywords):
        return {"result": "⚠️ AI GENERATED", "confidence": 92, "color": "red"}

    # 2. Check for Real Keywords
    elif any(x in url_lower for x in real_keywords):
        return {"result": "✅ REAL IMAGE", "confidence": 88, "color": "green"}

    # 3. Agar kuch samajh na aaye toh URL Hash use karo (Par AI ki taraf bias rakho)
    else:
        hash_object = hashlib.md5(url.encode())
        hash_score = int(hash_object.hexdigest(), 16) % 100
        
        # Pehle hum 60 pe cutoff kar rahe the, ab 40 pe karenge (Zyada images Fake dikhengi)
        if hash_score > 40: 
            return {"result": "⚠️ AI GENERATED", "confidence": 75 + (hash_score % 20), "color": "red"}
        else:
            return {"result": "✅ REAL IMAGE", "confidence": 85, "color": "green"}