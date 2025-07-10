# Vercel Deployment Guide for AudioVibe

## 🚀 Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/RecommendPocket)

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **OpenRouter API Key**: Get your free key from [openrouter.ai](https://openrouter.ai)
3. **GitHub Repository**: Push your code to GitHub

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel Dashboard**: Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Click "New Project"**
3. **Import from GitHub**: Select your repository
4. **Configure Project**:
   - **Framework**: Vite
   - **Root Directory**: Leave empty (auto-detected)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`

### Step 3: Environment Variables

In the Vercel project settings, add these environment variables:

```bash
OPENROUTER_API_KEY=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
NODE_ENV=production
```

**How to add environment variables:**
1. Go to your project dashboard on Vercel
2. Click **Settings** tab
3. Click **Environment Variables**
4. Add each variable with the appropriate values

### Step 4: Deploy

1. **Click "Deploy"** - Vercel will automatically build and deploy your app
2. **Wait for build** - This takes 2-3 minutes
3. **Get your URL** - Vercel provides a unique URL like `your-app.vercel.app`

## 🏗️ Project Structure (Vercel-Ready)

```
RecommendPocket/
├── api/                    # Serverless functions
│   └── index.ts           # API handler
├── client/                 # React frontend
├── server/                 # Express API logic
├── shared/                 # Shared types/schemas
├── vercel.json            # Vercel configuration
└── package.json           # Build scripts
```

## 🔥 Features Deployed

✅ **AI Recommendations** - Powered by OpenRouter + Google Gemma  
✅ **Real-time Search** - Instant content discovery  
✅ **Audio Player** - Full playback controls  
✅ **Favorites System** - Save preferred content  
✅ **Progress Tracking** - Resume where you left off  
✅ **Responsive Design** - Works on all devices  

## 🛠️ Build Configuration

The app uses these optimized settings for Vercel:

- **Frontend**: Vite + React (Static)
- **Backend**: Serverless Functions (Node.js)
- **API Routes**: `/api/*` → Serverless
- **Assets**: Optimized bundles with code splitting

## 🚨 Troubleshooting

### Build Fails?
1. Check that all dependencies are in `package.json`
2. Verify environment variables are set correctly
3. Ensure API key is valid

### API Not Working?
1. Check serverless function logs in Vercel dashboard
2. Verify environment variables in production
3. Test API endpoints manually

### Slow Performance?
1. Vercel automatically optimizes static assets
2. API calls are cached when possible
3. Use Vercel Analytics to monitor performance

## 🔗 Useful Commands

```bash
# Test build locally
npm run build

# Start production server locally
npm run start

# Deploy to Vercel CLI
npx vercel

# Check build logs
npx vercel logs
```

## 🎯 Production Optimizations

- **Code Splitting**: Automatic vendor/UI chunks
- **Asset Optimization**: Compressed CSS/JS
- **Serverless Functions**: Auto-scaling API
- **CDN**: Global content delivery
- **HTTPS**: Automatic SSL certificates

## 📞 Support

If you encounter issues:

1. **Check Vercel Logs**: Dashboard → Functions → View Logs
2. **Verify Environment**: Settings → Environment Variables
3. **Test Locally**: Run `npm run build && npm run start`

Your AudioVibe app will be live at: `https://your-app-name.vercel.app` 🎵 