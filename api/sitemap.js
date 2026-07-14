// /api/sitemap - Dynamic sitemap.xml generator
const { query } = require('../lib/db');
const SITE_URL = 'https://activamente.vercel.app';

module.exports = async (req, res) => {
  try {
    // Fetch all active psychologists for profile URLs
    const result = await query(
      'SELECT user_id, name FROM psychologists WHERE is_active = true ORDER BY user_id'
    );

    const today = new Date().toISOString().split('T')[0];

    let urls = `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/nosotros</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contacto</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${SITE_URL}/especialistas</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/foro</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/iniciar-sesion</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/registro</loc>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`;

    // Add psychologist profile URLs
    for (const psy of result.rows) {
      urls += `
  <url>
    <loc>${SITE_URL}/especialista/${psy.user_id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
    res.status(200).end(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(200).end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}/</loc></url></urlset>`);
  }
};
