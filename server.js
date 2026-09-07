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

// =============================================
// RUTAS DE PRUEBA
// =============================================
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'TDI - Tarjeta Digital Inteligente',
    version: '2.1.0'
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
  if (!mensaje) return res.status(400).json({ error: 'Mensaje requerido' });

  let respuesta = '';
  const msg = mensaje.toLowerCase();

  if (msg.includes('hola') || msg.includes('buenas')) {
    respuesta = '🐙 ¡Hola! Soy PULPO. ¿Cómo puedo ayudarte?';
  } else if (msg.includes('plan') || msg.includes('precio')) {
    respuesta = '💰 Planes: Básico $25k, Intermedio $50k, Avanzado $100k, Premium $200k';
  } else {
    respuesta = '🐙 Pregúntame sobre tarjetas, planes o la guía de Cúcuta.';
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
  const enlace = `https://agente-1-w4vk.onrender.com/tarjeta/${id}`;

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
  res.json({ mensaje: '✅ Tarjeta generada', enlace });
});

// =============================================
// VER TARJETA POR ID
// =============================================
app.get('/tarjeta/:id', (req, res) => {
  const tarjeta = tarjetas[req.params.id];
  if (!tarjeta) return res.status(404).send('Tarjeta no encontrada');

  const fotos = [];
  if (tarjeta.fotoPortada) fotos.push(`/uploads/${tarjeta.fotoPortada}`);
  if (tarjeta.fotosCarrusel) {
    tarjeta.fotosCarrusel.forEach(f => fotos.push(`/uploads/${f}`));
  }

  let slidesHTML = '';
  let indicadoresHTML = '';

  if (fotos.length === 0) {
    slidesHTML = '<div class="slide"><div class="placeholder">📸 Sube tus fotos</div></div>';
    indicadoresHTML = '<span class="indicator active"></span>';
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .container {
          max-width: 520px;
          width: 100%;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .carousel-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          background: #0b2b40;
        }
        .carousel-slides {
          display: flex;
          transition: transform 0.6s;
          height: 350px;
        }
        .slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b2b40;
        }
        .slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .slide .placeholder {
          font-size: 48px;
          color: #fbbf24;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
        }
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
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
        }
        .indicator.active {
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
        .info h2 { font-size: 24px; color: #fbbf24; }
        .info p { font-size: 16px; color: #a0c4e8; margin: 4px 0; }
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 16px 0;
        }
        .botones a, .botones button {
          padding: 12px 20px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }
        .qr { text-align: center; margin: 12px 0; }
        .qr img {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          background: #fff;
          padding: 8px;
        }
        .qr p { color: #a0c4e8; font-size: 13px; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="carousel-container">
          <div class="carousel-slides" id="carouselSlides">${slidesHTML}</div>
          <button class="carousel-btn prev" id="prevBtn">&#10094;</button>
          <button class="carousel-btn next" id="nextBtn">&#10095;</button>
          <div class="carousel-indicators" id="indicatorsContainer">${indicadoresHTML}</div>
        </div>
        <div class="info">
          <h2>🧾 ${tarjeta.nombre}</h2>
          <p>📱 ${tarjeta.telefono}</p>
          <p>📧 ${tarjeta.email || 'No especificado'}</p>
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
          indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentIndex);
          });
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
        indicators.forEach(ind => {
          ind.addEventListener('click', () => {
            goToSlide(parseInt(ind.dataset.index));
            resetAutoPlay();
          });
        });

        function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
        function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

        const carouselContainer = document.getElementById('carousel-container') || document.querySelector('.carousel-container');
        if (carouselContainer) {
          carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
          carouselContainer.addEventListener('mouseleave', startAutoPlay);
        }
        if (totalSlides > 1) startAutoPlay();

        function compartir() {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'Tarjeta TDI', url: url });
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
// RUTA JULIO VARGAS (COMPLETA)
// =============================================
app.get('/julio-vargas', (req, res) => {
  const tarjeta = {
    nombre: 'Julio Vargas',
    telefono: '04166520591',
    email: 'juliovargas1478@gmail.com',
    enlace: 'https://guia-digital.com/julio-vargas'
  };

  const fotos = [
    'https://raw.githubusercontent.com/elispastor/AGENTE/main/images/portada-julio.jpg',
    'https://raw.githubusercontent.com/elispastor/AGENTE/main/images/A1.jpg',
    'https://raw.githubusercontent.com/elispastor/AGENTE/main/images/A2.jpg'
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
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
          font-family: 'Segoe UI', Roboto, sans-serif;
        }
        .container {
          max-width: 520px;
          width: 100%;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          border-radius: 32px;
          padding: 24px 20px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .carousel-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          border-radius: 16px;
          background: #0b2b40;
        }
        .carousel-slides {
          display: flex;
          transition: transform 0.6s;
          height: 350px;
        }
        .slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0b2b40;
        }
        .slide img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
          z-index: 10;
        }
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
        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          cursor: pointer;
        }
        .indicator.active {
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
        .info h2 { font-size: 24px; color: #fbbf24; }
        .info p { font-size: 16px; color: #a0c4e8; margin: 4px 0; }
        .botones {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin: 16px 0;
        }
        .botones a, .botones button {
          padding: 12px 20px;
          border-radius: 60px;
          font-weight: 700;
          font-size: 14px;
          border: none;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }
        .qr { text-align: center; margin: 12px 0; }
        .qr img {
          width: 100px;
          height: 100px;
          border-radius: 16px;
          background: #fff;
          padding: 8px;
        }
        .qr p { color: #a0c4e8; font-size: 13px; margin-top: 4px; }
        .formulario-section {
          background: rgba(255,255,255,0.05);
          border-radius: 24px;
          padding: 24px 20px;
          margin-top: 24px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .formulario-section h3 {
          color: #fbbf24;
          font-size: 20px;
          text-align: center;
          margin-bottom: 16px;
        }
        .campo {
          margin-bottom: 12px;
        }
        .campo label {
          color: #a0c4e8;
          font-size: 14px;
          display: block;
          margin-bottom: 4px;
        }
        .campo input, .campo select {
          width: 100%;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-size: 15px;
          outline: none;
        }
        .btn-enviar-wa {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 40px;
          background: linear-gradient(135deg, #25D366, #128C7E);
          color: #fff;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="carousel-container">
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
        <div class="formulario-section">
          <h3>📇 Obtén tu Tarjeta TDI</h3>
          <form id="formAfiliado" onsubmit="enviarWhatsApp(event)">
            <div class="campo">
              <label>Nombre completo</label>
              <input type="text" id="nombre" placeholder="Ej: Julio Vargas" required>
            </div>
            <div class="campo">
              <label>Teléfono WhatsApp</label>
              <input type="tel" id="telefono" placeholder="Ej: 573001234567" required>
            </div>
            <div class="campo">
              <label>Correo electrónico</label>
              <input type="email" id="email" placeholder="Ej: contacto@negocio.com">
            </div>
            <div class="campo">
              <label>Nombre de tu negocio</label>
              <input type="text" id="negocio" placeholder="Ej: Taller El Tigre">
            </div>
            <div class="campo">
              <label>Plan de interés</label>
              <select id="plan">
                <option value="Básico ($25.000/año)">Básico ($25.000/año)</option>
                <option value="Intermedio ($50.000/año)" selected>Intermedio ($50.000/año)</option>
                <option value="Avanzado ($100.000/año)">Avanzado ($100.000/año)</option>
                <option value="Premium ($200.000/año)">Premium ($200.000/año)</option>
              </select>
            </div>
            <button type="submit" class="btn-enviar-wa">💬 Enviar datos por WhatsApp</button>
          </form>
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
          indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentIndex);
          });
        }

        function nextSlide() { goToSlide(currentIndex + 1); }
        function prevSlide() { goToSlide(currentIndex - 1); }

        if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
        indicators.forEach(ind => {
          ind.addEventListener('click', () => {
            goToSlide(parseInt(ind.dataset.index));
            resetAutoPlay();
          });
        });

        function startAutoPlay() { autoPlayInterval = setInterval(nextSlide, 5000); }
        function resetAutoPlay() { clearInterval(autoPlayInterval); startAutoPlay(); }

        const carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
          carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
          carouselContainer.addEventListener('mouseleave', startAutoPlay);
        }
        if (totalSlides > 1) startAutoPlay();

        function compartir() {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'Julio Vargas - Tarjeta TDI', url: url });
          } else {
            navigator.clipboard.writeText(url).then(() => alert('📋 Enlace copiado'));
          }
        }

        function enviarWhatsApp(event) {
          event.preventDefault();
          const nombre = document.getElementById('nombre').value.trim();
          const telefono = document.getElementById('telefono').value.trim();
          const email = document.getElementById('email').value.trim();
          const negocio = document.getElementById('negocio').value.trim();
          const plan = document.getElementById('plan').value;

          if (!nombre || !telefono) {
            alert('Por favor, completa al menos el nombre y el teléfono.');
            return;
          }

          const mensaje = \`📇 *NUEVO AFILIADO TDI*

👤 *Nombre:* \${nombre}
📱 *Teléfono:* \${telefono}
📧 *Email:* \${email || 'No especificado'}
🏢 *Negocio:* \${negocio || 'No especificado'}
📋 *Plan:* \${plan}
🔗 *Viene desde:* \${window.location.href}\`;

          const mensajeCodificado = encodeURIComponent(mensaje);
          const numeroJulio = '573244913371';

          window.open(\`https://wa.me/\${numeroJulio}?text=\${mensajeCodificado}\`, '_blank');
        }
      </script>
    </body>
    </html>
  `);
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`✅ Servidor TDI con PULPO 🐙 en puerto \${PORT}\`);
});
