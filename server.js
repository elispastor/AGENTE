const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 1880;

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static('uploads'));

const tarjetas = {};

// RUTA: Generar tarjeta con fotos
app.post('/api/generar-tarjeta', upload.fields([
  { name: 'fotoPortada', maxCount: 1 },
  { name: 'fotosCarrusel', maxCount: 5 }
]), (req, res) => {
  console.log('Datos recibidos:', req.body);
  console.log('Archivos recibidos:', req.files);

  const { nombre, telefono, email } = req.body;
  const fotoPortada = req.files['fotoPortada'] ? req.files['fotoPortada'][0].filename : null;
  const fotosCarrusel = req.files['fotosCarrusel'] ? req.files['fotosCarrusel'].map(f => f.filename) : [];

  const id = Date.now().toString(36);
  const enlace = `https://agente-1-w4vk.onrender.com/tarjeta/${id}`;

  tarjetas[id] = { nombre, telefono, email, fotoPortada, fotosCarrusel, enlace };

  res.json({
    mensaje: '✅ Tarjeta generada',
    enlace,
    tarjeta: { nombre, telefono, email, fotoPortada, fotosCarrusel }
  });
});

// RUTA: Ver tarjeta
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  const fotoPortadaHTML = tarjeta.fotoPortada
    ? `<img src="/uploads/${tarjeta.fotoPortada}" style="max-width:100%; border-radius:12px; margin:12px 0;">`
    : '';

  const carruselHTML = tarjeta.fotosCarrusel.length
    ? tarjeta.fotosCarrusel.map(f => `<img src="/uploads/${f}" style="max-width:100%; border-radius:12px; margin:4px;">`).join('')
    : '';

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Tarjeta SAI</title>
      <style>
        body { font-family: Arial; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; text-align: center; }
        .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        h1 { color: #0b2b40; }
        .datos { font-size: 18px; margin: 12px 0; }
        .carrusel { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 12px 0; }
        .carrusel img { max-width: 100%; border-radius: 8px; }
        .enlace { color: #0b2b40; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🧾 Tarjeta SAI</h1>
        ${fotoPortadaHTML}
        <div class="datos">
          <p><strong>👤 ${tarjeta.nombre}</strong></p>
          <p>📱 ${tarjeta.telefono}</p>
          <p>📧 ${tarjeta.email}</p>
        </div>
        ${carruselHTML ? `<div class="carrusel">${carruselHTML}</div>` : ''}
        <p><a href="${tarjeta.enlace}" class="enlace">🔗 Compartir tarjeta</a></p>
        <p><a href="/" class="enlace">← Volver</a></p>
      </div>
    </body>
    </html>
  `);
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor SAI en puerto ${PORT}`);
});
