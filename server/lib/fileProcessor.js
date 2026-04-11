import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

export const compressImageForGemini = async (filePath, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const fileBuffer = fs.readFileSync(filePath)
      const base64 = fileBuffer.toString('base64')
      console.log('PDF size (chars):', base64.length)
      return { base64, mimeType: 'application/pdf' }
    }

    const compressed = await sharp(filePath)
      .resize(1200, 1600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 70 })
      .toBuffer()

    const base64 = compressed.toString('base64')
    
    console.log('Original size:', fs.statSync(filePath).size, 'bytes')
    console.log('Compressed size:', compressed.length, 'bytes')
    console.log('Base64 length:', base64.length, 'chars')
    
    return { base64, mimeType: 'image/jpeg' }

  } catch (err) {
    console.error('Compression error:', err)
    const fileBuffer = fs.readFileSync(filePath)
    return {
      base64: fileBuffer.toString('base64'),
      mimeType: mimeType
    }
  }
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

export const cleanupFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Cleanup error:', err)
  }
}