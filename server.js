const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 1880;

// Configurar almacenamiento
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

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

const tarjetas = {};

// =============================================
// RUTA: CHAT CON PULPO
// =============================================
app.post('/api/chat', (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  let respuesta = '';
  const msg = mensaje.toLowerCase();

  if (msg.includes('hola') || msg.includes('buenas')) {
    respuesta = '🐙 ¡Hola! Soy PULPO, tu agente del TDI. ¿Cómo puedo ayudarte a hacer crecer tu negocio hoy?';
  } else if (msg.includes('tarjeta') || msg.includes('digital')) {
    respuesta = '📇 ¡Excelente! Nuestra tarjeta digital incluye QR, botones de acción y un carrusel de fotos. ¿Quieres saber más sobre los planes?';
  } else if (msg.includes('plan') || msg.includes('precio') || msg.includes('costo')) {
    respuesta = '💰 Tenemos 4 planes:\n• Básico: $25.000/año\n• Intermedio: $50.000/año\n• Avanzado: $100.000/año\n• Premium: $200.000/año (incluye agente de IA)\n¿Cuál te interesa?';
  } else if (msg.includes('guía') || msg.includes('cúcuta')) {
    respuesta = '📍 La Guía Digital de Cúcuta es el directorio donde todos los negocios de la ciudad ya están. ¡Aparece ahí y haz que te encuentren!';
  } else if (msg.includes('agente') || msg.includes('pulpo')) {
    respuesta = '🐙 PULPO es tu agente de IA, entrenado para atender a tus clientes 24/7. Con el plan Premium, tus clientes tendrán atención instantánea.';
  } else {
    respuesta = '🐙 Gracias por tu mensaje. Te recomiendo visitar nuestra guía digital o preguntarme sobre tarjetas, planes o la guía de Cúcuta. ¿En qué más puedo ayudarte?';
  }

  res.json({ respuesta });
});

// =============================================
// RUTA: Generar tarjeta
// =============================================
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

// =============================================
// RUTA: Ver tarjeta CON CARRUSEL MEJORADO
// =============================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  // Preparar fotos
  const fotos = [];
  if (tarjeta.fotoPortada) fotos.push(`/uploads/${tarjeta.fotoPortada}`);
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotos.push(`/uploads/${f}`));
  }

  // Generar carrusel mejorado
  let carruselHTML = '';
  if (fotos.length > 0) {
    fotos.forEach((url, index) => {
      const esLogo = index === 0;
      carruselHTML += `
        <figure class="${esLogo ? 'logo-slide' : ''}">
          <img src="${url}" alt="${esLogo ? 'Logo' : 'Foto ' + index}">
          ${esLogo ? '<div class="logo-badge">⭐ LOGO</div>' : ''}
          <div class="slide-number">${index + 1}/${fotos.length}</div>
        </figure>
      `;
    });
  } else {
    carruselHTML = `
      <figure>
        <img src="https://via.placeholder.com/400/fbbf24/0b2b40?text=Sube+tu+logo" alt="Sin logo">
        <div class="slide-number">1/1</div>
      </figure>
    `;
  }

  const totalFotos = fotos.length || 1;
  const angulo = 360 / totalFotos;
  const translateZ = Math.min(350, Math.max(200, totalFotos * 55));

  let carasCSS = '';
  for (let i = 0; i < totalFotos; i++) {
    carasCSS += `
      .carousel figure:nth-child(${i + 1}) {
        transform: rotateY(${i * angulo}deg) translateZ(${translateZ}px);
      }
    `;
  }

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

        /* CARRUSEL PROFESIONAL */
        .carousel-wrapper {
          perspective: 1200px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          padding: 10px 0;
        }
        .carousel {
          width: 280px;
          height: 280px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate 25s infinite linear;
        }
        .carousel figure {
          position: absolute;
          width: 88%;
          height: 88%;
          left: 6%;
          top: 6%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(251, 191, 36, 0.2), 0 0 60px rgba(251, 191, 36, 0.05);
          border: 2px solid rgba(251, 191, 36, 0.3);
          backface-visibility: hidden;
          background: #0b2b40;
          transition: all 0.3s ease;
        }
        .carousel figure:hover {
          border-color: #fbbf24;
          box-shadow: 0 15px 50px rgba(251, 191, 36, 0.3);
        }
        .carousel figure img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .carousel figure:hover img {
          transform: scale(1.05);
        }
        .carousel figure .logo-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0a1a2e;
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
        }
        .carousel figure .slide-number {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.6);
          color: #94a3b8;
          padding: 3px 12px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        ${carasCSS}
        @keyframes rotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .carousel-wrapper:hover .carousel {
          animation-play-state: paused;
        }

        /* INFORMACIÓN */
        .info {
          text-align: center;
          color: white;
          margin: 8px 0 16px;
          padding: 14px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 {
          font-size: 22px;
          font-weight: 700;
          color: #fbbf24;
        }
        .info p {
          font-size: 15px;
          color: #a0c4e8;
          margin: 4px 0;
        }

        /* BOTONES */
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 14px 0;
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

        /* QR */
        .qr {
          text-align: center;
          margin: 8px 0 12px;
        }
        .qr img {
          width: 100px;
          height: 100px;
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

        /* CONTROLES */
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

        /* RESPONSIVE */
        @media (max-width: 480px) {
          .carousel { width: 200px; height: 200px; }
          .info h2 { font-size: 18px; }
          .botones a, .botones button { font-size: 13px; padding: 10px 14px; }
          .qr img { width: 80px; height: 80px; }
          .carousel figure .logo-badge { font-size: 9px; padding: 2px 10px; }
          .carousel figure .slide-number { font-size: 9px; padding: 2px 10px; }
        }
        @media (min-width: 768px) {
          .carousel { width: 340px; height: 340px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- CARRUSEL -->
        <div class="carousel-wrapper">
          <div class="carousel" id="carousel">
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
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}" alt="QR">
          <p>Escanea para ver la tarjeta</p>
        </div>

        <!-- CONTROLES -->
        <div class="controls">
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

// =============================================
// Página principal
// =============================================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`✅ Servidor SAI corriendo en puerto ${PORT}`);
});
