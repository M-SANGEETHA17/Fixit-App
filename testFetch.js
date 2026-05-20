import { fetchBusinesses } from './apifyFetch.js';

async function runTest() {
    console.log("=== STARTING FETCH TEST ===");
    try {
        const results = await fetchBusinesses("Electrical Repair", "sattur");
        console.log("=== RESULTS ===");
        console.log("Count:", results.length);
        console.log(JSON.stringify(results, null, 2));
    } catch (err) {
        console.error("Test failed with error:", err);
    }
    console.log("=== TEST COMPLETED ===");
}

runTest();
