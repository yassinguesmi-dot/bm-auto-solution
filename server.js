const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const root = __dirname;

const users = [
  { username: 'admin', passwordHash: crypto.createHash('sha256').update('admin123').digest('hex') }
];

const appointments = [];
const contacts = [];
const services = [
  { id: 'ecu', name: 'Reprogrammation ECU', description: 'Stage 1 / Stage 2, optimisation moteur', active: true },
  { id: 'meca', name: 'Réparation mécanique', description: 'Diagnostic, freinage, climatisation', active: true },
  { id: 'diag', name: 'Diagnostic électronique', description: 'Analyse de pannes moteur et calculateur', active: true }
];

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, corsHeaders());
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/status') {
    sendJson(res, 200, { success: true, status: 'ok', environment: process.env.NODE_ENV || 'development' });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/login') {
    const body = JSON.parse(await readBody(req));
    const hash = crypto.createHash('sha256').update(body.password || '').digest('hex');
    const found = users.find((user) => user.username === body.username && user.passwordHash === hash);
    if (found) {
      sendJson(res, 200, { success: true, token: 'demo-token' });
    } else {
      sendJson(res, 401, { success: false, message: 'Identifiants invalides' });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/automation') {
    const body = JSON.parse(await readBody(req));
    const action = body.action;
    if (action === 'createAppointment') {
      const appointment = { id: Date.now().toString(), status: 'en attente', createdAt: new Date().toISOString(), ...body.payload };
      appointments.push(appointment);
      const whatsappMessage = `Nouvelle demande de rendez-vous\nNom: ${appointment.name || ''}\nTéléphone: ${appointment.phone || ''}\nEmail: ${appointment.email || ''}\nVéhicule: ${appointment.vehicle || ''}\nService: ${appointment.service || ''}\nDate: ${appointment.date || ''}\nHeure: ${appointment.time || ''}`;
      const whatsappUrl = `https://wa.me/21697917199?text=${encodeURIComponent(whatsappMessage)}`;
      sendJson(res, 200, { success: true, appointment, whatsappUrl });
      return;
    }
    if (action === 'createContact') {
      const contact = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...body.payload };
      contacts.push(contact);
      sendJson(res, 200, { success: true, contact });
      return;
    }
    sendJson(res, 400, { success: false, message: 'Action inconnue' });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/appointments') {
    sendJson(res, 200, appointments);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/appointments') {
    const body = JSON.parse(await readBody(req));
    const appointment = { id: Date.now().toString(), status: 'en attente', createdAt: new Date().toISOString(), ...body };
    appointments.push(appointment);
    sendJson(res, 200, appointment);
    return;
  }

  if (req.method === 'PATCH' && url.pathname.startsWith('/api/appointments/')) {
    const id = url.pathname.split('/').pop();
    const body = JSON.parse(await readBody(req));
    const item = appointments.find((entry) => entry.id === id);
    if (!item) {
      sendJson(res, 404, { message: 'Rendez-vous introuvable' });
      return;
    }
    item.status = body.status || item.status;
    sendJson(res, 200, item);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/contacts') {
    sendJson(res, 200, contacts);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/contacts') {
    const body = JSON.parse(await readBody(req));
    const contact = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...body };
    contacts.push(contact);
    sendJson(res, 200, { success: true, contact });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/services') {
    sendJson(res, 200, services);
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/services') {
    const body = JSON.parse(await readBody(req));
    services.push({ id: body.id || Date.now().toString(), ...body });
    sendJson(res, 200, services);
    return;
  }

  const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(root, safePath);
  const extension = path.extname(filePath).toLowerCase();

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4'
    }[extension] || (extension === '' ? 'text/html; charset=utf-8' : 'application/octet-stream');
    serveFile(res, filePath, contentType);
    return;
  }

  if (safePath.startsWith('/admin')) {
    serveFile(res, path.join(root, 'admin', 'index.html'), 'text/html; charset=utf-8');
    return;
  }

  serveFile(res, path.join(root, 'index.html'), 'text/html; charset=utf-8');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`BM Auto Solution server running on http://localhost:${PORT}`);
  console.log(`Phone access: http://192.168.100.133:${PORT}`);
});
