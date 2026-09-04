const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =============================================
// PERSISTENCIA DE DATOS CON ARCHIVO JSON
// =============================================
const TARJETAS_FILE = './tarjetas.json';

function cargarTarjetas() {
  try {
    if (fs.existsSync(TARJETAS_FILE)) {
      const data = fs.readFileSync(TARJETAS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error cargando tarjetas:', error);
  }
  return {};
}

function guardarTarjetas(tarjetas) {
  try {
    fs.writeFileSync(TARJETAS_FILE, JSON.stringify(tarjetas, null, 2));
    console.log('✅ Tarjetas guardadas en archivo');
  } catch (error) {
    console.error('Error guardando tarjetas:', error);
  }
}

const tarjetas = cargarTarjetas();
console.log(`📇 ${Object.keys(tarjetas).length} tarjetas cargadas`);

const app = express();
const PORT = process.env.PORT || 1880;

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

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

const conversaciones = {};

// =============================================
// RUTAS DE PRUEBA
// =============================================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'TDI - Tarjeta Digital Inteligente',
    version: '2.1.0',
    endpoints: {
      chat: '/chat',
      generarTarjeta: '/api/generar-tarjeta'
    }
  });
});

app.get('/test', (req, res) => {
  res.send('✅ Servidor TDI funcionando correctamente');
});

