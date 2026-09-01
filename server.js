const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

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
const conversaciones = {};

// ======================================================
// BASE DE CONOCIMIENTO TDI (TARJETA DIGITAL INTELIGENTE)
// ======================================================
const conocimiento = {
  // === INTRODUCCIÓN ===
  'que es tdi': 'El TDI (Tarjeta Digital Inteligente) es un ecosistema digital que permite a cualquier negocio, emprendimiento o profesional tener presencia en línea con una tarjeta digital inteligente, visibilidad en la Guía Digital de Cúcuta y la posibilidad de generar ingresos a través de un sistema de referidos.',
  'que es tarjeta digital inteligente': 'El TDI (Tarjeta Digital Inteligente) es un ecosistema digital que permite a cualquier negocio, emprendimiento o profesional tener presencia en línea con una tarjeta digital inteligente, visibilidad en la Guía Digital de Cúcuta y la posibilidad de generar ingresos a través de un sistema de referidos.',
  
  // === PRODUCTOS Y SERVICIOS ===
  'plan basico': 'Plan Básico TDI: Tarjeta digital + QR + botones de acción + visibilidad en la Guía Digital. $25.000 al año.',
  'plan intermedio': 'Plan Intermedio TDI: Todo lo anterior + enlace de referido + comisiones. $50.000 al año.',
  'plan avanzado': 'Plan Avanzado TDI: Todo lo anterior + NFT + visibilidad destacada. $100.000 al año.',
  'plan premium': 'Plan Premium TDI: Todo lo anterior + agente de IA (PULPO) para atención al cliente. $200.000 al año.',
  'precios': 'Los precios TDI son: Plan Básico $25.000/año, Plan Intermedio $50.000/año, Plan Avanzado $100.000/año, Plan Premium $200.000/año. La tarjeta digital es GRATIS, pagas por la visibilidad en la Guía Digital.',
  'costo': 'La tarjeta digital TDI es completamente GRATIS. El costo es por la visibilidad en la Guía Digital de Cúcuta, desde $25.000 al año.',
  'cuanto cuesta': 'La tarjeta digital TDI es GRATIS. La visibilidad en la Guía Digital de Cúcuta cuesta desde $25.000 al año. ¿Te gustaría conocer los beneficios de cada plan?',
  
  // === PREGUNTAS FRECUENTES ===
  'que es la tarjeta digital': 'Es una tarjeta digital inteligente con QR, botones de acción (WhatsApp, llamar, compartir) y un carrusel de fotos 3D. Todo eso incluido en el TDI.',
  'que obtengo con mi suscripcion': 'Con tu suscripción TDI obtienes: tu sitio web en la Guía Digital, tarjeta digital, QR, botones de acción y visibilidad durante todo el año. En los planes superiores también incluye referidos, comisiones, NFT y agente IA.',
  'puedo generar ingresos': '¡Sí! A través del sistema de referidos TDI. Cada persona que se registre con tu enlace te genera una comisión. Es una forma de ingresos pasivos mientras promocionas el TDI.',
  'necesito experiencia tecnica': 'No. El sistema TDI es automático. Solo registras tus datos y el sistema genera tu tarjeta digital. Es tan fácil como llenar un formulario.',
  'como pago': 'Aceptamos Pago Móvil, transferencia bancaria y próximamente pasarelas de pago. Todos los métodos son seguros y rápidos.',
  'puedo probarlo antes de pagar': '¡Claro! Puedes generar tu tarjeta TDI gratis y ver cómo funciona. Solo pagas si quieres aparecer en la Guía Digital de Cúcuta. Es una oportunidad sin riesgo.',
  
  // === PROSPECCIÓN ===
  'por que deberia pagar': 'Porque tu negocio merece ser encontrado. La tarjeta TDI es gratis, pagas por la visibilidad en la Guía Digital, donde todos los negocios de Cúcuta ya están. Es la forma más inteligente de tener presencia digital.',
  'diferencia con otras tarjetas': 'El TDI es inteligente: tiene QR, botones de acción, carrusel de fotos 3D y un sistema de referidos que te genera ingresos. Además, te da visibilidad en la Guía Digital de Cúcuta, el directorio digital más importante de la región.',
  'por que tdi': 'Porque el TDI combina: tarjeta digital gratis, visibilidad en la Guía Digital, ingresos pasivos por referidos y un agente IA (PULPO) que atiende a tus clientes. Todo en un solo ecosistema.',
  
  // === VALORES CLAVE ===
  'accesibilidad': 'El TDI es accesible: precios desde $25.000 al año. Cualquier negocio, emprendimiento o profesional puede tener presencia digital de calidad.',
  'automatizacion': 'El TDI automatiza todo: generación de tarjeta, código QR, botones de acción, carrusel de fotos. El sistema hace el trabajo por ti, sin necesidad de experiencia técnica.',
  'visibilidad': 'El TDI te da visibilidad en el directorio digital más importante de Cúcuta. Tu negocio aparece donde los clientes te buscan.',
  'ingresos pasivos': 'Con el TDI ganas por cada persona que se registra con tu enlace de referido. Es un ingreso pasivo mientras ayudas a otros negocios a tener presencia digital.',
  
  // === LLAMADO A LA ACCIÓN ===
  'registrate': 'Regístrate ahora en el TDI y haz que tu negocio sea encontrado. La tarjeta es gratis. La visibilidad, invaluable. ¡El Pulpo está listo para ayudarte!',
  'como empiezo': 'Para empezar con el TDI, solo llena el formulario de registro con tu nombre, teléfono y email. El sistema genera tu tarjeta digital automáticamente. Luego puedes elegir el plan de visibilidad que mejor se adapte a tu negocio.',
  
  // === PRESENTACIÓN DEL AGENTE ===
  'quien eres': '¡Soy PULPO! 🐙 Tu agente digital del TDI (Tarjeta Digital Inteligente). Estoy aquí para ayudarte a tener presencia digital, generar ingresos pasivos y atender a tus clientes. ¿En qué puedo servirte?',
  'que es pulpo': 'PULPO es tu agente de IA para atención al cliente. Incluido en el Plan Premium del TDI. Estoy aquí 24/7 para atender a tus prospectos y clientes, como un asistente digital con 8 brazos para servirte.',
  
  // === SALUDOS Y DESPEDIDAS ===
  'hola': '¡Hola! Soy PULPO 🐙, tu agente digital del TDI (Tarjeta Digital Inteligente). ¿Cómo puedo ayudarte a hacer crecer tu negocio hoy?',
  'buenos dias': '¡Buenos días! PULPO 🐙 reportándose. ¿Listo para darle visibilidad a tu negocio con el TDI?',
  'buenas tardes': '¡Buenas tardes! PULPO 🐙 a tu servicio. ¿Qué necesitas saber sobre el TDI?',
  'buenas noches': '¡Buenas noches! PULPO 🐙 sigue trabajando para ti. ¿En qué puedo ayudarte con el TDI?',
  'gracias': '¡De nada! PULPO 🐙 está para servirte. Si necesitas más información sobre el TDI, aquí estoy. ¡Éxito con tu negocio!',
  'adios': '¡Hasta luego! PULPO 🐙 se despide. Recuerda: el TDI te da presencia digital, visibilidad e ingresos pasivos. ¡Nos vemos pronto!',
  'chao': '¡Chao! PULPO 🐙 siempre disponible para ti. Si necesitas ayuda con tu tarjeta TDI, aquí estoy. ¡Que tengas un excelente día!',
  
  // === DIVERSION ===
  'bingo': '¡BINGO! 🎵 B-I-N-G-O... B-I-N-G-O... ¡Y Bingo fue su nombre! Ahora en serio, ¿en qué puedo ayudarte con el TDI? 🐙',
  'chiste': '¿Por qué PULPO 🐙 no usa paracaídas? Porque siempre tiene un plan de respaldo... ¡y 8 brazos para agarrarse! 😄 ¿Necesitas ayuda con tu tarjeta TDI?',
  'canta': '🎵 T-D-I, T-D-I, tarjeta digital con mucho style... PULPO 🐙 canta para ti, mientras tu negocio brilla sin fin. 🎤 ¿Qué más necesitas saber?',
};

