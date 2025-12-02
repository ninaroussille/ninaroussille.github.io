# Environment Setup Guide

## Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. ⚠️ **Save it immediately** - you won't see it again!

## Step 2: Create Vector Store (First Time)

1. Navigate to the backend directory:
   ```bash
   cd rag-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

4. Add your API key to `.env`:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

5. Run ingestion script:
   ```bash
   npm run ingest
   ```

6. The script will:
   - Upload all PDFs from `../files/`
   - Create a vector store
   - Print a `VECTOR_STORE_ID` (starts with `vs-`)

7. Add the vector store ID to `.env`:
   ```
   VECTOR_STORE_ID=vs-your-store-id-here
   ```

## Step 3: Set Up GitHub Secrets (for GitHub Actions)

If you want automatic PDF ingestion when you add new papers:

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `VECTOR_STORE_ID`: The vector store ID from step 2

## Step 4: Update Chatbot Widget

Edit `_includes/chatbot.html` and change this line:

```javascript
const API_URL = "https://your-backend.onrender.com/api/chat";
```

Replace `your-backend.onrender.com` with your actual backend URL after deployment.

## Step 5: Deploy Backend

See `README.md` for deployment instructions (Render, Railway, etc.)

## Cost Monitoring

Monitor your usage at: https://platform.openai.com/usage

Set up billing alerts to avoid surprises!

