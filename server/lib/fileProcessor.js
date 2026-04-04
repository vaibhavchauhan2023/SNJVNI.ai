import fs from 'fs'
import path from 'path'

export const fileToBase64 = (filePath) => {
    const fileBuffer = fs.readFileSync(filePath)
    return fileBuffer.toString('base64')
}

export const getMimeType = (filename) => {
    const ext = path.extname(filename).toLowerCase()
    const mimeTypes = {
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp'
    }
    return mimeTypes[ext] || 'image/jpeg'
}