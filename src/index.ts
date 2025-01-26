import express, { Request, Response } from 'express';
import cors from 'cors';
import { environment} from './environment';
import { BoxClient, BoxDeveloperTokenAuth } from 'box-typescript-sdk-gen';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
const exec = require('child_process').exec;

const app = express();
const port = 3000;

// Middleware to parse JSON body
app.use(express.json());
app.use(cors());

const tokenAuth = new BoxDeveloperTokenAuth({token: 'fdfdfd'})
//const boxClient = new BoxClient({ auth: boxOAuth});

app.get('/', (req: Request, res: Response) => {
    res.send('Check the console for query parameters.');
});

app.post('/', (req: Request, res: Response) => {
    const { downloadUrl, fileId, fileName } = req.body as { downloadUrl: string, fileId: string, fileName: string };
    console.log('Query parameters:', {downloadUrl, fileId, fileName });
    const downloadFile = async (url: string, filePath: string) => {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    };

    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
        fs.mkdirSync(downloadsDir);
    }

    const filePath = path.join(downloadsDir, fileName);
    downloadFile(downloadUrl, filePath)
        .then(() => {
            console.log(`File downloaded successfully to ${filePath}`)
            exec(`start winword "${filePath}"`, (err: any) => {
                if (err) {
                    console.error('Error opening file with Word:', err);
                } else {
                    console.log(`File opened with Microsoft Word: ${filePath}`);
                }
            });
        })
        .catch((error) => console.error('Error downloading file:', error));
    res.send('Check the console for body parameters.');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
