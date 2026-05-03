exports.handler = async function(event, context) {
    // CORS headers for local development and cross-origin access
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: "AI service unavailable", detail: "Server Configuration Error: GEMINI_API_KEY is not set." })
            };
        }

        const payload = JSON.parse(event.body);
        const { prompt, context: promptContext, history } = payload;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Construct the contents array for Gemini
        let textContent = "";
        if (promptContext) textContent += `Context: ${promptContext}\n\n`;
        if (prompt) textContent += `Prompt: ${prompt}\n\n`;
        if (history) textContent += `History: ${JSON.stringify(history)}\n\n`;

        const fetchBody = {
            contents: [{
                parts: [{ text: textContent }]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Gemini API Error details:', data);
            throw new Error("AI service unavailable");
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Gemini proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "AI service unavailable" })
        };
    }
};
