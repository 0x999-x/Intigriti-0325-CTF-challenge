
export default async function handler(req, res) {
    const { method } = req
    res.setHeader('Content-Type', 'text/javascript')
    switch (method) {
        case 'GET':
            try {
                const userIp = req.headers['x-user-ip'] || '0.0.0.0'
                const jsContent = `
$(document).ready(function() {
    const userDetails = {
        ip: "${userIp}",
        type: "client",
        timestamp: new Date().toISOString(),
        ipDetails: {}
    };
    window.ipAnalytics = {
        track: function() {
            return {
                ip: userDetails.ip,
                timestamp: new Date().toISOString(),
                type: userDetails.type,
                ipDetails: userDetails.ipDetails
            };
        }
    };
});`
                if (userIp !== '0.0.0.0') {
                    return res.status(200).send(jsContent)
                } else {
                    return res.status(200).send('');
                }
            } catch (error) {
                console.error('Error:', error)
                return res.status(500).send('Error')
            }
        default:
            res.setHeader('Allow', ['GET'])
            return res.status(405).send('console.error("Method not allowed");')
    }
}


