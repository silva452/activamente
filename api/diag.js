const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    // Test 1: Can we read cwd?
    const cwd = process.cwd();

    // Test 2: Can we read the template?
    const htmlPath = path.join(cwd, 'private', 'template.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Test 3: Can we do regex replacement?
    const result = html.replace(
      /<div id="loading"[^>]*>[\s\S]*?<nav/,
      '<nav'
    );

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).end(JSON.stringify({
      cwd,
      htmlLength: html.length,
      resultLength: result.length,
      hasLoading: result.includes('loading'),
      hasNav: result.includes('<nav'),
      startOk: html.startsWith('<!DOCTYPE'),
    }));
  } catch(e) {
    res.status(500).end('ERROR: ' + e.message + ' | stack: ' + (e.stack || '').substring(0, 500));
  }
};
