export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      nombre,
      email,
      respuestas,
      arquetipo,
      imagenGenerada,
      timestamp = new Date().toISOString(),
      // Optional: allow passing Supabase credentials in the request body as a fallback
      supabaseUrl: incomingSupabaseUrl,
      supabaseKey: incomingSupabaseKey
    } = req.body || {};

    // Validate required fields
    if (!nombre || !email) {
      return res.status(400).json({
        error: 'Missing required fields: nombre and email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Prepare the complete user data object
    const userData = {
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      respuestas: respuestas || {},
      arquetipo: arquetipo || null,
      imagenGenerada: imagenGenerada || null,
      timestamp,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || null,
        referer: req.headers.referer || null
      }
    };

    // Log a summary of the submission (do not log secrets)
    console.log('User data submitted:', {
      nombre: userData.nombre,
      email: userData.email,
      timestamp: userData.timestamp,
      hasArchetype: !!userData.arquetipo,
      hasImage: !!userData.imagenGenerada,
      answersCount: Object.keys(userData.respuestas).length
    });

    // If an image data URL is provided, attempt to upload it to Supabase Storage
    // Supabase credentials can be set via environment variables SUPABASE_URL and SUPABASE_KEY
    const SUPABASE_URL = (process.env.SUPABASE_URL || incomingSupabaseUrl || '').replace(/\/$/, '');
    const SUPABASE_KEY = process.env.SUPABASE_KEY || incomingSupabaseKey || null;

    async function uploadToSupabase(dataUrl, filename) {
      if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase URL or key not configured');
      }

      const match = String(dataUrl).match(/^data:(.+);base64,(.*)$/);
      if (!match) throw new Error('Invalid data URL for image upload');
      const mime = match[1] || 'image/png';
      const b64 = match[2] || '';
      const buffer = Buffer.from(b64, 'base64');

      // Upload using Supabase Storage REST API: PUT to /storage/v1/object/{bucket}/{path}
      const uploadPath = `${SUPABASE_URL}/storage/v1/object/stickers/${encodeURIComponent(filename)}`;

      const resp = await fetch(uploadPath, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': mime,
          'x-upsert': 'true'
        },
        body: buffer
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        throw new Error(`Supabase upload failed: ${resp.status} ${resp.statusText} ${txt}`);
      }

      // Public URL for the uploaded file (public bucket path)
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/stickers/${encodeURIComponent(filename)}`;
      return publicUrl;
    }

    // Attempt upload if imagenGenerada is a data URL
    if (userData.imagenGenerada && String(userData.imagenGenerada).startsWith('data:')) {
      try {
        // Build a safe filename
        const safeName = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.png`;
        const publicUrl = await uploadToSupabase(userData.imagenGenerada, safeName);
        // Replace imagenGenerada with the public URL returned by Supabase
        userData.imagenGenerada = publicUrl;
        console.log('Uploaded image to Supabase:', publicUrl);
      } catch (uploadErr) {
        console.error('Failed to upload image to Supabase:', uploadErr.message || uploadErr);
        // Keep imagenGenerada as originally provided (data URL) but notify client
        return res.status(502).json({
          success: false,
          error: 'Failed to upload image to Supabase',
          details: String(uploadErr.message || uploadErr)
        });
      }
    }

    // TODO: At this point you can also persist userData to a DB or trigger other side effects

    return res.status(200).json({
      success: true,
      message: 'User data submitted successfully',
      submissionId: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      data: userData
    });

  } catch (error) {
    console.error('Error submitting user data:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: String(error.message || error)
    });
  }
}
