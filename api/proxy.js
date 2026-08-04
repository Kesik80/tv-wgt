export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const target = req.query.url;
  if (!target) { res.status(400).send('Usage: ?url=https://example.com'); return; }

  try {
    const r = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow'
    });
    const buf = Buffer.from(await r.arrayBuffer());
    res.status(r.status);
    const ct = r.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.send(buf);
  } catch (e) {
    res.status(502).send('Proxy error: ' + e.message);
  }
}