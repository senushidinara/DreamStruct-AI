import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get('/:templateName', async (req, res) => {
    const { templateName } = req.params;
    const templatesDir = path.resolve(__dirname, '../../templates');
    let filePath;

    if (templateName === 'freeform') {
        filePath = path.join(templatesDir, 'FreeformDesigner/exampleModel.json');
    } else if (templateName === 'optimizer') {
        filePath = path.join(templatesDir, 'FeasibilityOptimizer/exampleAnalysis.json');
    } else {
        return res.status(404).json({ error: 'Template not found' });
    }

    try {
        const data = await fs.readFile(filePath, 'utf-8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error(`Error reading template ${templateName}:`, error);
        res.status(500).json({ error: 'Could not retrieve template.' });
    }
});

export default router;