// ======================================================
// RUTA: CHAT CON PULPO (AGENTE TDI)
// ======================================================
app.post('/chat', async (req, res) => {
  const { mensaje, usuario = 'anonimo' } = req.body;
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // 1. Buscar en conocimiento local
    const mensajeLower = mensaje.toLowerCase();
    let respuesta = null;
    
    for (const [key, value] of Object.entries(conocimiento)) {
      if (mensajeLower.includes(key)) {
        respuesta = value;
        break;
      }
    }

    // 2. Si no está en conocimiento, usar IA (KeylessAI)
    if (!respuesta) {
      const fetch = await import('node-fetch');
      
      try {
        const response = await fetch.default('https://keylessai.thryx.workers.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: `Eres PULPO 🐙, agente digital del TDI (Tarjeta Digital Inteligente). 
                Tu misión es ayudar a negocios, emprendimientos y profesionales a tener presencia digital.
                Responde en español, amable, profesional y persuasivo.
                Usa emojis como 🐙, 💳, 📱, 🚀.
                
                INFORMACIÓN CLAVE DEL TDI:
                - Tarjeta digital GRATIS
                - Visibilidad en la Guía Digital de Cúcuta desde $25.000/año
                - Plan Básico: $25.000, Intermedio: $50.000, Avanzado: $100.000, Premium: $200.000
                - Sistema de referidos que genera ingresos pasivos
                - No se necesita experiencia técnica
                - Aceptamos Pago Móvil y transferencia bancaria
                
                Contexto de conversación: ${JSON.stringify(conversaciones[usuario] || [])}`
              },
              { role: 'user', content: mensaje }
            ],
            temperature: 0.7,
            max_tokens: 200
          })
        });

        const data = await response.json();
        respuesta = data.choices?.[0]?.message?.content || 
                   'Lo siento, PULPO 🐙 está teniendo un momento de reflexión. ¿Puedes intentar de nuevo?';
        
      } catch (error) {
        console.error('Error en IA:', error);
        respuesta = 'PULPO 🐙 está descansando sus 8 brazos. Mientras tanto, ¿puedo ayudarte con información sobre el TDI? Tengo todo sobre tarjetas digitales, precios y visibilidad.';
      }
    }

    // 3. Guardar conversación
    if (!conversaciones[usuario]) conversaciones[usuario] = [];
    conversaciones[usuario].push({ usuario: mensaje, bot: respuesta });
    if (conversaciones[usuario].length > 10) {
      conversaciones[usuario] = conversaciones[usuario].slice(-10);
    }

    res.json({ respuesta });

  } catch (error) {
    console.error('Error en chat:', error);
    res.json({ 
      respuesta: 'PULPO 🐙 está reorganizando sus tentáculos. ¿Puedes intentar de nuevo?' 
    });
  }
});

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
    mensaje: '✅ Tarjeta TDI generada con éxito',
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

  const fotosCarrusel = [];
  if (tarjeta.fotosCarrusel && tarjeta.fotosCarrusel.length > 0) {
    tarjeta.fotosCarrusel.forEach(f => fotosCarrusel.push(`/uploads/${f}`));
  }

  const fotoPortadaURL = tarjeta.fotoPortada ? `/uploads/${tarjeta.fotoPortada}` : null;

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
          box-shadow: 0 0 50px rgba(251,191,36,0.15), inset 0 0 50px rgba(251,191,36,0.05);
          border: 2px solid rgba(251,191,36,0.3);
          backface-visibility: hidden;
          background: #0b2b40;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

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

        @media (max-width: 480px) {
          .container { padding: 20px 16px 18px; border-radius: 36px; }
          .foto-portada, .foto-portada-placeholder { width: 100px; height: 100px; }
          .foto-portada-placeholder { font-size: 40px; }
          .carousel-3d { width: min(230px, 72vw); height: min(230px, 72vw); }
          .info h2 { font-size: 20px; }
          .info p { font-size: 14px; }
          .botones a, .botones button { font-size: 12px; padding: 11px 14px; min-width: 70px; }
          .qr img { width: 85px; height: 85px; }
          .controls button { font-size: 12px; padding: 6px 18px; }
          .controls .info-text { font-size: 12px; }
        }

        @media (max-width: 380px) {
          .container { padding: 16px 12px 14px; border-radius: 28px; }
          .foto-portada, .foto-portada-placeholder { width: 80px; height: 80px; }
          .foto-portada-placeholder { font-size: 32px; }
          .carousel-3d { width: min(180px, 68vw); height: min(180px, 68vw); }
          .info h2 { font-size: 17px; }
          .info p { font-size: 12px; }
          .botones a, .botones button { font-size: 11px; padding: 8px 12px; min-width: 60px; }
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

        @media (prefers-reduced-motion: reduce) {
          .carousel-3d {
            animation-duration: 40s !important;
          }
        }

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

        <div class="foto-portada-wrapper">
          ${fotoPortadaURL ? `
            <div class="foto-portada">
              <img src="${fotoPortadaURL}" alt="Logo de ${tarjeta.nombre}">
            </div>
          ` : `
            <div class="foto-portada-placeholder">🖼️</div>
          `}
        </div>

        <div class="carousel-wrapper">
          <div class="carousel-3d" id="carousel3d">
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
          <p>📲 Escanea para ver la tarjeta</p>
        </div>

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
            navigator.share({ title: 'Tarjeta TDI', url: url });
          } else {
            navigator.clipboard.writeText(url).then(() => alert('📋 Enlace copiado. ¡Comparte tu tarjeta TDI!'));
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
  console.log(`✅ Servidor TDI con PULPO 🐙 en puerto ${PORT}`);
});
