import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'node:fs';
dotenv.config();

let { PORT } = process.env;
if (!PORT) throw new Error('please set PORT in .env file. (e.g. PORT=3000)');

import express from 'express';
const app = express();
app.use(express.json());
app.use(cors());
type Blog = {
    date: string,
    name: string,
    title?: string,
    file?: string,
}

function extractFirstH1(mdContent: string): string | null {
    const h1Match = mdContent.match(/^#\s+(.+)$/m);
    return h1Match ? h1Match[1].trim() : null;
}
app.get('/blogs/:date/:name/:file', (req, res, next) => {
    const { date, name, file } = req.params as Blog;
    let mimeType = '';
    if (file.endsWith('.md')) mimeType = 'text/plain';
    if (file.endsWith('.png')) mimeType = 'image/png';
    try {
        const content = fs.readFileSync(`blogs/${date}/${name}/${file}`);
        res.setHeaders(new Headers({
            "Content-Type": mimeType
        }));
        res.status(200).end(content);
    } catch (e) {
        return next(e);
    }
});

app.get('/blogs', (req, res) => {
    const dates = fs.readdirSync('blogs');
    const result: Blog[] = [];
    dates.forEach(date => {
        const names = fs.readdirSync(`blogs/${date}`);
        names.forEach(name => {
            const title = extractFirstH1(new TextDecoder().decode(fs.readFileSync(`blogs/${date}/${name}/index.md`)))
            result.push({
                date,
                title,
                name,
            });
        })
    });
    res.status(200).end(JSON.stringify(result));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});