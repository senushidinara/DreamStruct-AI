import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateModelRouter from './routes/generateModel.js';
import analyzeFeasibilityRouter from './routes/analyzeFeasibility.js';
import getTemplateRouter from './routes/getTemplate.js';
import editImageRouter from './routes/editImage.js';
import generateVideoRouter from './routes/generateVideo.js';

dotenv.config();

const app = express();
const port = 3001;

// Increase payload size limit for base64 images/videos
app.use(express.json({ limit: '50mb' }));
app.use(cors());


// API Routes
app.use('/api/generate-model', generateModelRouter);
app.use('/api/analyze-feasibility', analyzeFeasibilityRouter);
app.use('/api/get-template', getTemplateRouter);
app.use('/api/edit-image', editImageRouter);
app.use('/api/generate-video', generateVideoRouter);


app.listen(port, () => {
  console.log(`DreamStruct backend listening at http://localhost:${port}`);
});