import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { stat } from 'fs/promises';

export async function GET(request, { params }) {
    try {
        const { filename } = await params;
        const file_path = Array.isArray(filename) ? filename.join("/") : filename;
        const filePath = join(process.cwd(), 'public', file_path);

        // Check if file exists
        const fileStat = await stat(filePath);

        const range = request.headers.get('range');
        if (range) {
            // Parse the Range header
            const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
            const start = parseInt(startStr, 10);
            const end = endStr ? parseInt(endStr, 10) : fileStat.size - 1;

            if (start >= fileStat.size || end >= fileStat.size) {
                return new Response('Requested range not satisfiable', { status: 416 });
            }

            const chunkSize = end - start + 1;
            const fileStream = createReadStream(filePath, { start, end });

            return new Response(fileStream, {
                status: 206, // Partial Content
                headers: {
                    'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunkSize,
                    'Content-Type': getContentType(filePath),
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        }

        // Serve the whole file if no range is requested
        const fileStream = createReadStream(filePath);

        return new Response(fileStream, {
            headers: {
                'Content-Length': fileStat.size,
                'Content-Type': getContentType(filePath),
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error reading file:', error);
        if (error.code === 'ENOENT') {
            return new Response('File not found', { status: 404 });
        }
        return new Response('Internal Server Error', { status: 500 });
    }
}

// Utility function to get the Content-Type based on file extension
function getContentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.bmp': 'image/bmp',
        '.tiff': 'image/tiff',
        '.tif': 'image/tiff',
        '.mp4': 'video/mp4',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.mkv': 'video/x-matroska',
        '.wmv': 'video/x-ms-wmv',
        '.flv': 'video/x-flv',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.ogg': 'audio/ogg',
        '.m4a': 'audio/mp4',
        '.flac': 'audio/flac',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.txt': 'text/plain',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.xml': 'application/xml',
        '.zip': 'application/zip',
        '.rar': 'application/x-rar-compressed',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
    };

    return mimeTypes[ext] || 'application/octet-stream';
}
