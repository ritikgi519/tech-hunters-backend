document.addEventListener('DOMContentLoaded', function() {
    const scanBtn = document.getElementById('scanBtn');
    const resultDiv = document.getElementById('result');

    scanBtn.addEventListener('click', async () => {
        // 1. Reset UI
        scanBtn.disabled = true;
        scanBtn.innerText = "Scanning...";
        scanBtn.style.backgroundColor = "#ccc";
        resultDiv.innerHTML = "🔍 Analyzing pixels...";
        resultDiv.className = "result"; // Reset colors

        // 2. Get Current Tab URL
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 3. Extract Image URL (Agar user ne image kholi hai)
        // Note: Hum seedha tab ka URL bhej rahe hain kyunki Google Images par tab URL hi image URL hota hai
        let imageUrl = tab.url;

        try {
            // 4. Send to Render Server
            // Is URL ko dhyan se check karo (vahi hona chahiye jo Render dashboard par hai)
            const response = await fetch("https://tech-hunters-backend.onrender.com/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                // YE PART SABSE ZAROORI HAI: Key ka naam 'url' hi hona chahiye
                body: JSON.stringify({ url: imageUrl }) 
            });

            if (!response.ok) {
                throw new Error(`Server Error: ${response.status}`);
            }

            const data = await response.json();

            // 5. Show Result
            resultDiv.innerText = data.result; // "⚠️ AI GENERATED" ya "✅ REAL IMAGE"
            
            // Color Logic
            if (data.color === "red") {
                resultDiv.style.color = "red";
                resultDiv.style.border = "2px solid red";
            } else {
                resultDiv.style.color = "green";
                resultDiv.style.border = "2px solid green";
            }

        } catch (error) {
            resultDiv.innerText = "❌ Error: " + error.message;
            resultDiv.style.color = "red";
        } finally {
            // Reset Button
            scanBtn.disabled = false;
            scanBtn.innerText = "Scan for AI Content";
            scanBtn.style.backgroundColor = "#4CAF50";
        }
    });
});