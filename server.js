const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 1880;

// =============================================
// CONFIGURACIÓN DE GEMINI (si tienes la API key)
// =============================================
// Descomenta estas líneas cuando tengas la API key de Gemini
// const { GoogleGenerativeAI } = require('@google/generative-ai');
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'TU_API_KEY_AQUI';
// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

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

const tarjetas = {};

// =============================================
// RUTA: CHAT CON PULPO (RESPUESTA SIMULADA POR AHORA)
// =============================================
app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // Respuesta base de PULPO (sin Gemini por ahora)
    let respuesta = '';
    const msg = mensaje.toLowerCase();

    if (msg.includes('hola') || msg.includes('buenas')) {
      respuesta = '🐙 ¡Hola! Soy PULPO, tu agente del TDI. ¿Cómo puedo ayudarte a hacer crecer tu negocio hoy?';
    } else if (msg.includes('tarjeta') || msg.includes('digital')) {
      respuesta = '📇 ¡Excelente! Nuestra tarjeta digital es la herramienta perfecta para tu negocio. Incluye QR, botones de acción y un carrusel de fotos. ¿Quieres saber más sobre los planes?';
    } else if (msg.includes('plan') || msg.includes('precio') || msg.includes('costo')) {
      respuesta = '💰 Tenemos 4 planes:\n• Básico: $25.000/año\n• Intermedio: $50.000/año\n• Avanzado: $100.000/año\n• Premium: $200.000/año (incluye agente de IA)\n¿Cuál te interesa?';
    } else if (msg.includes('guía') || msg.includes('cúcuta')) {
      respuesta = '📍 La Guía Digital de Cúcuta es el directorio donde todos los negocios de la ciudad ya están. ¡Aparece ahí y haz que te encuentren!';
    } else if (msg.includes('agente') || msg.includes('ia') || msg.includes('pulpo')) {
      respuesta = '🐙 PULPO es tu agente de IA, entrenado para atender a tus clientes 24/7. Con el plan Premium, tus clientes tendrán atención instantánea.';
    } else {
      respuesta = '🐙 Gracias por tu mensaje. Te recomiendo visitar nuestra guía digital o preguntarme sobre tarjetas, planes o la guía de Cúcuta. ¿En qué más puedo ayudarte?';
    }

    // Si tienes Gemini, descomenta esto y comenta la respuesta simulada:
    // const contexto = `Eres PULPO, el agente de IA del TDI...`;
    // const prompt = `${contexto}\n\nUsuario: ${mensaje}\n\nPULPO:`;
    // const result = await model.generateContent(prompt);
    // const response = await result.response;
    // const texto = response.text();
    // res.json({ respuesta: texto });

    res.json({ respuesta });

  } catch (error) {
    console.error('Error en el chat:', error);
    res.status(500).json({ 
      error: 'Error de conexión con el servidor',
      respuesta: '🐙 ¡Ups! PULPO está teniendo un momento de conexión. Intenta de nuevo en unos segundos.'
    });
  }
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
// RUTA: Ver tarjeta
// =============================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  const fotos = [];
  if (tarjeta.fotoPortada) fotos.push(`/uploads/${tarjeta.fotoPortada}`);
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotos.push(`/uploads/${f}`));
  }

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
        <img src="https://via.placeholder.com/300/fbbf24/0b2b40?text=Sube+tu+logo" alt="Sin logo">
      </figure>
    `;
  }

  const totalFotos = fotos.length || 1;
  const angulo = 360 / totalFotos;
  const translateZ = Math.min(300, Math.max(150, totalFotos * 50));

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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tarjeta SAI</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0a1a2e;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }
        .container {
          max-width: 420px;
          width: 100%;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          border-radius: 28px;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }
        .carousel-wrapper {
          perspective: 800px;
          width: 100%;
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .carousel {
          width: 220px;
          height: 220px;
          position: relative;
          transform-style: preserve-3d;
          animation: rotate 18s infinite linear;
        }
        .carousel figure {
          position: absolute;
          width: 85%;
          height: 85%;
          left: 7.5%;
          top: 7.5%;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(251,191,36,0.15);
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
          margin: 6px 0 12px;
          padding: 10px;
          background: rgba(0,0,0,0.3);
          border-radius: 14px;
        }
        .info h2 {
          font-size: 20px;
          font-weight: 700;
          color: #fbbf24;
        }
        .info p {
          font-size: 14px;
          color: #a0c4e8;
          margin: 2px 0;
        }
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin: 10px 0;
        }
        .botones a, .botones button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 13px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          transition: 0.2s;
          flex: 1 0 auto;
          justify-content: center;
        }
        .botones a:hover, .botones button:hover {
          transform: scale(1.03);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }
        .qr {
          text-align: center;
          margin: 6px 0 10px;
        }
        .qr img {
          width: 90px;
          height: 90px;
          border-radius: 12px;
          background: #fff;
          padding: 6px;
        }
        .qr p {
          color: #a0c4e8;
          font-size: 12px;
        }
        .controls {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 6px;
        }
        .controls button {
          background: #fbbf24;
          border: none;
          padding: 6px 16px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 13px;
          color: #0b1a2e;
          cursor: pointer;
        }
        .controls button:hover {
          background: #f59e0b;
        }
        @media (max-width: 480px) {
          .carousel { width: 180px; height: 180px; }
          .info h2 { font-size: 17px; }
          .botones a, .botones button { font-size: 12px; padding: 8px 12px; }
          .qr img { width: 75px; height: 75px; }
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
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}" alt="QR">
          <p>Escanea para ver la tarjeta</p>
        </div>
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
            navigator.clipboard.writeText(url).then(() => alert('📋 Enlace copiado'));
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
