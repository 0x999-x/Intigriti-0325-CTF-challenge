import fetch from 'node-fetch';

export default async function handler(req, res) {

        const { method, body, headers } = req;

        switch (method) {
            case 'GET':
                try {
                    const response = await fetch('http://bot:6000/status');
                    if (!response.ok) {
                        throw new Error(`Failed to fetch status: ${response.statusText}`);
                    }
                    const data = await response.json();
                    return res.status(200).json(data);
                } catch (error) {
                    console.error('Error fetching status:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

            case 'POST':
                try {
                    const { url } = body;
                    if (typeof url !== 'string' || !(url.startsWith('http://') || url.startsWith('https://')) || url.length > 2048) {
                        return res.status(400).json({ message: 'Invalid URL. Must start with http:// or https://' });
                    }

                    const userIP = headers['x-real-ip'];
                    const enqueueResponse = await fetch('http://bot:6000/enqueue', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url, userIP }),
                    });
                    if (enqueueResponse.status === 429) {
                        return res.status(429).json({ message: 'You have already submitted a URL. Please wait 30 minutes.' });
                    }
                    if (!enqueueResponse.ok) {
                        throw new Error(`Failed to enqueue URL: ${enqueueResponse.statusText} Bot status code: ${enqueueResponse.status}`);
                    }

                    return res.status(200).json({ message: 'URL submitted successfully' });
                } catch (error) {
                    console.error('Error submitting URL:', error);
                    return res.status(500).json({ message: 'Internal server error' });
                }

            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
}