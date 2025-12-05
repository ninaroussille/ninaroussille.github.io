# RAG Chatbot Setup Guide

This guide will help you set up a RAG (Retrieval-Augmented Generation) chatbot that allows visitors to ask questions about Nina's research papers.

## 📋 Overview

The chatbot consists of:
1. **Backend service** (`rag-backend/`) - Handles AI queries
2. **Frontend widget** (`_includes/chatbot.html`) - Chat interface on website
3. **GitHub Actions** (optional) - Auto-updates when PDFs are added

## 🚀 Quick Start

### 1. Set Up Backend Locally

```bash
cd rag-backend
npm install
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm run ingest  # Creates vector store and uploads PDFs
# Copy the VECTOR_STORE_ID to .env
npm start  # Test locally
```

### 2. Deploy Backend

Choose one:
- **Render.com** (easiest, free tier available)
- **Railway.app** ($5/month, more reliable)
- **Vercel/Netlify Functions** (serverless)

See `rag-backend/README.md` for detailed deployment steps.

### 3. Update Chatbot Widget

Edit `_includes/chatbot.html` line ~180:
```javascript
const API_URL = "https://your-backend-url.com/api/chat";
```

### 4. Test

1. Push changes to GitHub
2. Visit your site
3. Click the "Ask" button (bottom right)
4. Try asking: "What is Nina's research about?"

## 💰 Costs

**OpenAI API:**
- Vector Store: ~$0.10/GB/month storage
- Chat queries: ~$0.15-0.60 per 1M input tokens
- **Estimated**: $5-20/month for moderate traffic

**Hosting:**
- Render: Free tier (spins down after inactivity)
- Railway: $5/month
- Vercel/Netlify: Free tier available

**Total estimated**: $5-25/month

## 🔧 GitHub Actions (Optional)

To automatically ingest new PDFs when added:

1. Go to repo Settings → Secrets → Actions
2. Add secrets:
   - `OPENAI_API_KEY`
   - `VECTOR_STORE_ID`
3. Push a PDF to `/files/` - it will auto-ingest!

## 📝 Files Created

- `rag-backend/` - Backend service
- `_includes/chatbot.html` - Frontend widget
- `.github/workflows/ingest-pdfs.yml` - Auto-ingestion workflow
- `RAG_SETUP.md` - This file

## 🐛 Troubleshooting

**Chatbot not appearing?**
- Check browser console for errors
- Verify API_URL is correct in `chatbot.html`
- Ensure backend is deployed and running

**Backend errors?**
- Check environment variables are set
- Verify vector store ID is correct
- Check OpenAI API key is valid

**PDFs not ingesting?**
- Ensure PDFs are text-based (not scanned images)
- Check OpenAI API key has sufficient credits
- Review ingestion logs

## 📚 Next Steps

1. Customize chatbot styling in `chatbot.html`
2. Adjust system prompt in `server.js` for different tone
3. Add rate limiting (already included)
4. Monitor costs at platform.openai.com/usage

## 🆘 Need Help?

Check:
- `rag-backend/README.md` - Backend documentation
- `rag-backend/ENV_SETUP.md` - Environment setup
- OpenAI docs: https://platform.openai.com/docs

