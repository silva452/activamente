module.exports = async (req, res) => {
  const html = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>OK</h1></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).end(html);
};
