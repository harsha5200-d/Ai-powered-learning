/**
 * Run: node scripts/test-db-connection.js
 * Diagnoses Atlas connectivity (IP whitelist, DNS, credentials).
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const dns = require('dns');
dns.setServers(
  process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((s) => s.trim())
    : ['8.8.8.8', '1.1.1.1']
);
const mongoose = require('mongoose');

async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch {
    return null;
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is missing in studyq-backend/.env');
    process.exit(1);
  }

  const ip = await getPublicIp();
  if (ip) {
    console.log('Your public IP (whitelist this in Atlas → Network Access):', ip);
  }

  console.log('Connecting...\n');

  const opts = { serverSelectionTimeoutMS: 15000, family: 4 };
  if (process.env.MONGODB_TLS_INSECURE === 'true') {
    opts.tlsAllowInvalidCertificates = true;
  }

  try {
    await mongoose.connect(url, opts);
    console.log('SUCCESS — MongoDB connected.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err.message, '\n');

    if (err.reason?.servers) {
      console.error('Per-server details:');
      for (const [host, s] of err.reason.servers) {
        const msg = s.error?.message || s.type;
        console.error(`  ${host} → ${msg}`);
      }
      console.error('');
    }

    console.error(`Fix in MongoDB Atlas (https://cloud.mongodb.com):
  1. Network Access → Add IP Address → paste: ${ip || 'your current IP'}
     (or use 0.0.0.0/0 temporarily for dev — not for production)
  2. Wait 1–2 minutes, then run this script again
  3. Clusters → Resume if status is Paused
  4. Database Access → reset password if auth fails, update .env
`);
    process.exit(1);
  }
}

main();
