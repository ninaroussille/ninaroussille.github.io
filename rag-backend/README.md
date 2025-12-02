# RAG Chatbot Backend

Backend service for the research paper chatbot on Nina Roussille's website.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Ingest PDFs (first time):**
   ```bash
   npm run ingest
   ```
   This will:
   - Create a vector store in OpenAI
   - Upload all PDFs from `../files/`
   - Print the VECTOR_STORE_ID (add this to .env)

4. **Run the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

## Deployment

### Option 1: Render.com (Recommended)

1. Create account at [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Set build command: `cd rag-backend && npm install`
5. Set start command: `cd rag-backend && npm start`
6. Add environment variables:
   - `OPENAI_API_KEY`
   - `VECTOR_STORE_ID`
   - `PORT` (auto-set by Render)

### Option 2: Railway

1. Create account at [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables
5. Deploy!

### Option 3: Vercel/Netlify Functions

See their serverless function documentation for Express apps.

## Updating Papers

When new PDFs are added to `/files/`:

1. Run `npm run ingest` again
2. It will add new files to the existing vector store

Or use the GitHub Actions workflow (see `.github/workflows/ingest-pdfs.yml`)

## Cost Estimates

- **Storage**: ~$0.10/GB/month for vector store
- **Ingestion**: ~$0.10/GB one-time per PDF
- **Queries**: ~$0.15-0.60 per 1M input tokens, ~$0.60-1.80 per 1M output tokens
- **Estimated monthly**: $5-20 for moderate traffic

## API Endpoints

- `POST /api/chat` - Main chat endpoint
  - Body: `{ message: string, history?: array }`
  - Returns: `{ answer: string, citations?: array }`

- `GET /health` - Health check

