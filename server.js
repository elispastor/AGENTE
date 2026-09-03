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

// ======================================================
// RUTA: Generar tarjeta con fotos
// ======================================================
app.post('/api/generar-tarjeta', upload.any(), (req, res) => {
  const { nombre, telefono, email } = req.body;

  const fotoPortada = req.files.find(f => f.fieldname === 'fotoPortada');
  const fotosCarrusel = req.files.filter(f => f.fieldname === 'fotosCarrusel');

  const id = Date.now().toString(36);
  const enlace = `https://agente-1-w4vk.onrender.com/tarjeta/${id}`;

  tarjetas[id] = {
    nombre,
    telefono,
    email,
    fotoPortada: fotoPortada ? fotoPortada.filename : null,
    fotosCarrusel: fotosCarrusel.map(f => f.filename),
    enlace
  };

  res.json({
    mensaje: '✅ Tarjeta generada',
    enlace,
    tarjeta: { nombre, telefono, email }
  });
});

// ======================================================
// RUTA: Ver tarjeta con CARRUSEL MEJORADO
// ======================================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  // Preparar fotos para el carrusel
  const fotos = [];
  if (tarjeta.fotoPortada) fotos.push(`/uploads/${tarjeta.fotoPortada}`);
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotos.push(`/uploads/${f}`));
  }

  // Generar caras del carrusel (SOLO IMÁGENES)
  let carruselHTML = '';
  if (fotos.length > 0) {
    fotos.forEach((url) => {
      carruselHTML += `
        <figure>
          <img src="${url}" alt="Foto">
        </figure>
      `;
    });
  } else {
    carruselHTML = `
      <figure>
        <img src="https://via.placeholder.com/400/fbbf24/0b2b40?text=Sube+una+foto" alt="Sin foto">
      </figure>
    `;
  }

  const totalFotos = fotos.length || 1;
  const angulo = 360 / totalFotos;
  const translateZ = Math.min(400, Math.max(200, totalFotos * 60));

  let carasCSS = '';
  for (let i = 0; i < totalFotos; i++) {
    carasCSS += `
      .carousel figure:nth-child(${i + 1}) {
        transform: rotateY(${i * angulo}deg) translateZ(${translateZ}px);
      }
    `;
  }

  // HTML con estructura mejorada (sin redundancia)
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
      <title>Tarjeta SAI - TDI</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: linear-gradient(145deg, #0a1a2e, #1a2f44);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        }
        .container {
          max-width: 500px;
          width: 100%;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          border-radius: 36px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 25px 50px -8px rgba(0,0,0,0.6);
        }
        .carousel-wrapper {
          perspective: 1000px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        .carousel {
          width: 260px;
          height: 280px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate 20s infinite linear;
        }
        .carousel figure {
          position: absolute;
          width: 90%;
          height: 90%;
          left: 5%;
          top: 5%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(251,191,36,0.2);
          border: 2px solid #fbbf24;
          backface-visibility: hidden;
          background: #0b2b40;
        }
        .carousel figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        ${carasCSS}
        @keyframes rotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .info {
          text-align: center;
          color: white;
          margin: 10px 0 16px;
          padding: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 {
          font-size: 22px;
          font-weight: 700;
          color: #fbbf24;
        }
        .info p {
          font-size: 16px;
          color: #a0c4e8;
          margin: 4px 0;
        }

        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 12px 0;
        }
        .botones a, .botones button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          flex: 1 0 auto;
          justify-content: center;
        }
        .botones a:hover, .botones button:hover {
          transform: scale(1.04);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }

        .qr {
          text-align: center;
          margin: 8px 0 12px;
        }
        .qr img {
          width: 110px;
          height: 110px;
          border-radius: 16px;
          background: #fff;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .qr p {
          color: #a0c4e8;
          font-size: 13px;
          margin-top: 4px;
        }

        .controls {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 8px;
        }
        .controls button {
          background: #fbbf24;
          border: none;
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 14px;
          color: #0b1a2e;
          cursor: pointer;
          transition: 0.2s;
        }
        .controls button:hover {
          background: #f59e0b;
        }
        .controls .info {
          color: #a0c4e8;
          font-size: 13px;
          display: flex;
          align-items: center;
        }

        @media (max-width: 480px) {
          .carousel { width: 200px; height: 220px; }
          .info h2 { font-size: 18px; }
          .botones a, .botones button { font-size: 13px; padding: 10px 14px; }
          .qr img { width: 90px; height: 90px; }
        }
        @media (min-width: 768px) {
          .carousel { width: 340px; height: 360px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="carousel-wrapper">
          <div class="carousel" id="carousel">
            ${carruselHTML}
          </div>
        </div>

        <div class="info">
          <h2>🧾 ${tarjeta.nombre}</h2>
          <p>📱 ${tarjeta.telefono}</p>
          <p>📧 ${tarjeta.email}</p>
        </div>

        <div class="botones">
          <a href="https://wa.me/${tarjeta.telefono}" target="_blank" class="btn-wa">💬 WhatsApp</a>
          <a href="tel:${tarjeta.telefono}" class="btn-llamar">📞 Llamar</a>
          <button class="btn-compartir" onclick="compartir()">🔗 Compartir</button>
        </div>

        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}" alt="Código QR">
          <p>Escanea para ver la tarjeta</p>
        </div>

        <div class="controls">
          <span class="info">🔄 Gira el carrusel</span>
          <button id="btnPausar">⏸ Pausar</button>
          <button id="btnReanudar">▶ Reanudar</button>
        </div>
      </div>

      <script>
        const carousel = document.getElementById('carousel');
        let paused = false;

        document.getElementById('btnPausar').addEventListener('click', function() {
          if (!paused) {
            carousel.style.animationPlayState = 'paused';
            paused = true;
          }
        });

        document.getElementById('btnReanudar').addEventListener('click', function() {
          if (paused) {
            carousel.style.animationPlayState = 'running';
            paused = false;
          }
        });

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

// ======================================================
// Página principal
// ======================================================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor SAI con TDI en puerto ${PORT}`);
});
