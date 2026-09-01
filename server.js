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
// RUTA: Ver tarjeta con CARRUSEL 3D PERFECTO
// ======================================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  // Preparar fotos para el carrusel (SOLO las del carrusel)
  const fotosCarrusel = [];
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotosCarrusel.push(`/uploads/${f}`));
  }

  // Foto de portada (LOGO)
  const fotoPortadaURL = tarjeta.fotoPortada ? `/uploads/${tarjeta.fotoPortada}` : null;

  // Generar caras del carrusel 3D
  let carruselHTML = '';
  const totalFotos = fotosCarrusel.length;

  if (totalFotos > 0) {
    fotosCarrusel.forEach((url) => {
      carruselHTML += `
        <div class="carousel-face">
          <div class="face-content">
            <img src="${url}" alt="Foto carrusel" class="carousel-img">
          </div>
        </div>
      `;
    });
  } else {
    carruselHTML = `
      <div class="carousel-face">
        <div class="face-content">
          <div class="placeholder-text">📸</div>
        </div>
      </div>
    `;
  }

  // Calcular ángulos y distancia para el carrusel 3D
  const caras = Math.max(totalFotos, 1);
  const angulo = 360 / caras;
  const translateZ = Math.min(380, Math.max(200, caras * 55));

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
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
          max-width: 560px;
          width: 100%;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border-radius: 40px;
          padding: 24px 20px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
        }

        /* ===== FOTO DE PORTADA (LOGO) - CÍRCULO PERFECTO ===== */
        .foto-portada-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .foto-portada {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 35px rgba(251,191,36,0.3);
          background: #0b2b40;
          flex-shrink: 0;
          position: relative;
        }
        .foto-portada img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0b2b40;
        }
        .foto-portada-placeholder {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 52px;
          color: #0b1a2e;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 35px rgba(251,191,36,0.3);
        }

        /* ===== CARRUSEL 3D - SIN RECORTAR ===== */
        .carousel-wrapper {
          perspective: 1200px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 8px 0 16px;
          padding: 5px 0;
        }

        .carousel-3d {
          width: min(300px, 80vw);
          height: min(300px, 80vw);
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCarousel 22s infinite linear;
        }

        .carousel-3d .carousel-face {
          position: absolute;
          width: 88%;
          height: 88%;
          left: 6%;
          top: 6%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(251,191,36,0.15);
          border: 2px solid rgba(251,191,36,0.35);
          backface-visibility: hidden;
          background: #0b2b40;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-3d .carousel-face .face-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b2b40;
          overflow: hidden;
        }

        .carousel-3d .carousel-face .carousel-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0b2b40;
          display: block;
        }

        .carousel-3d .carousel-face .placeholder-text {
          font-size: 64px;
          color: #fbbf24;
          text-shadow: 0 0 30px rgba(251,191,36,0.3);
          background: #0b2b40;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
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
          margin: 4px 0 12px;
          padding: 12px 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 {
          font-size: 22px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.5px;
          word-break: break-word;
        }
        .info p {
          font-size: 15px;
          color: #a0c4e8;
          margin: 3px 0;
          word-break: break-word;
        }

        /* ===== BOTONES ===== */
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin: 8px 0 12px;
        }
        .botones a, .botones button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 16px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 13px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          flex: 1 0 auto;
          min-width: 80px;
          touch-action: manipulation;
        }
        .botones a:hover, .botones button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 24px rgba(0,0,0,0.4);
        }
        .botones a:active, .botones button:active {
          transform: scale(0.96);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }

        /* ===== QR ===== */
        .qr {
          text-align: center;
          margin: 4px 0 10px;
        }
        .qr img {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          background: #fff;
          padding: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          max-width: 100%;
        }
        .qr p {
          color: #a0c4e8;
          font-size: 12px;
          margin-top: 4px;
        }

        /* ===== CONTROLES ===== */
        .controls {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .controls button {
          background: #fbbf24;
          border: none;
          padding: 7px 20px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          color: #0b1a2e;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(251,191,36,0.3);
          touch-action: manipulation;
        }
        .controls button:hover {
          background: #f59e0b;
          transform: scale(1.04);
        }
        .controls button:active {
          transform: scale(0.96);
        }
        .controls .info-text {
          color: #a0c4e8;
          font-size: 13px;
          display: flex;
          align-items: center;
          padding: 0 4px;
        }

        /* ===== RESPONSIVE PERFECTO ===== */
        @media (max-width: 480px) {
          .container { padding: 16px 12px 16px; border-radius: 32px; }
          
          .foto-portada, .foto-portada-placeholder { 
            width: 100px; 
            height: 100px; 
          }
          .foto-portada-placeholder { font-size: 40px; }
          
          .carousel-3d { 
            width: min(230px, 72vw); 
            height: min(230px, 72vw); 
          }
          
          .info h2 { font-size: 18px; }
          .info p { font-size: 14px; }
          
          .botones a, .botones button { 
            font-size: 12px; 
            padding: 9px 12px; 
            min-width: 70px;
          }
          
          .qr img { width: 80px; height: 80px; }
          .controls button { font-size: 12px; padding: 6px 14px; }
          .controls .info-text { font-size: 12px; }
        }

        @media (max-width: 380px) {
          .container { padding: 12px 8px; }
          
          .foto-portada, .foto-portada-placeholder { 
            width: 80px; 
            height: 80px; 
          }
          .foto-portada-placeholder { font-size: 32px; }
          
          .carousel-3d { 
            width: min(180px, 68vw); 
            height: min(180px, 68vw); 
          }
          
          .info h2 { font-size: 16px; }
          .info p { font-size: 12px; }
          
          .botones a, .botones button { 
            font-size: 11px; 
            padding: 7px 10px; 
            min-width: 60px;
          }
          
          .qr img { width: 70px; height: 70px; }
          .controls button { font-size: 11px; padding: 5px 12px; }
        }

        @media (min-width: 768px) {
          .carousel-3d { width: 340px; height: 340px; }
          .foto-portada, .foto-portada-placeholder { width: 150px; height: 150px; }
          .container { padding: 32px 28px 24px; }
        }

        @media (min-width: 1024px) {
          .carousel-3d { width: 380px; height: 380px; }
          .foto-portada, .foto-portada-placeholder { width: 160px; height: 160px; }
        }

        /* ===== MEJORAS DE ACCESIBILIDAD ===== */
        @media (prefers-reduced-motion: reduce) {
          .carousel-3d {
            animation-duration: 40s !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">

        <!-- FOTO DE PORTADA (LOGO) -->
        <div class="foto-portada-wrapper">
          ${fotoPortadaURL ? `
            <div class="foto-portada">
              <img src="${fotoPortadaURL}" alt="Logo de ${tarjeta.nombre}">
            </div>
          ` : `
            <div class="foto-portada-placeholder">🖼️</div>
          `}
        </div>

        <!-- CARRUSEL 3D -->
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
