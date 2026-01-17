import fs from 'fs/promises';
import path from 'path';

export const deleteFileFromUploads = async (fileUrl) => {
    try {
        const filePath = fileUrl.startsWith('/') ? path.join(process.cwd(), fileUrl) : fileUrl;
        await fs.unlink(filePath);
    }
    catch (err) {
        console.warn('Failed to delete file:', err);
    }
}