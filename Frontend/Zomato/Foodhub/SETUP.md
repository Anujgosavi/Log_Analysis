# Food Delivery App - Setup Guide

## Quick Start

### 1. Install Dependencies (if not already done)
```powershell
npm install
```

### 2. Set Up MongoDB Connection

Create a `.env.local` file in the project root with your MongoDB connection string:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

**How to get MongoDB URI:**
- If using MongoDB Atlas (cloud): 
  1. Go to https://www.mongodb.com/cloud/atlas
  2. Create a free cluster
  3. Click "Connect" → "Connect your application"
  4. Copy the connection string and replace `<password>` with your database password
  
- If using local MongoDB:
  ```
  MONGODB_URI=mongodb://localhost:27017/food-delivery
  ```

### 3. Run Development Server

```powershell
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3000/api/health
- **API Foods**: http://localhost:3000/api/foods
- **API Orders**: http://localhost:3000/api/orders

### 4. Testing the API

Open PowerShell and test the endpoints:

```powershell
# Health check
curl http://localhost:3000/api/health

# Get all foods
curl http://localhost:3000/api/foods

# Get all orders
curl http://localhost:3000/api/orders
```

## Available Commands

- `npm run dev` - Start development server (use this for development)
- `npm run build` - Build for production
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint

## Important Notes

- **Always use `npm run dev` for development**, not `npm start`
- The `.env.local` file is required for MongoDB connection
- On first run, the foods API will automatically seed the database with dummy data
- Frontend and backend are connected - they run on the same Next.js server

## Troubleshooting

**Error: "Please define the MONGODB_URI environment variable"**
- Create `.env.local` file in the project root with your MongoDB connection string

**Error: "Could not find a production build"**
- You're using `npm start` instead of `npm run dev`. Use `npm run dev` for development.

**MongoDB Connection Error**
- Check your MongoDB URI is correct
- Ensure your IP address is whitelisted in MongoDB Atlas (if using cloud)
- Verify MongoDB is running (if using local)




