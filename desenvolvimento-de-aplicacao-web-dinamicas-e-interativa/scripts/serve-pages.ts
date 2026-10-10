import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pagesBase } from './pages-build.ts';

const base: string = pagesBase(process.env.FOLIO_BASE_PATH ?? '/posUtfpr/');
const port: number = Number(process.env.FOLIO_PAGES_PORT ?? '4174');
const directory: string = resolve('dist');
const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png',
};

const server: Server = createServer(async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    try {
        const url: URL = new URL(request.url ?? '/', `http://127.0.0.1:${port}`);
        if (!url.pathname.startsWith(base)) {
            response.writeHead(404, { 'Content-Type': 'text/plain' }).end('Fora da base do site.');
            return;
        }
        const suffix: string = decodeURIComponent(url.pathname.slice(base.length));
        const file: string = resolve(directory, suffix || 'index.html');
        if (!file.startsWith(directory + sep)) {
            response.writeHead(400).end('Caminho inválido.');
            return;
        }
        try {
            const info = await stat(file);
            if (!info.isFile()) { throw Object.assign(new Error('Arquivo ausente'), { code: 'ENOENT' }); }
            response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
            response.end(await readFile(file));
        } catch (error: unknown) {
            if (!(error instanceof Error) || !('code' in error) || (error.code !== 'ENOENT' && error.code !== 'ENOTDIR')) {
                throw error;
            }
            // Imita Pages: deep link recebe 404 real, sem reescrita automática para index.
            response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            response.end(await readFile(resolve(directory, '404.html')));
        }
    } catch {
        response.writeHead(500).end('Não foi possível servir o arquivo.');
    }
});

server.listen(port, '127.0.0.1');
process.once('SIGTERM', (): void => { server.close(); });
process.once('SIGINT', (): void => { server.close(); });
