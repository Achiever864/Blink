// controllers/call.controller.js
const getTurnCredentials = async (req, res) => {
    try {
        const response = await fetch(
            `https://blink01.metered.live/api/v1/turn/credentials?apiKey=${process.env.METERED_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Metered API responded with status ${response.status}`);
        }

        const iceServers = await response.json();
        res.status(200).json({ iceServers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getTurnCredentials };