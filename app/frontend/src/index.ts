/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly DEV: boolean
    readonly PROD: boolean
    readonly MODE: string
    // Add other env variables you use
}
interface ImportMeta {
    readonly env: ImportMetaEnv
}

import markdownit from 'markdown-it';
type Blog = {
    date: string,
    name: string,
    title?: string,
    file?: string,
}
const backendUrl = import.meta.env.VITE_BACKEND ?? `${window.location.protocol}//${window.location.host}`;

const md = markdownit();
const contentElement = document.querySelector('#md-content');

async function renderMarkdown(markdownText: string, blogBasePath: string): Promise<string> {
    // Replace the image paths before rendering
    const processedMarkdown = markdownText.replace(/\[(.*)\]: \.\//g, (match, p1) => {
        // p1 is ![...](, p2 is ./, p3 is cover.png, p4 is )
        return `[${p1}]: ${blogBasePath}/`
    });

    const html = md.render(processedMarkdown);
    return html;
}

// Example usage


export function setContent(blog: Blog) {
    const blogEntryPath = new URL(`/blogs/${blog.date}/${blog.name}`, backendUrl).toString();
    const markdownUrl = `${blogEntryPath}/index.md`;
    fetch(markdownUrl)
        .then(res => res.text())
        .then(async markdownText => {
            // The base path for your images is the directory containing the index.md
            const renderedHtml = await renderMarkdown(markdownText, blogEntryPath);
            if (contentElement) contentElement.innerHTML = renderedHtml;
        });
}


fetch(new URL('/blogs', backendUrl))
    .then(res => res.json())
    .then((data: Blog[]) => {
        const container = document.getElementById('article-list');
        container!.innerHTML = '';

        const dates = Array.from(new Set(data.map(blog => blog.date)));
        dates.forEach(date => {
            const li = document.createElement('li');
            li.className = ""

            const title = document.createElement('div');
            title.textContent = date;
            li.append(title);

            const ul = document.createElement('ul');
            li.id = `article-date-${date}`;
            li.append(ul);

            container?.append(li);
        });
        data.forEach((blog) => {
            const dateContainer = document.querySelector(`#article-date-${blog.date}>ul`);
            const li = document.createElement('li');
            li.className = 'pl-4';
            const button = document.createElement('button');
            button.className = 'whitespace-nowrap overflow-hidden max-w-full overflow-ellipsis';
            button.textContent = blog.title!;
            button.onclick = () => setContent(blog);
            li.append(button);
            dateContainer?.append(li);
        });
    });