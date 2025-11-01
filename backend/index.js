import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateModelRouter from './routes/generateModel.js';
import analyzeFeasibilityRouter from './routes/analyzeFeasibility.js';
import getTemplateRouter from './routes/getTemplate.js';

dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/generate-model', generateModelRouter);
app.use('/api/analyze-feasibility', analyzeFeasibilityRouter);
app.use('/api/get-template', getTemplateRouter);

app.listen(port, () => {
  console.log(`DreamStruct backend listening at http://localhost:${port}`);
});
