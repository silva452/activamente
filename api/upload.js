// /api/upload - Multipart handler for file uploads + profile updates
const { query } = require('../lib/db');
const { getUserFromRequest, setCors, handleOptions } = require('../lib/auth');
const Busboy = require('busboy');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};
    let fileCount = 0;
    let processedFiles = 0;

    const bb = Busboy({ headers: req.headers });

    bb.on('field', (name, val) => { fields[name] = val; });

    bb.on('file', (fieldname, fileStream, info) => {
      fileCount++;
      const chunks = [];
      fileStream.on('data', d => chunks.push(d));
      fileStream.on('end', () => {
        files[fieldname] = Buffer.concat(chunks);
        processedFiles++;
        if (processedFiles >= fileCount) checkDone();
      });
    });

    function checkDone() {
      if (processedFiles >= fileCount) resolve({ fields, files, hasFiles: fileCount > 0 });
    }

    bb.on('finish', () => {
      if (fileCount === 0) resolve({ fields, files: {}, hasFiles: false });
    });

    bb.on('error', reject);
    req.pipe(bb);
  });
}

async function uploadBuffer(buffer, fieldname, userId) {
  const publicId = `${fieldname}_${userId}_${Date.now()}`;
  let folder = 'activamente';
  let resourceType = 'auto';

  if (fieldname === 'image_file') { folder = 'activamente/images'; resourceType = 'image'; }
  else if (fieldname === 'audio_file') { folder = 'activamente/audio'; resourceType = 'video'; }
  else if (fieldname === 'doc_file') { folder = 'activamente/documents'; resourceType = 'raw'; }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: resourceType, quality: 'auto' },
      (err, result) => err ? reject(err) : resolve(result.secure_url)
    );
    stream.end(buffer);
  });
}

module.exports = async (req, res) => {
  setCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'No autorizado' });

    const action = req.query.action || '';

    // Parse multipart form data
    const { fields, files, hasFiles } = await parseMultipart(req);

    // Upload any files to Cloudinary
    const uploadedUrls = {};
    for (const [fieldname, buffer] of Object.entries(files)) {
      try {
        uploadedUrls[fieldname] = await uploadBuffer(buffer, fieldname, user.user_id);
      } catch (e) {
        console.error(`Upload error for ${fieldname}:`, e);
      }
    }

    // Handle profile update (with optional files)
    if (action === 'update_profile') {
      const imageUrl = uploadedUrls.image_file || fields.image || '';
      const audioUrl = uploadedUrls.audio_file || fields.audio_url || '';

      await query(
        `UPDATE psychologists SET name=$1, specialty=$2, bio=$3, education=$4, approach=$5,
         price=$6, image=$7, audio_url=$8, whatsapp_number=$9, instagram=$10, linkedin=$11,
         values_tags=$12, profile_vibe=$13 WHERE user_id=$14`,
        [
          fields.name || '', fields.specialty || '', fields.bio || '',
          fields.education || '', fields.approach || '', parseFloat(fields.price) || 0,
          imageUrl, audioUrl,
          fields.whatsapp_number || '', fields.instagram || '', fields.linkedin || '',
          fields.values_tags || '', fields.profile_vibe || 'zen', user.user_id
        ]
      );
      return res.json({ success: true, image: imageUrl, audio_url: audioUrl });
    }

    // Handle vault document upload
    if (action === 'upload_vault_doc') {
      const fileUrl = uploadedUrls.doc_file || '';
      if (!fileUrl) return res.status(400).json({ error: 'Archivo no subido' });

      await query(
        'INSERT INTO patient_documents (psychologist_id, patient_email, file_url, title) VALUES ($1, $2, $3, $4)',
        [user.user_id, fields.patient_email || '', fileUrl, fields.title || 'Documento sin título']
      );
      return res.json({ success: true, url: fileUrl });
    }

    // If no action matched but we have files, just return the URLs
    if (hasFiles) {
      return res.json({ success: true, urls: uploadedUrls });
    }

    return res.status(400).json({ error: 'No action specified' });

  } catch (e) {
    console.error('Upload handler error:', e);
    return res.status(500).json({ error: e.message || 'Error al procesar la solicitud.' });
  }
};
