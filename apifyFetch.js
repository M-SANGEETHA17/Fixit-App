// apifyFetch.js
import 'dotenv/config';
import { ApifyClient } from 'apify-client';

const client = new ApifyClient({
    token: process.env.APIFY_TOKEN,
});

export const fetchBusinesses = async (service, city) => {
    try {
        const searchQuery = `${service} in ${city}`;
        console.log(`🔍 Fetching: ${searchQuery}`);

        // ✅ Correct input format for "compass/crawler-google-places"
        const run = await client.actor("compass/crawler-google-places").call({
            "searchStringsArray": [searchQuery],  // <-- changed from "search"
            "maxItems": 30,
            "language": "en",
            "proxyConfiguration": { "useApifyProxy": true }
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(`✅ Found ${items.length} businesses`);
        return items;
    } catch (error) {
        console.error("❌ Apify fetch failed:", error.message);
        return [];
    }
};