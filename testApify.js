import 'dotenv/config';
import { ApifyClient } from 'apify-client';

const token = (process.env.APIFY_TOKEN || "").trim();
console.log("Token length:", token.length);
console.log("Token starts with:", token.substring(0, 10));

const client = new ApifyClient({ token });

async function test() {
    try {
        const searchQuery = "home cleaning in Bengaluru";
        console.log(`🔍 Testing fetch: ${searchQuery}`);

        const run = await client.actor("compass/crawler-google-places").call({
            "searchStringsArray": [searchQuery],
            "maxItems": 5,
            "language": "en",
            "proxyConfiguration": { "useApifyProxy": true }
        });

        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        console.log(`✅ Success! Found ${items.length} items`);
        console.log(items.slice(0, 2).map(item => ({ title: item.title, phone: item.phone, address: item.address })));
    } catch (err) {
        console.error("❌ Error during test:", err);
    }
}

test();
