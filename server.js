// =============================================
// RUTA: Ver tarjeta CON CARRUSEL MODERNO
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

  // Generar slides para el carrusel
  let slidesHTML = '';
  let indicadoresHTML = '';
  
  if (fotos.length === 0) {
    slidesHTML = `
      <div class="slide">
        <div class="placeholder">📸 Sube tus fotos</div>
      </div>
    `;
    indicadoresHTML = `<span class="indicator active"></span>`;
  } else {
    fotos.forEach((url, index) => {
      const isActive = index === 0 ? 'active' : '';
      slidesHTML += `
        <div class="slide ${isActive}">
          <img src="${url}" alt="Foto ${index + 1}">
        </div>
      `;
      indicadoresHTML += `<span class="indicator ${isActive}" data-index="${index}"></span>`;
    });
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=yes">
      <title>Tarjeta TDI - ${tarjeta.nombre}</title>
      <style>
        /* ===== RESET ===== */
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

        /* ===== CARRUSEL MODERNO ===== */
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

        /* ===== CONTROLES DE NAVEGACIÓN ===== */
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

        .carousel-btn:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .carousel-btn.prev {
          left: 10px;
        }

        .carousel-btn.next {
          right: 10px;
        }

        /* ===== INDICADORES ===== */
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

        /* ===== INFORMACIÓN DE LA TARJETA ===== */
        .info {
          text-align: center;
          color: white;
          margin-top: 20px;
          padding: 16px;
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

        /* ===== BOTONES DE ACCIÓN ===== */
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

        .botones a:hover, .botones button:hover {
          transform: scale(1.04);
        }

        .btn-wa { background: #25D366; color: #fff; }
        .btn-llamar { background: #1a4b6d; color: #fff; }
        .btn-compartir { background: #fbbf24; color: #0b1a2e; }

        /* ===== QR ===== */
        .qr {
          text-align: center;
          margin: 12px 0;
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

        /* ===== RESPONSIVE ===== */
        @media (max-width: 480px) {
          .container { padding: 16px; }
          .carousel-slides { height: 220px; }
          .carousel-btn { width: 32px; height: 32px; font-size: 16px; }
          .info h2 { font-size: 18px; }
          .botones a, .botones button { font-size: 13px; padding: 10px 14px; }
          .qr img { width: 80px; height: 80px; }
        }

        @media (min-width: 768px) {
          .carousel-slides { height: 420px; }
        }

        @media (min-width: 1024px) {
          .carousel-slides { height: 480px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- ===== CARRUSEL ===== -->
        <div class="carousel-container" id="carouselContainer">
          <div class="carousel-slides" id="carouselSlides">
            ${slidesHTML}
          </div>

          <!-- Controles de navegación -->
          <button class="carousel-btn prev" id="prevBtn">&#10094;</button>
          <button class="carousel-btn next" id="nextBtn">&#10095;</button>

          <!-- Indicadores -->
          <div class="carousel-indicators" id="indicatorsContainer">
            ${indicadoresHTML}
          </div>
        </div>

        <!-- ===== INFORMACIÓN ===== -->
        <div class="info">
          <h2>🧾 ${tarjeta.nombre}</h2>
          <p>📱 ${tarjeta.telefono}</p>
          <p>📧 ${tarjeta.email}</p>
        </div>

        <!-- ===== BOTONES ===== -->
        <div class="botones">
          <a href="https://wa.me/${tarjeta.telefono}" target="_blank" class="btn-wa">💬 WhatsApp</a>
          <a href="tel:${tarjeta.telefono}" class="btn-llamar">📞 Llamar</a>
          <button class="btn-compartir" onclick="compartir()">🔗 Compartir</button>
        </div>

        <!-- ===== QR ===== -->
        <div class="qr">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tarjeta.enlace)}" alt="Código QR">
          <p>📲 Escanea para ver la tarjeta</p>
        </div>

      </div>

      <script>
        // ===== CONTROL DEL CARRUSEL =====
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
          slidesContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
          
          // Actualizar indicadores
          indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === currentIndex);
          });
        }

        function nextSlide() {
          goToSlide(currentIndex + 1);
        }

        function prevSlide() {
          goToSlide(currentIndex - 1);
        }

        // Eventos de los botones
        if (nextBtn) nextBtn.addEventListener('click', () => {
          nextSlide();
          resetAutoPlay();
        });

        if (prevBtn) prevBtn.addEventListener('click', () => {
          prevSlide();
          resetAutoPlay();
        });

        // Eventos de los indicadores
        indicators.forEach((ind, i) => {
          ind.addEventListener('click', () => {
            goToSlide(i);
            resetAutoPlay();
          });
        });

        // Auto-play
        function startAutoPlay() {
          autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay() {
          clearInterval(autoPlayInterval);
          startAutoPlay();
        }

        // Pausar auto-play al pasar el mouse
        const carouselContainer = document.getElementById('carouselContainer');
        carouselContainer.addEventListener('mouseenter', () => {
          clearInterval(autoPlayInterval);
        });

        carouselContainer.addEventListener('mouseleave', () => {
          startAutoPlay();
        });

        // Iniciar auto-play
        if (totalSlides > 1) {
          startAutoPlay();
        }

        // ===== COMPARTIR =====
        function compartir() {
          const url = window.location.href;
          if (navigator.share) {
            navigator.share({ title: 'Tarjeta TDI', url: url });
          } else {
            navigator.clipboard.writeText(url).then(() => alert('📋 Enlace copiado. ¡Comparte tu tarjeta!'));
          }
        }
      </script>
    </body>
    </html>
  `);
});
