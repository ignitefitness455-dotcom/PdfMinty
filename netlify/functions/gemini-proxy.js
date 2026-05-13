const sanitizeString = (str) => str.replace(/[<>]/g, ''); // Simple XSS prevention

exports.handler = async function(event) {
    // Determine allowed origin (allowing AI Studio preview domains while restricting generally as requested)
    const origin = event.headers.origin || event.headers.Origin;
    let allowedOrigin = 'https://pdfminty.netlify.app';
    if (origin && (origin.includes('run.app') || origin.includes('localhost'))) {
        allowedOrigin = origin; // Support dev env
    }

    // CORS headers for restricted access
    const headers = {
        'Access-Control-Allow-Origin': allowedOrigin,
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
        let { prompt, context, history } = payload;
        
        prompt = prompt ? sanitizeString(prompt).substring(0, 500) : '';
        context = context ? sanitizeString(context).substring(0, 500) : '';

        // Ensure history is sanitized
        if (history && Array.isArray(history)) {
            history = history.map(h => ({
                role: h.role,
                parts: h.parts.map(p => ({ text: sanitizeString(p.text) }))
            })).slice(0, 10);
        }
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        // Construct the contents array with separated parts to mitigate prompt injection
        const parts = [];
        if (context) parts.push({ text: `Context: ${context}` });
        if (history) parts.push({ text: `History: ${JSON.stringify(history)}` });
        if (prompt) parts.push({ text: `Prompt: ${prompt}` });

        const fetchBody = {
            contents: [{
                parts: parts
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
            console.error('Gemini API Error details:', JSON.stringify(data, null, 2));
            throw new Error(`AI service unavailable: ${data?.error?.message || 'Unknown API error'}`);
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
