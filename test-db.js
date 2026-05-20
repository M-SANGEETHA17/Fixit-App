import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  try {
    console.log("Connecting to:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected successfully.");
    
    const WorkerSchema = new mongoose.Schema({}, { strict: false });
    const Worker = mongoose.model("Worker", WorkerSchema, "workers");

    const FeedbackSchema = new mongoose.Schema({}, { strict: false });
    const Feedback = mongoose.model("Feedback", FeedbackSchema, "feedbacks");
    
    const workers = await Worker.find({});
    console.log("--- Worker Feedbacks ---");
    workers.forEach(w => {
      if (w.feedbacks && w.feedbacks.length > 0) {
        console.log(`Worker: ${w.name} (${w.email})`);
        w.feedbacks.forEach((f, idx) => {
          console.log(`  Feedback [${idx}]: User: ${f.userName}, Star: ${f.stars}, Msg: ${f.message}`);
          console.log(`    Image Field exists?: ${f.image !== undefined}`);
          console.log(`    Image Value type/length: ${typeof f.image} (length: ${f.image ? f.image.length : 0})`);
          if (f.image && f.image.length > 0) {
            console.log(`    Image Snippet: ${f.image.substring(0, 50)}...`);
          }
        });
      }
    });

    const standalone = await Feedback.find({});
    console.log("--- Standalone Feedbacks ---");
    standalone.forEach((f, idx) => {
      console.log(`Feedback [${idx}]: WorkerEmail: ${f.workerEmail}, Customer: ${f.customerName}, Rating: ${f.rating}, Comment: ${f.comment}`);
      console.log(`  Image Field exists?: ${f.image !== undefined}`);
      console.log(`  Image Value type/length: ${typeof f.image} (length: ${f.image ? f.image.length : 0})`);
      if (f.image && f.image.length > 0) {
        console.log(`  Image Snippet: ${f.image.substring(0, 50)}...`);
      }
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

run();
