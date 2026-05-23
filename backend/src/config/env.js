import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Securely load environment configuration before ES module imports are initialized
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
