import { NextResponse } from 'next/server';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { stat } from 'fs/promises';
import { Readable } from 'stream';

export async function GET(request, { params }) {
  const { filename } = await params;
  const file_path = filename.join("/");
  const filePath = join(process.cwd(), 'public', file_path);

  try {
    // Check if file exists
    const fileStat = await stat(filePath);

    // Create a readable stream for the file
    const fileStream = createReadStream(filePath);

    // Convert Node.js stream to Web Stream API
    const webStream = Readable.toWeb(fileStream);

    const response = new NextResponse(webStream);

    // Set appropriate Content-Type header based on file extension
    const ext = extname(filePath).toLowerCase();
    let contentTypeSet = true;

    switch (ext) {
      // Image formats
      case '.jpg':
      case '.jpeg':
        response.headers.set('Content-Type', 'image/jpeg');
        break;
      case '.png':
        response.headers.set('Content-Type', 'image/png');
        break;
      case '.gif':
        response.headers.set('Content-Type', 'image/gif');
        break;
      case '.webp':
        response.headers.set('Content-Type', 'image/webp');
        break;
      case '.svg':
        response.headers.set('Content-Type', 'image/svg+xml');
        break;
      case '.bmp':
        response.headers.set('Content-Type', 'image/bmp');
        break;
      case '.tiff':
      case '.tif':
        response.headers.set('Content-Type', 'image/tiff');
        break;

      // Video formats
      case '.mp4':
        response.headers.set('Content-Type', 'video/mp4');
        break;
      case '.avi':
        response.headers.set('Content-Type', 'video/x-msvideo');
        break;
      case '.mov':
        response.headers.set('Content-Type', 'video/quicktime');
        break;
      case '.mkv':
        response.headers.set('Content-Type', 'video/x-matroska');
        break;
      case '.wmv':
        response.headers.set('Content-Type', 'video/x-ms-wmv');
        break;
      case '.flv':
        response.headers.set('Content-Type', 'video/x-flv');
        break;
      case '.webm':
        response.headers.set('Content-Type', 'video/webm');
        break;

      // Audio formats
      case '.mp3':
        response.headers.set('Content-Type', 'audio/mpeg');
        break;
      case '.wav':
        response.headers.set('Content-Type', 'audio/wav');
        break;
      case '.ogg':
        response.headers.set('Content-Type', 'audio/ogg');
        break;
      case '.m4a':
        response.headers.set('Content-Type', 'audio/mp4');
        break;
      case '.flac':
        response.headers.set('Content-Type', 'audio/flac');
        break;

      // Document formats
      case '.pdf':
        response.headers.set('Content-Type', 'application/pdf');
        break;
      case '.doc':
        response.headers.set('Content-Type', 'application/msword');
        break;
      case '.docx':
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        break;
      case '.xls':
        response.headers.set('Content-Type', 'application/vnd.ms-excel');
        break;
      case '.xlsx':
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        break;
      case '.ppt':
        response.headers.set('Content-Type', 'application/vnd.ms-powerpoint');
        break;
      case '.pptx':
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        break;
      case '.txt':
        response.headers.set('Content-Type', 'text/plain');
        break;
      case '.csv':
        response.headers.set('Content-Type', 'text/csv');
        break;
      case '.json':
        response.headers.set('Content-Type', 'application/json');
        break;
      case '.xml':
        response.headers.set('Content-Type', 'application/xml');
        break;
      case '.zip':
        response.headers.set('Content-Type', 'application/zip');
        break;
      case '.rar':
        response.headers.set('Content-Type', 'application/x-rar-compressed');
        break;

      // Font formats
      case '.woff':
        response.headers.set('Content-Type', 'font/woff');
        break;
      case '.woff2':
        response.headers.set('Content-Type', 'font/woff2');
        break;
      case '.ttf':
        response.headers.set('Content-Type', 'font/ttf');
        break;
      case '.otf':
        response.headers.set('Content-Type', 'font/otf');
        break;

      default:
        contentTypeSet = false;
        return new NextResponse('Access Denied', { status: 403 });
    }

    // Set Content-Length header
    response.headers.set('Content-Length', fileStat.size.toString());

    // Optionally set caching headers
    if (contentTypeSet) {
      response.headers.set('Cache-Control', 'public, max-age=3600');
      // If the content is a video, enable byte-range requests
      if (ext === '.mp4' || ext === '.webm' || ext === '.mkv') {
        response.headers.set('Accept-Ranges', 'bytes');
      }

      // Set security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      // For CORS, if needed (in case the video is hosted on a different domain)
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    }

    return response;
  } catch (error) {
    console.error('Error reading file:', error);
    return new NextResponse('File not found', { status: 404 });
  }
}
