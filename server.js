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
// RUTA: Ver tarjeta con CARRUSEL 3D MEJORADO
// ======================================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  // Preparar fotos para el carrusel (SOLO las del carrusel, NO la portada)
  const fotosCarrusel = [];
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotosCarrusel.push(`/uploads/${f}`));
  }

  // Foto de portada (LOGO) - se muestra aparte
  const fotoPortadaURL = tarjeta.fotoPortada ? `/uploads/${tarjeta.fotoPortada}` : null;

  // Generar caras del carrusel 3D
  let carruselHTML = '';
  const totalFotos = fotosCarrusel.length;

  if (totalFotos > 0) {
    fotosCarrusel.forEach((url) => {
      carruselHTML += `
        <div class="carousel-face">
          <img src="${url}" alt="Foto carrusel">
        </div>
      `;
    });
  } else {
    carruselHTML = `
      <div class="carousel-face">
        <img src="https://via.placeholder.com/400/fbbf24/0b2b40?text=Sube+fotos+al+carrusel" alt="Sin fotos">
      </div>
    `;
  }

  // Calcular ángulos y distancia para el carrusel 3D
  const caras = Math.max(totalFotos, 1);
  const angulo = 360 / caras;
  // Distancia Z adaptativa según cantidad de fotos
  const translateZ = Math.min(350, Math.max(180, caras * 50));

  let carasCSS = '';
  for (let i = 0; i < caras; i++) {
    carasCSS += `
      .carousel-3d .carousel-face:nth-child(${i + 1}) {
        transform: rotateY(${i * angulo}deg) translateZ(${translateZ}px);
      }
    `;
  }

  // HTML COMPLETO
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
          padding: 16px;
          font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        }

        .container {
          max-width: 520px;
          width: 100%;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border-radius: 40px;
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
        }

        /* ===== FOTO DE PORTADA (LOGO) ===== */
        .foto-portada-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }
        .foto-portada {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 30px rgba(251,191,36,0.25);
          background: #0b2b40;
          flex-shrink: 0;
        }
        .foto-portada img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .foto-portada-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #0b1a2e;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 30px rgba(251,191,36,0.25);
        }

        /* ===== CARRUSEL 3D ===== */
        .carousel-wrapper {
          perspective: 1200px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 10px 0 18px;
          padding: 10px 0;
        }

        .carousel-3d {
          width: min(280px, 75vw);
          height: min(280px, 75vw);
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCarousel 25s infinite linear;
        }

        .carousel-3d .carousel-face {
          position: absolute;
          width: 90%;
          height: 90%;
          left: 5%;
          top: 5%;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 0 35px rgba(251,191,36,0.15);
          border: 2px solid rgba(251,191,36,0.4);
          backface-visibility: hidden;
          background: #0b2b40;
        }

        .carousel-3d .carousel-face img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        ${carasCSS}

        @keyframes rotateCarousel {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        /* ===== INFORMACIÓN ===== */
        .info {
          text-align: center;
          color: white;
          margin: 6px 0 14px;
          padding: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 {
          font-size: 22px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.5px;
        }
        .info p {
          font-size: 15px;
          color: #a0c4e8;
          margin: 3px 0;
        }

        /* ===== BOTONES ===== */
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 10px 0 14px;
        }
        .botones a, .botones button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          flex: 1 0 auto;
          min-width: 100px;
        }
        .botones a:hover, .botones button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(0,0,0,0.4);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }

        /* ===== QR ===== */
        .qr {
          text-align: center;
          margin: 6px 0 12px;
        }
        .qr img {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          background: #fff;
          padding: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .qr p {
          color: #a0c4e8;
          font-size: 12px;
          margin-top: 4px;
        }

        /* ===== CONTROLES ===== */
        .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 6px;
        }
        .controls button {
          background: #fbbf24;
          border: none;
          padding: 8px 22px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          color: #0b1a2e;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(251,191,36,0.3);
        }
        .controls button:hover {
          background: #f59e0b;
          transform: scale(1.04);
        }
        .controls .info-text {
          color: #a0c4e8;
          font-size: 13px;
          display: flex;
          align-items: center;
          padding: 0 6px;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 480px) {
          .container { padding: 18px 14px; }
          .foto-portada, .foto-portada-placeholder { width: 90px; height: 90px; }
          .foto-portada-placeholder { font-size: 36px; }
          .carousel-3d { width: min(220px, 70vw); height: min(220px, 70vw); }
          .info h2 { font-size: 18px; }
          .botones a, .botones button { font-size: 12px; padding: 10px 12px; min-width: 80px; }
          .qr img { width: 80px; height: 80px; }
          .controls button { font-size: 12px; padding: 6px 16px; }
        }

        @media (min-width: 768px) {
          .carousel-3d { width: 320px; height: 320px; }
          .foto-portada, .foto-portada-placeholder { width: 140px; height: 140px; }
        }

        /* Pequeño ajuste para pantallas muy pequeñas */
        @media (max-width: 360px) {
          .carousel-3d { width: 180px; height: 180px; }
          .foto-portada, .foto-portada-placeholder { width: 70px; height: 70px; }
          .foto-portada-placeholder { font-size: 28px; }
        }
      </style>
    </head>
    <body>
      <div class="container">

        <!-- FOTO DE PORTADA (LOGO) - DESTACADA -->
        <div class="foto-portada-wrapper">
          ${fotoPortadaURL ? `
            <div class="foto-portada">
              <img src="${fotoPortadaURL}" alt="Logo">
            </div>
          ` : `
            <div class="foto-portada-placeholder">🖼️</div>
          `}
        </div>

        <!-- CARRUSEL 3D (SOLO FOTOS DEL CARRUSEL) -->
        <div class="carousel-wrapper">
          <div class="carousel-3d" id="carousel3d">
            ${carruselHTML}
          </div>
        </div>

        <!-- INFORMACIÓN -->
        <div class="info">
          <h2>🧾 ${tarjeta.nombre}</h2>
          <p>📱 ${tarjeta.telefono}</p>
          <p>📧 ${tarjeta.email}</p>
        </div>

        <!-- BOTONES -->
        <div class="botones">
          <a href="https://wa.me/${tarjeta.telefono}" target="_blank" class="btn-wa">💬 WhatsApp</a>
          <a href="tel:${tarjeta.telefono}" class="btn-llamar">📞 Llamar</a>
          <button class="btn-compartir" onclick="compartir()">🔗 Compartir</button>
        </div>

        <!-- QR -->
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}" alt="Código QR">
          <p>📲 Escanea para ver la tarjeta</p>
        </div>

        <!-- CONTROLES -->
        <div class="controls">
          <span class="info-text">🔄 Giro automático</span>
          <button id="btnPausar">⏸ Pausar</button>
          <button id="btnReanudar">▶ Reanudar</button>
        </div>

      </div>

      <script>
        const carousel = document.getElementById('carousel3d');
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
