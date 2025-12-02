import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API key from environment
const client = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable not set");
  process.exit(1);
}

async function main() {
  try {
    // Path to PDFs (relative to this script's location)
    const pdfDir = path.resolve(__dirname, "../files");
    
    if (!fs.existsSync(pdfDir)) {
      console.error(`❌ Error: PDF directory not found at ${pdfDir}`);
      process.exit(1);
    }

    const pdfs = fs.readdirSync(pdfDir).filter(f => f.endsWith(".pdf"));
    
    if (pdfs.length === 0) {
      console.error("❌ No PDF files found in", pdfDir);
      process.exit(1);
    }

    console.log(`📚 Found ${pdfs.length} PDF files`);
    
    // Check if vector store ID exists in env, otherwise create new one
    let vectorStoreId = process.env.VECTOR_STORE_ID;
    
    if (!vectorStoreId) {
      console.log("🆕 Creating new vector store...");
      
      // Create vector store (it's at top level, not under beta)
      const vs = await client.vectorStores.create({
        name: "nina-roussille-papers"
      });
      
      vectorStoreId = vs.id;
      console.log(`✅ Created vector store: ${vectorStoreId}`);
      console.log(`\n⚠️  IMPORTANT: Add this to your .env file:`);
      console.log(`VECTOR_STORE_ID=${vectorStoreId}\n`);
    } else {
      console.log(`📦 Using existing vector store: ${vectorStoreId}`);
    }

    // Upload each PDF
    let uploaded = 0;
    let skipped = 0;
    const fileIds = [];
    
    for (const pdf of pdfs) {
      const pdfPath = path.join(pdfDir, pdf);
      
      try {
        console.log(`\n📄 Processing: ${pdf}`);
        
        // Create file in OpenAI
        const file = await client.files.create({
          file: fs.createReadStream(pdfPath),
          purpose: "assistants"
        });
        
        console.log(`   ✅ Uploaded file: ${file.id}`);
        fileIds.push(file.id);
        
        // Add to vector store
        await client.vectorStores.files.create(vectorStoreId, {
          file_id: file.id
        });
        
        console.log(`   ✅ Added to vector store`);
        uploaded++;
        
      } catch (error) {
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          console.log(`   ⏭️  Already exists, skipping`);
          skipped++;
        } else {
          console.error(`   ❌ Error processing ${pdf}:`, error.message);
          console.error(`   Full error:`, error);
        }
      }
    }

    console.log(`\n✅ Ingestion complete!`);
    console.log(`   Uploaded: ${uploaded}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`\n📝 Vector Store ID: ${vectorStoreId}`);
    console.log(`   Add this to your backend .env file as VECTOR_STORE_ID`);
    
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    if (error.response) {
      console.error("   API Response:", error.response.status, error.response.statusText);
      console.error("   Details:", error.response.data);
    }
    process.exit(1);
  }
}

main();
