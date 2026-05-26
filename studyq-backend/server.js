require('dotenv').config();
const dns = require('dns');

// Some routers break Node SRV lookups (querySrv ECONNREFUSED) while nslookup works
dns.setServers(
  process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((s) => s.trim())
    : ['8.8.8.8', '1.1.1.1']
);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const quizRoutes = require('./routes/quizRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contentRoutes = require('./routes/contentRoutes');

const app = express();

// Middleware
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5174'];
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set in .env');
  process.exit(1);
}

const mongoOptions = {
  serverSelectionTimeoutMS: 15000,
  family: 4,
};
// Set MONGODB_TLS_INSECURE=true only if you see "unable to verify the first certificate"
// (common with antivirus HTTPS scanning). Never use in production.
if (process.env.MONGODB_TLS_INSECURE === 'true') {
  mongoOptions.tlsAllowInvalidCertificates = true;
}

mongoose
  .connect(databaseUrl, mongoOptions)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(async (err) => {
    console.error('MongoDB connection error:', err.message);

    if (err.message.includes('whitelist') || err.reason?.type === 'ReplicaSetNoPrimary') {
      let publicIp = null;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        publicIp = (await res.json()).ip;
      } catch {
        /* ignore */
      }

      console.error(`
Atlas fix (required — code cannot fix this from your PC):

  1. Open https://cloud.mongodb.com → your project
  2. Network Access → ADD IP ADDRESS
     → "Add Current IP Address"${publicIp ? ` (your IP looks like: ${publicIp})` : ''}
     → OR enter 0.0.0.0/0 with comment "dev" (allows all IPs; dev only)
  3. Click Confirm and wait 1–2 minutes
  4. Clusters → Resume if the cluster is Paused
  5. Run: node scripts/test-db-connection.js

Until step 2 is done, you will keep seeing ReplicaSetNoPrimary.
`);
    }
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api', quizRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api', contentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'studyq-api-node' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
