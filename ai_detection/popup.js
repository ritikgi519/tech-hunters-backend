document.addEventListener('DOMContentLoaded', function() {
    
    // Check karein ki button exist karta hai ya nahi
    const scanBtn = document.getElementById('scanBtn');
    const resultDiv = document.getElementById('result');

    if (!scanBtn || !resultDiv) {
        console.error("Error: HTML me 'scanBtn' ya 'result' ID nahi mili!");
        return;
    }

    scanBtn.addEventListener('click', async () => {
        // 1. Loading state dikhayein
        resultDiv.innerText = "Scanning...";
        resultDiv.style.color = "blue";
        resultDiv.style.display = "block";

        // 2. Current Tab ka URL nikalein
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // Agar local file hai ya chrome setting page hai
        if (!tab.url.startsWith('http')) {
             resultDiv.innerText = "❌ Can't scan this page.";
             return;
        }

        // 3. Image URL dhundne ki koshish (Simple Logic)
        // (Hackathon ke liye hum maan rahe hain ki user image khol kar baitha hai)
        let imageUrl = tab.url; 

        console.log("Sending URL to Backend:", imageUrl);

        try {
            // 4. Backend ko data bhejein
            const response = await fetch('http://127.0.0.1:8000/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: imageUrl })
            });

            const data = await response.json();
            console.log("Backend Reply:", data);

            // 5. Result Update Karein (Correct Logic)
            if (data.status === "AI GENERATED") {
                resultDiv.innerText = "⚠️ AI GENERATED IMAGE";
                resultDiv.style.color = "red";
                resultDiv.style.fontWeight = "bold";
            } else if (data.status === "REAL IMAGE") {
                resultDiv.innerText = "✅ REAL IMAGE";
                resultDiv.style.color = "green";
                resultDiv.style.fontWeight = "bold";
            } else {
                resultDiv.innerText = "❓ " + (data.details || "Unknown Result");
                resultDiv.style.color = "orange";
            }

        } catch (error) {
            console.error("Connection Error:", error);
            resultDiv.innerText = "❌ Server Error. Is Backend running?";
            resultDiv.style.color = "black";
        }
    });
});