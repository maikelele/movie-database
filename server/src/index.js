import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the server root regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { createApp } from './server.js';

const port = process.env.PORT || 3000;
const app = await createApp();

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
