import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load central environment configurations before any other module imports execute
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
