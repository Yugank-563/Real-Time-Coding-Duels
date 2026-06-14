import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Securely load environment configuration before ES module imports are initialized
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Validate required environment variables at startup — fail fast if critical config is missing
const REQUIRED_ENV_VARS = [
  'JWT_SECRET', 
  'MONGO_URI', 
  'REDIS_URL', 
  'JWT_REFRESH_SECRET', 
  'BREVO_API_KEY', 
  'BREVO_SENDER_EMAIL'
];
const missingVars = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error(`[env] FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}
