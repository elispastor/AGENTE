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

  // Construir HTML de la tarjeta con el diseño de la plantilla de mototaxis
  const fotoPortadaHTML = tarjeta.fotoPortada
    ? `<img src="/uploads/${tarjeta.fotoPortada}" style="width:100%; border-radius:12px; margin:12px 0;">`
    : '';

  const carruselHTML = tarjeta.fotosCarrusel.length
    ? tarjeta.fotosCarrusel.map(f => `<img src="/uploads/${f}" style="width:100%; border-radius:8px; margin:4px;">`).join('')
    : '';

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
      <title>Tarjeta SAI</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', Roboto, system-ui, sans-serif; }
        body { background: linear-gradient(145deg, #0a1a2e, #1a2f44); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 16px; }
        .card { max-width: 440px; width: 100%; background: #ffffff; border-radius: 36px; box-shadow: 0 25px 50px -8px rgba(0,0,0,0.6); overflow: hidden; }

        .portada { background: linear-gradient(135deg, #0f2b44, #1a4b6d); padding: 20px; text-align: center; border-bottom: 4px solid #fbbf24; }
        .portada .icon { font-size: 56px; color: #fbbf24; }
        .portada h1 { font-size: 22px; font-weight: 800; color: #fff; }
        .portada h1 span { color: #fbbf24; }

        .profile { padding: 20px; text-align: center; }
        .profile .avatar { width: 80px; height: 80px; background: linear-gradient(135deg, #0f2b44, #1a4b6d); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; border: 4px solid #fbbf24; }
        .profile .avatar i { font-size: 36px; color: #fff; }
        .profile h2 { font-size: 20px; font-weight: 700; color: #0b1a2e; }
        .profile .business { font-size: 16px; font-weight: 600; color: #1a4b6d; }
        .profile .phone { font-size: 15px; color: #4a5e72; margin: 4px 0; }
        .profile .address { font-size: 14px; color: #6b7f93; }

        .carrusel { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin: 12px 0; }
        .carrusel img { max-width: 100%; border-radius: 8px; }

        .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 0 20px 16px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 18px; border-radius: 60px; font-weight: 700; font-size: 14px; border: none; cursor: pointer; text-decoration: none; flex: 1 0 auto; min-width: 100px; }
        .btn-whatsapp { background: #25D366; color: #fff; }
        .btn-call { background: #1a4b6d; color: #fff; }
        .btn-share { background: #fbbf24; color: #0b1a2e; }

        .qr-section { text-align: center; padding: 8px 20px 16px; }
        .qr-section img { width: 120px; height: 120px; border-radius: 16px; background: #fff; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        .footer { background: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #eef2f6; }
        .footer a { text-decoration: none; font-weight: 700; color: #1a4b6d; }
        .footer small { display: block; font-size: 12px; color: #6b7f93; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="portada">
          <div class="icon"><i class="fas fa-id-card"></i></div>
          <h1>TARJETA <span>SAI</span></h1>
        </div>

        <div class="profile">
          <div class="avatar"><i class="fas fa-user-tie"></i></div>
          <h2 id="nombreTarjeta">${tarjeta.nombre || 'Usuario SAI'}</h2>
          <div class="business"><i class="fas fa-briefcase"></i> Digital</div>
          <div class="phone"><i class="fas fa-phone"></i> ${tarjeta.telefono || 'No disponible'}</div>
          <div class="address"><i class="fas fa-envelope"></i> ${tarjeta.email || 'No disponible'}</div>
        </div>

        ${fotoPortadaHTML ? `<div style="padding:0 20px;">${fotoPortadaHTML}</div>` : ''}
        ${carruselHTML ? `<div class="carrusel" style="padding:0 20px;">${carruselHTML}</div>` : ''}

        <div class="actions">
          <a href="https://wa.me/${tarjeta.telefono || ''}" target="_blank" class="btn btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>
          <a href="tel:${tarjeta.telefono || ''}" class="btn btn-call"><i class="fas fa-phone"></i> Llamar</a>
          <button class="btn btn-share" onclick="compartir()"><i class="fas fa-share-alt"></i> Compartir</button>
        </div>

        <div class="qr-section">
          <img id="qrImage" src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tarjeta.enlace)}" alt="Código QR" />
          <p><i class="fas fa-qrcode"></i> Escanea para ver esta tarjeta</p>
        </div>

        <div class="footer">
          <a href="https://guia-digital.com" target="_blank">🐙 Guía Digital</a>
          <small>Tarjeta generada con SAI</small>
        </div>
      </div>

      <script>
        function compartir() {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'Tarjeta SAI', url: url });
          } else {
            navigator.clipboard.writeText(url).then(() => alert('📋 Enlace copiado. ¡Comparte tu tarjeta!'));
          }
        }
      </script>
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
