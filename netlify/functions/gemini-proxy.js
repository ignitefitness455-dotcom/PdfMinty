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
                body: JSON.stringify({ error: "Server Configuration Error: GEMINI_API_KEY is not set." })
            };
        }

        const payload = JSON.parse(event.body);
        const model = payload.model || 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Prepare the body for the Gemini API
        const fetchBody = {
            contents: payload.contents
        };
        if (payload.systemInstruction) fetchBody.systemInstruction = payload.systemInstruction;
        if (payload.generationConfig) fetchBody.generationConfig = payload.generationConfig;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fetchBody)
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Gemini proxy error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Failed to communicate with Gemini API." })
        };
    }
};
