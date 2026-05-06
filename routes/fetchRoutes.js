// fetchRoutes.js
import express from 'express';
import { fetchBusinesses } from '../apifyFetch.js';

const router = express.Router();

// GET /api/fetch?service=plumber&city=Madurai
router.get('/', async (req, res) => {
    const { service, city } = req.query;

    if (!service || !city) {
        return res.status(400).json({ 
            success: false, 
            error: 'service and city are required. Example: /api/fetch?service=plumber&city=Madurai' 
        });
    }

    try {
        // Call the Apify function to get business details
        const businesses = await fetchBusinesses(service, city);

        // Send success response
        res.json({
            success: true,
            count: businesses.length,
            data: businesses  // This includes name, phone, address, rating, etc.
        });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch data from Apify' 
        });
    }
});

export default router;