// =============================================
// CHAT CON PULPO
// =============================================
app.post('/chat', (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  let respuesta = '';
  const msg = mensaje.toLowerCase();

  if (msg.includes('hola') || msg.includes('buenas')) {
    respuesta = '🐙 ¡Hola! Soy PULPO, tu agente del TDI. ¿Cómo puedo ayudarte a hacer crecer tu negocio hoy?';
  } else if (msg.includes('tdi') || msg.includes('que significa tdi') || msg.includes('qué es tdi')) {
    respuesta = '🧠 TDI significa **Tarjeta Digital Inteligente**. Es un ecosistema digital que permite a cualquier negocio tener presencia en línea con una tarjeta digital, visibilidad en la Guía Digital de Cúcuta y la posibilidad de generar ingresos pasivos a través de referidos. ¿Quieres saber más sobre los planes?';
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
// GENERAR TARJETA
// =============================================
app.post('/api/generar-tarjeta', upload.any(), (req, res) => {
  const { nombre, telefono, email } = req.body;
  const fotoPortada = req.files.find(f => f.fieldname === 'fotoPortada');
  const fotosCarrusel = req.files.filter(f => f.fieldname === 'fotosCarrusel');

  const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  const enlace = `https://guia-digital.com/tarjeta/${id}`;

  tarjetas[id] = {
    nombre,
    telefono,
    email: email || '',
    fotoPortada: fotoPortada ? fotoPortada.filename : null,
    fotosCarrusel: fotosCarrusel.map(f => f.filename),
    enlace,
    fecha: new Date().toISOString()
  };

  guardarTarjetas(tarjetas);

  res.json({
    mensaje: '✅ Tarjeta generada',
    enlace,
    tarjeta: { nombre, telefono, email }
  });
});

// =============================================
// RUTA ESPECIAL PARA JULIO VARGAS
// =============================================
app.get('/julio-vargas', (req, res) => {
  const tarjeta = {
    nombre: 'Julio Vargas',
    telefono: '04166520591',
    email: 'juliovargas1478@gmail.com',
    enlace: 'https://guia-digital.com/julio-vargas'
  };

  const fotos = [
    '/uploads/julio-portada.jpg',
    '/uploads/julio-foto1.jpg',
    '/uploads/julio-foto2.jpg',
    '/uploads/julio-foto3.jpg',
    '/uploads/julio-foto4.jpg'
  ];

  let slidesHTML = '';
  let indicadoresHTML = '';

  fotos.forEach((url, index) => {
    const isActive = index === 0 ? 'active' : '';
    slidesHTML += `<div class="slide ${isActive}"><img src="${url}" alt="Foto ${index + 1}"></div>`;
    indicadoresHTML += `<span class="indicator ${isActive}" data-index="${index}"></span>`;
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
      <title>Julio Vargas - Tarjeta TDI</title>
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
          border-radius: 32px;
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
        }
        .carousel-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 16px;
          background: #0b2b40;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .carousel-slides {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 350px;
        }
        .carousel-slides .slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b2b40;
          position: relative;
        }
        .carousel-slides .slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0b2b40;
        }
        .carousel-slides .slide .placeholder {
          font-size: 48px;
          color: #fbbf24;
          text-align: center;
          padding: 20px;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        .carousel-btn:hover { background: rgba(0, 0, 0, 0.8); }
        .carousel-btn.prev { left: 10px; }
        .carousel-btn.next { right: 10px; }
        .carousel-indicators {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .carousel-indicators .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .carousel-indicators .indicator.active {
          background: #fbbf24;
          transform: scale(1.2);
        }
        .info {
          text-align: center;
          color: white;
          margin-top: 20px;
          padding: 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 { font-size: 24px; font-weight: 700; color: #fbbf24; }
        .info p { font-size: 16px; color: #a0c4e8; margin: 4px 0; }
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 16px 0;
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
        .botones a:hover, .botones button:hover { transform: scale(1.04); }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }
        .qr { text-align: center; margin: 12px 0; }
        .qr img { width: 100px; height: 100px; border-radius: 16px; background: #fff; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .qr p { color: #a0c4e8; font-size: 13px; margin-top: 4px; }
        .menu-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          z-index: 100;
          backdrop-filter: blur(4px);
          transition: 0.3s;
        }
        .menu-toggle:hover { background: #fbbf24; color: #0b1a2e; }
        .menu-panel {
          position: fixed;
          top: 0;
          right: -300px;
          width: 280px;
          height: 100%;
          background: rgba(10, 26, 46, 0.95);
          backdrop-filter: blur(12px);
          padding: 80px 20px 20px;
          transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 99;
          box-shadow: -4px 0 30px rgba(0,0,0,0.5);
          border-left: 1px solid rgba(255,255,255,0.05);
        }
        .menu-panel.open { right: 0; }
        .menu-panel a {
          display: block;
          color: #a0c4e8;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
          padding: 14px 20px;
          border-radius: 12px;
          transition: 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .menu-panel a:hover {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          padding-left: 28px;
        }
        .menu-panel .menu-title {
          color: #fbbf24;
          font-size: 20px;
          font-weight: 700;
          padding: 14px 20px 30px;
          text-align: center;
          border-bottom: 2px solid rgba(251, 191, 36, 0.2);
          margin-bottom: 10px;
        }
        @media (max-width: 480px) {
          .container { padding: 16px; }
          .carousel-slides { height: 220px; }
          .carousel-btn { width: 32px; height: 32px; font-size: 16px; }
          .info h2 { font-size: 20px; }
          .botones a, .botones button { font-size: 13px; padding: 10px 14px; }
          .qr img { width: 80px; height: 80px; }
          .menu-panel { width: 240px; }
        }
        @media (min-width: 768px) { .carousel-slides { height: 420px; } }
        @media (min-width: 1024px) { .carousel-slides { height: 480px; } }
      </style>
    </head>
    <body>
      <button class="menu-toggle" id="menuToggle" aria-label="Menú">☰</button>
      <div class="menu-panel" id="menuPanel">
        <div class="menu-title">📇 TDI</div>
        <a href="https://guia-digital.com">🏠 Inicio</a>
        <a href="https://guia-digital.com/tarjetas">📇 Mis Tarjetas</a>
        <a href="https://guia-digital.com/planes">📊 Planes</a>
        <a href="https://guia-digital.com/contacto">📩 Contacto</a>
        <a href="https://wa.me/04166520591" target="_blank">💬 WhatsApp</a>
        <a href="mailto:juliovargas1478@gmail.com">📧 Email</a>
        <a href="#" onclick="compartir()">🔗 Compartir</a>
      </div>
      <div class="container">
        <div class="carousel-container" id="carouselContainer">
          <div class="carousel-slides" id="carouselSlides">${slidesHTML}</div>
          <button class="carousel-btn prev" id="prevBtn">&#10094;</button>
          <button class="carousel-btn next" id="nextBtn">&#10095;</button>
          <div class="carousel-indicators" id="indicatorsContainer">${indicadoresHTML}</div>
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
          <img src="${qrUrl}" alt="Código QR">
          <p>📲 Escanea para ver la tarjeta</p>
        </div>
      </div>
      <script>
        const slidesContainer = document.getElementById('carouselSlides');
        const slides = slidesContainer.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoPlayInterval;

        function goToSlide(index) {
          if (index < 0) index = totalSlides - 1;
          if (index >= totalSlides) index = 0;
          currentIndex = index;
          slidesContainer.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
          indicators.forEach(function(ind, i) {
            if (i === currentIndex) ind.classList.add('active');
            else ind.classList.remove('active');
          });
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoPlay(); });
        indicators.forEach(function(ind, i) {
          ind.addEventListener('click', function() { goToSlide(i); resetAutoPlay(); });
        });

        function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
        function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

        const carouselContainer = document.getElementById('carouselContainer');
        if (carouselContainer) {
          carouselContainer.addEventListener('mouseenter', function() { clearInterval(autoPlayInterval); });
          carouselContainer.addEventListener('mouseleave', function() { startAutoPlay(); });
        }
        if (totalSlides > 1) startAutoPlay();

        const menuToggle = document.getElementById('menuToggle');
        const menuPanel = document.getElementById('menuPanel');
        let menuOpen = false;

        menuToggle.addEventListener('click', function() {
          menuOpen = !menuOpen;
          menuPanel.classList.toggle('open', menuOpen);
          menuToggle.textContent = menuOpen ? '✕' : '☰';
        });

        document.querySelectorAll('.menu-panel a').forEach(function(link) {
          link.addEventListener('click', function() {
            menuPanel.classList.remove('open');
            menuToggle.textContent = '☰';
            menuOpen = false;
          });
        });

        function compartir() {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'Julio Vargas - Tarjeta TDI', url: url });
          } else {
            navigator.clipboard.writeText(url).then(function() {
              alert('📋 Enlace copiado. ¡Comparte tu tarjeta!');
            });
          }
        }
      </script>
    </body>
    </html>
  `);
});

// =============================================
// RUTA PARA VER TARJETAS GUARDADAS
// =============================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  const fotos = [];
  if (tarjeta.fotoPortada) fotos.push(`/uploads/${tarjeta.fotoPortada}`);
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotos.push(`/uploads/${f}`));
  }

  let slidesHTML = '';
  let indicadoresHTML = '';

  if (fotos.length === 0) {
    slidesHTML = `<div class="slide"><div class="placeholder">📸 Sube tus fotos</div></div>`;
    indicadoresHTML = `<span class="indicator active"></span>`;
  } else {
    fotos.forEach((url, index) => {
      const isActive = index === 0 ? 'active' : '';
      slidesHTML += `<div class="slide ${isActive}"><img src="${url}" alt="Foto ${index + 1}"></div>`;
      indicadoresHTML += `<span class="indicator ${isActive}" data-index="${index}"></span>`;
    });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}`;

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
      <title>Tarjeta TDI - ${tarjeta.nombre}</title>
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
          border-radius: 32px;
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.7);
        }
        .carousel-container {
          position: relative;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          overflow: hidden;
          border-radius: 16px;
          background: #0b2b40;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .carousel-slides {
          display: flex;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 350px;
        }
        .carousel-slides .slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b2b40;
          position: relative;
        }
        .carousel-slides .slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: #0b2b40;
        }
        .carousel-slides .slide .placeholder {
          font-size: 48px;
          color: #fbbf24;
          text-align: center;
          padding: 20px;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          z-index: 10;
          backdrop-filter: blur(4px);
        }
        .carousel-btn:hover { background: rgba(0, 0, 0, 0.8); }
        .carousel-btn.prev { left: 10px; }
        .carousel-btn.next { right: 10px; }
        .carousel-indicators {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .carousel-indicators .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .carousel-indicators .indicator.active {
          background: #fbbf24;
          transform: scale(1.2);
        }
        .info {
          text-align: center;
          color: white;
          margin-top: 20px;
          padding: 16px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px;
        }
        .info h2 { font-size: 24px; font-weight: 700; color: #fbbf24; }
        .info p { font-size: 16px; color: #a0c4e8; margin: 4px 0; }
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 16px 0;
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
        .botones a:hover, .botones button:hover { transform: scale(1.04); }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }
        .qr { text-align: center; margin: 12px 0; }
        .qr img { width: 100px; height: 100px; border-radius: 16px; background: #fff; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .qr p { color: #a0c4e8; font-size: 13px; margin-top: 4px; }
        .menu-toggle {
          position: fixed;
          top: 16px;
          right: 16px;
          background: rgba(0,0,0,0.7);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          z-index: 100;
          backdrop-filter: blur(4px);
          transition: 0.3s;
        }
        .menu-toggle:hover { background: #fbbf24; color: #0b1a2e; }
        .menu-panel {
          position: fixed;
          top: 0;
          right: -300px;
          width: 280px;
          height: 100%;
          background: rgba(10, 26, 46, 0.95);
          backdrop-filter: blur(12px);
          padding: 80px 20px 20px;
          transition: right 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          z-index: 99;
          box-shadow: -4px 0 30px rgba(0,0,0,0.5);
          border-left: 1px solid rgba(255,255,255,0.05);
        }
        .menu-panel.open { right: 0; }
        .menu-panel a {
          display: block;
          color: #a0c4e8;
          text-decoration: none;
          font-size: 18px;
          font-weight: 600;
          padding: 14px 20px;
          border-radius: 12px;
          transition: 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .menu-panel a:hover {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          padding-left: 28px;
        }
        .menu-panel .menu-title {
          color: #fbbf24;
          font-size: 20px;
          font-weight: 700;
          padding: 14px 20px 30px;
          text-align: center;
          border-bottom: 2px solid rgba(251, 191, 36, 0.2);
          margin-bottom: 10px;
        }
        @media (max-width: 480px) {
          .container { padding: 16px; }
          .carousel-slides { height: 220px; }
          .carousel-btn { width: 32px; height: 32px; font-size: 16px; }
          .info h2 { font-size: 20px; }
          .botones a, .botones button { font-size: 13px; padding: 10px 14px; }
          .qr img { width: 80px; height: 80px; }
          .menu-panel { width: 240px; }
        }
        @media (min-width: 768px) { .carousel-slides { height: 420px; } }
        @media (min-width: 1024px) { .carousel-slides { height: 480px; } }
      </style>
    </head>
    <body>
      <button class="menu-toggle" id="menuToggle" aria-label="Menú">☰</button>
      <div class="menu-panel" id="menuPanel">
        <div class="menu-title">📇 TDI</div>
        <a href="https://guia-digital.com">🏠 Inicio</a>
        <a href="https://guia-digital.com/tarjetas">📇 Mis Tarjetas</a>
        <a href="https://guia-digital.com/planes">📊 Planes</a>
        <a href="https://guia-digital.com/contacto">📩 Contacto</a>
        <a href="https://wa.me/${tarjeta.telefono}" target="_blank">💬 WhatsApp</a>
        <a href="mailto:${tarjeta.email}">📧 Email</a>
        <a href="#" onclick="compartir()">🔗 Compartir</a>
      </div>
      <div class="container">
        <div class="carousel-container" id="carouselContainer">
          <div class="carousel-slides" id="carouselSlides">${slidesHTML}</div>
          <button class="carousel-btn prev" id="prevBtn">&#10094;</button>
          <button class="carousel-btn next" id="nextBtn">&#10095;</button>
          <div class="carousel-indicators" id="indicatorsContainer">${indicadoresHTML}</div>
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
          <img src="${qrUrl}" alt="Código QR">
          <p>📲 Escanea para ver la tarjeta</p>
        </div>
      </div>
      <script>
        const slidesContainer = document.getElementById('carouselSlides');
        const
