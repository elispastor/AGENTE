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
// RUTA: Ver tarjeta con CARRUSEL 3D PREMIUM
// ======================================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  // Preparar fotos para el carrusel
  const fotosCarrusel = [];
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotosCarrusel.push(`/uploads/${f}`));
  }

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
  const translateZ = Math.min(400, Math.max(220, caras * 55));

  let carasCSS = '';
  for (let i = 0; i < caras; i++) {
    carasCSS += `
      .carousel-3d .carousel-face:nth-child(${i + 1}) {
        transform: rotateY(${i * angulo}deg) translateZ(${translateZ}px);
      }
    `;
  }

  // HTML COMPLETO - DISEÑO PREMIUM
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
          padding: 20px;
          font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        }

        .container {
          max-width: 520px;
          width: 100%;
          background: linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          backdrop-filter: blur(16px);
          border-radius: 48px;
          padding: 30px 24px 28px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 80px -16px rgba(0,0,0,0.8);
          position: relative;
          overflow: hidden;
        }

        /* Efecto de brillo superior */
        .container::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 20%, rgba(251,191,36,0.03), transparent 60%);
          pointer-events: none;
        }

        /* ===== FOTO DE PORTADA (LOGO) ===== */
        .foto-portada-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
          position: relative;
          z-index: 2;
        }
        .foto-portada {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #fbbf24;
          box-shadow: 0 0 40px rgba(251,191,36,0.25), inset 0 0 40px rgba(251,191,36,0.05);
          background: #0b2b40;
          flex-shrink: 0;
          position: relative;
          transition: transform 0.3s ease;
        }
        .foto-portada:hover {
          transform: scale(1.05);
        }
        .foto-portada img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0b2b40;
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
          box-shadow: 0 0 40px rgba(251,191,36,0.25);
        }

        /* ===== CARRUSEL 3D PREMIUM ===== */
        .carousel-wrapper {
          perspective: 1200px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 10px 0 18px;
          padding: 8px 0;
          position: relative;
          z-index: 1;
        }

        .carousel-3d {
          width: min(300px, 78vw);
          height: min(300px, 78vw);
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCarousel 20s infinite linear;
        }

        .carousel-3d .carousel-face {
          position: absolute;
          width: 92%;
          height: 92%;
          left: 4%;
          top: 4%;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 
            0 0 50px rgba(251,191,36,0.15),
            inset 0 0 50px rgba(251,191,36,0.05);
          border: 2px solid rgba(251,191,36,0.3);
          backface-visibility: hidden;
          background: #0b2b40;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        /* Efecto de brillo en cada cara */
        .carousel-3d .carousel-face::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(251,191,36,0.1), transparent 50%);
          pointer-events: none;
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
          text-shadow: 0 0 40px rgba(251,191,36,0.3);
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

        /* ===== INFORMACIÓN MEJORADA ===== */
        .info {
          text-align: center;
          color: white;
          margin: 4px 0 14px;
          padding: 16px 14px;
          background: rgba(0,0,0,0.35);
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.05);
          position: relative;
          z-index: 2;
          backdrop-filter: blur(4px);
        }
        .info h2 {
          font-size: 24px;
          font-weight: 800;
          color: #fbbf24;
          letter-spacing: 0.5px;
          word-break: break-word;
          text-shadow: 0 2px 20px rgba(251,191,36,0.2);
        }
        .info p {
          font-size: 16px;
          color: #a0c4e8;
          margin: 4px 0;
          word-break: break-word;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* ===== BOTONES MODERNOS ===== */
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 12px 0 14px;
          position: relative;
          z-index: 2;
        }
        .botones a, .botones button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 20px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          flex: 1 0 auto;
          min-width: 90px;
          touch-action: manipulation;
          position: relative;
          overflow: hidden;
        }

        /* Efecto de brillo en botones */
        .botones a::before, .botones button::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1), transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .botones a:hover::before, .botones button:hover::before {
          opacity: 1;
        }

        .botones a:hover, .botones button:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .botones a:active, .botones button:active {
          transform: translateY(0px) scale(0.97);
        }
        
        .btn-wa { background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; }
        .btn-llamar { background: linear-gradient(135deg, #1a4b6d, #0d2b3f); color: #fff; }
        .btn-compartir { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #0b1a2e; }

        /* ===== QR ===== */
        .qr {
          text-align: center;
          margin: 4px 0 12px;
          position: relative;
          z-index: 2;
        }
        .qr img {
          width: 100px;
          height: 100px;
          border-radius: 20px;
          background: #fff;
          padding: 8px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
          max-width: 100%;
          transition: transform 0.3s ease;
        }
        .qr img:hover {
          transform: scale(1.05);
        }
        .qr p {
          color: #a0c4e8;
          font-size: 12px;
          margin-top: 6px;
          font-weight: 500;
        }

        /* ===== CONTROLES ===== */
        .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 6px;
          position: relative;
          z-index: 2;
        }
        .controls button {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          border: none;
          padding: 8px 24px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 13px;
          color: #0b1a2e;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 16px rgba(251,191,36,0.3);
          touch-action: manipulation;
        }
        .controls button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 24px rgba(251,191,36,0.4);
        }
        .controls button:active {
          transform: translateY(0px) scale(0.97);
        }
        .controls .info-text {
          color: #a0c4e8;
          font-size: 13px;
          display: flex;
          align-items: center;
          padding: 0 6px;
          font-weight: 500;
        }

        /* ===== RESPONSIVE PERFECTO ===== */
        @media (max-width: 480px) {
          .container { padding: 20px 16px 18px; border-radius: 36px; }
          
          .foto-portada, .foto-portada-placeholder { 
            width: 100px; 
            height: 100px; 
          }
          .foto-portada-placeholder { font-size: 40px; }
          
          .carousel-3d { 
            width: min(230px, 72vw); 
            height: min(230px, 72vw); 
          }
          
          .info h2 { font-size: 20px; }
          .info p { font-size: 14px; }
          
          .botones a, .botones button { 
            font-size: 12px; 
            padding: 11px 14px; 
            min-width: 70px;
          }
          
          .qr img { width: 85px; height: 85px; }
          .controls button { font-size: 12px; padding: 6px 18px; }
          .controls .info-text { font-size: 12px; }
        }

        @media (max-width: 380px) {
          .container { padding: 16px 12px 14px; border-radius: 28px; }
          
          .foto-portada, .foto-portada-placeholder { 
            width: 80px; 
            height: 80px; 
          }
          .foto-portada-placeholder { font-size: 32px; }
          
          .carousel-3d { 
            width: min(180px, 68vw); 
            height: min(180px, 68vw); 
          }
          
          .info h2 { font-size: 17px; }
          .info p { font-size: 12px; }
          
          .botones a, .botones button { 
            font-size: 11px; 
            padding: 8px 12px; 
            min-width: 60px;
          }
          
          .qr img { width: 70px; height: 70px; }
          .controls button { font-size: 11px; padding: 5px 14px; }
        }

        @media (min-width: 768px) {
          .container { padding: 40px 32px 32px; }
          .carousel-3d { width: 340px; height: 340px; }
          .foto-portada, .foto-portada-placeholder { width: 140px; height: 140px; }
          .info h2 { font-size: 28px; }
        }

        @media (min-width: 1024px) {
          .carousel-3d { width: 380px; height: 380px; }
          .foto-portada, .foto-portada-placeholder { width: 150px; height: 150px; }
        }

        /* ===== ACCESIBILIDAD ===== */
        @media (prefers-reduced-motion: reduce) {
          .carousel-3d {
            animation-duration: 40s !important;
          }
        }

        /* ===== SCROLLBAR PERSONALIZADA ===== */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #fbbf24;
          border-radius: 20px;
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
