document.getElementById('scanBtn').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    resultDiv.style.color = "blue";
    resultDiv.innerText = "🕵️‍♂️ Image dhoond raha hoon...";

    try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
            throw new Error("Koi active tab nahi mila!");
        }

        // Script inject karke image dhoondo
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: findMainImage,
        });

        // Safety Check: Kya result sahi aaya?
        if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
            throw new Error("Page par koi dhang ki image nahi mili!");
        }

        const imageUrl = injectionResults[0].result;
        resultDiv.innerText = "🧠 Analyzing: " + imageUrl.substring(0, 20) + "...";
        
        // Backend ko bhejo
        const response = await fetch("http://127.0.0.1:8000/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_url: imageUrl })
        });

        if (!response.ok) {
            throw new Error("Python Server ne error diya!");
        }

        const data = await response.json();
        
        // Result Dikhao
        resultDiv.style.color = data.color;
        resultDiv.innerText = `${data.result} (${data.confidence}%)`;

    } catch (error) {
        console.error("Scanning Error:", error);
        resultDiv.style.color = "red";
        // Error screen par dikhao taaki humein pata chale
        resultDiv.innerText = "❌ Error: " + error.message;
    }
});

function findMainImage() {
    const images = document.getElementsByTagName('img');
    if (images.length === 0) return null;
    
    // Sabse badi image dhoondo (kam se kam 150px)
    for (let img of images) {
        if (img.width > 150 && img.height > 150 && img.src.startsWith('http')) {
            return img.src;
        }
    }
    // Agar badi nahi mili toh pehli valid image bhej do
    return images[0].src;
}