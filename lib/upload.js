// Cloudinary upload utility
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Parse multipart form data
async function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const Busboy = require('busboy');
    const bb = Busboy({ headers: req.headers });
    const fields = {};
    const files = {};

    bb.on('file', (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      file.on('data', chunk => chunks.push(chunk));
      file.on('end', () => {
        files[fieldname] = {
          buffer: Buffer.concat(chunks),
          filename,
          mimeType
        };
      });
    });

    bb.on('field', (name, val) => { fields[name] = val; });
    bb.on('finish', () => resolve({ fields, files }));
    bb.on('error', reject);
    req.pipe(bb);
  });
}

// Upload buffer to Cloudinary
async function uploadToCloudinary(buffer, options = {}) {
  const defaultOptions = {
    folder: 'activamente',
    resource_type: 'auto',
  };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// Upload image
async function uploadImage(buffer, publicId) {
  return uploadToCloudinary(buffer, {
    folder: 'activamente/images',
    public_id: publicId,
    resource_type: 'image',
    transformation: { quality: 'auto', fetch_format: 'auto' }
  });
}

// Upload audio
async function uploadAudio(buffer, publicId) {
  return uploadToCloudinary(buffer, {
    folder: 'activamente/audio',
    public_id: publicId,
    resource_type: 'video' // Cloudinary treats audio as video
  });
}

// Upload document
async function uploadDocument(buffer, publicId, mimeType) {
  return uploadToCloudinary(buffer, {
    folder: 'activamente/documents',
    public_id: publicId,
    resource_type: 'raw'
  });
}

module.exports = {
  uploadToCloudinary, uploadImage, uploadAudio, uploadDocument,
  parseMultipart
};
