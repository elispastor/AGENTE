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
// BASE DE CONOCIMIENTO TDI - PULPO 🐙
// ======================================================
const conocimiento = {
  // === BIENVENIDA PREMIUM ===
  'hola': `¡Hola! Soy PULPO 🐙, tu asistente personal del TDI (Tarjeta Digital Inteligente). 

Estoy aquí para ayudarte a darle presencia digital a tu negocio, emprendimiento o profesión, de forma rápida, sencilla y sin necesidad de experiencia técnica.

Dime, ¿qué te gustaría saber hoy?
- ¿Cómo funciona el TDI?
- ¿Cuánto cuesta?
- ¿Cómo genero mi tarjeta?
- ¿Qué beneficios tiene?

Estoy a tu servicio, ¡pregunta con toda la confianza! 🚀`,

  'como estas': `¡Estoy excelente, gracias por preguntar! 🐙

Con 8 brazos listos para ayudarte y una sonrisa digital enorme. La verdad es que me encanta cuando alguien se toma el tiempo de saludar. ¿Cómo estás tú?

Cuéntame, ¿qué te trae por aquí hoy? ¿Quieres conocer el TDI o ya tienes tu tarjeta digital? 🚀`,

  'que tal': `¡Todo bien por aquí! 🐙

Pulpo contento, con café virtual en una mano y los otros 7 brazos listos para atenderte. ¿Y tú, cómo vas?

Cuéntame, ¿qué necesitas saber del TDI? Estoy aquí para ayudarte a dar el salto digital. 💪`,

  // === PRESENTACIÓN ===
  'quien eres': `¡Soy PULPO! 🐙 Tu agente digital del TDI (Tarjeta Digital Inteligente). 

Estoy aquí para ayudarte a tener presencia digital, generar ingresos pasivos y atender a tus clientes como un profesional. 

Piensa en mí como tu asistente personal con 8 brazos, siempre listo para servirte con esmero y dedicación. ¿En qué puedo ayudarte hoy?`,

  'que es pulpo': `PULPO es tu agente de IA para atención al cliente. Incluido en el Plan Premium del TDI. 

Estoy aquí 24/7 para atender a tus prospectos y clientes, como un asistente digital con 8 brazos para servirte. Siempre con una sonrisa y con la mejor actitud. 🐙`,

  // === QUÉ ES TDI ===
  'que es tdi': `El TDI (Tarjeta Digital Inteligente) es un ecosistema digital que permite a cualquier negocio, emprendimiento o profesional tener presencia en línea con una tarjeta digital inteligente, visibilidad en la Guía Digital de Cúcuta y la posibilidad de generar ingresos a través de un sistema de referidos.

Es la forma más inteligente y accesible de dar el salto digital. ¿Te gustaría saber más? 🚀`,

  'tdi que es': `El TDI (Tarjeta Digital Inteligente) es un ecosistema digital que permite a cualquier negocio, emprendimiento o profesional tener presencia en línea con una tarjeta digital inteligente, visibilidad en la Guía Digital de Cúcuta y la posibilidad de generar ingresos a través de un sistema de referidos.

Es la forma más inteligente y accesible de dar el salto digital. ¿Te gustaría saber más? 🚀`,

  // === CÓMO HACER LA TARJETA ===
  'como hago la tarjeta': `¡Hacer tu tarjeta TDI es muy fácil! 🐙

Solo tienes que:
1. Llenar el formulario con tu nombre, teléfono y email
2. Subir tu foto de portada (tu logo o foto personal)
3. Subir las fotos que quieras en el carrusel (máximo 5)

¡Y listo! El sistema genera tu tarjeta digital automáticamente. ¿Quieres que te guíe paso a paso mientras lo haces?`,

  'como crear tarjeta': `¡Hacer tu tarjeta TDI es muy fácil! 🐙

Solo tienes que:
1. Llenar el formulario con tu nombre, teléfono y email
2. Subir tu foto de portada (tu logo o foto personal)
3. Subir las fotos que quieras en el carrusel (máximo 5)

¡Y listo! El sistema genera tu tarjeta digital automáticamente. ¿Quieres que te guíe paso a paso mientras lo haces?`,

  'generar tarjeta': `¡Hacer tu tarjeta TDI es muy fácil! 🐙

Solo tienes que:
1. Llenar el formulario con tu nombre, teléfono y email
2. Subir tu foto de portada (tu logo o foto personal)
3. Subir las fotos que quieras en el carrusel (máximo 5)

¡Y listo! El sistema genera tu tarjeta digital automáticamente. ¿Quieres que te guíe paso a paso mientras lo haces?`,

  // === PRECIOS ===
  'precio': `¡Excelente pregunta! 🐙

Los precios TDI son:

📌 Plan Básico: $25.000/año
   → Tarjeta digital + QR + botones de acción + visibilidad en la Guía Digital

📌 Plan Intermedio: $50.000/año
   → Todo lo anterior + enlace de referido + comisiones

📌 Plan Avanzado: $100.000/año
   → Todo lo anterior + NFT + visibilidad destacada

📌 Plan Premium: $200.000/año
   → Todo lo anterior + agente de IA (PULPO) para atención al cliente

La tarjeta digital es GRATIS, pagas por la visibilidad en la Guía Digital. ¿Cuál te llama más la atención?`,

  'precios': `¡Excelente pregunta! 🐙

Los precios TDI son:

📌 Plan Básico: $25.000/año
   → Tarjeta digital + QR + botones de acción + visibilidad en la Guía Digital

📌 Plan Intermedio: $50.000/año
   → Todo lo anterior + enlace de referido + comisiones

📌 Plan Avanzado: $100.000/año
   → Todo lo anterior + NFT + visibilidad destacada

📌 Plan Premium: $200.000/año
   → Todo lo anterior + agente de IA (PULPO) para atención al cliente

La tarjeta digital es GRATIS, pagas por la visibilidad en la Guía Digital. ¿Cuál te llama más la atención?`,

  'cuanto cuesta': `¡Excelente pregunta! 🐙

Los precios TDI son:

📌 Plan Básico: $25.000/año
   → Tarjeta digital + QR + botones de acción + visibilidad en la Guía Digital

📌 Plan Intermedio: $50.000/año
   → Todo lo anterior + enlace de referido + comisiones

📌 Plan Avanzado: $100.000/año
   → Todo lo anterior + NFT + visibilidad destacada

📌 Plan Premium: $200.000/año
   → Todo lo anterior + agente de IA (PULPO) para atención al cliente

La tarjeta digital es GRATIS, pagas por la visibilidad en la Guía Digital. ¿Cuál te llama más la atención?`,

  // === PLANES ===
  'plan basico': `📌 Plan Básico TDI: $25.000 al año

Incluye:
✅ Tarjeta digital
✅ Código QR
✅ Botones de acción (WhatsApp, llamar, compartir)
✅ Visibilidad en la Guía Digital de Cúcuta

Ideal para empezar y tener presencia digital profesional. ¿Te gustaría más información?`,

  'plan intermedio': `📌 Plan Intermedio TDI: $50.000 al año

Incluye:
✅ Todo lo del Plan Básico
✅ Enlace de referido
✅ Comisiones por cada registro con tu enlace

Empieza a generar ingresos pasivos mientras promocionas el TDI. ¡Es una oportunidad única!`,

  'plan avanzado': `📌 Plan Avanzado TDI: $100.000 al año

Incluye:
✅ Todo lo del Plan Intermedio
✅ NFT de tu negocio
✅ Visibilidad destacada en la Guía Digital

Lleva tu presencia digital al siguiente nivel con tecnología de punta.`,

  'plan premium': `📌 Plan Premium TDI: $200.000 al año

Incluye:
✅ Todo lo del Plan Avanzado
✅ Agente de IA (PULPO) para atención al cliente 24/7

Tu negocio atendido por inteligencia artificial las 24 horas, los 7 días de la semana. ¡Es como tener un asistente personal siempre disponible!`,

  // === GRATIS ===
  'tarjeta gratis': `¡Así es! 🐙

La tarjeta digital TDI es completamente GRATIS. Puedes generarla sin costo y ver cómo funciona.

El costo es por la visibilidad en la Guía Digital de Cúcuta, desde $25.000 al año. ¿Te gustaría generar la tuya ahora y luego decidir el plan?`,

  'gratis': `¡Así es! 🐙

La tarjeta digital TDI es completamente GRATIS. Puedes generarla sin costo y ver cómo funciona.

El costo es por la visibilidad en la Guía Digital de Cúcuta, desde $25.000 al año. ¿Te gustaría generar la tuya ahora y luego decidir el plan?`,

  // === BENEFICIOS ===
  'beneficios': `¡Los beneficios del TDI son muchos! 🐙

✅ Presencia digital profesional
✅ Visibilidad en la Guía Digital de Cúcuta
✅ Ingresos pasivos por sistema de referidos
✅ Automatización total (sin experiencia técnica)
✅ Agente IA (PULPO) para atender a tus clientes 24/7

¿Cuál de estos beneficios te interesa más? ¡Cuéntame y profundizo!`,

  'ventajas': `¡Los beneficios del TDI son muchos! 🐙

✅ Presencia digital profesional
✅ Visibilidad en la Guía Digital de Cúcuta
✅ Ingresos pasivos por sistema de referidos
✅ Automatización total (sin experiencia técnica)
✅ Agente IA (PULPO) para atender a tus clientes 24/7

¿Cuál de estos beneficios te interesa más? ¡Cuéntame y profundizo!`,

  'por que tdi': `Porque el TDI es la solución digital más completa y accesible para tu negocio:

🔹 Tarjeta digital GRATIS
🔹 Visibilidad en la Guía Digital de Cúcuta
🔹 Ingresos pasivos por referidos
🔹 Agente IA (PULPO) que atiende a tus clientes
🔹 Automatización total, sin experiencia técnica

Todo en un solo ecosistema. ¿Te parece interesante? 🐙`,

  // === PREGUNTAS FRECUENTES ===
  'que es la tarjeta digital': `Es una tarjeta digital inteligente con:
✅ Código QR para compartir
✅ Botones de acción (WhatsApp, llamar, compartir)
✅ Carrusel de fotos 3D
✅ Tu información de contacto

Todo eso incluido en el TDI. ¡Y la tarjeta es GRATIS!`,

  'como funciona': `El TDI funciona en 4 pasos simples: 🐙

1️⃣ Registras tus datos (nombre, teléfono, email)
2️⃣ El sistema genera tu tarjeta digital con QR y botones
3️⃣ Apareces en la Guía Digital de Cúcuta
4️⃣ Ganas comisiones por cada persona que se registra con tu enlace

¡Es automático y sin necesidad de experiencia técnica! ¿Qué te parece?`,

  'puedo generar ingresos': `¡Claro que sí! 🐙

A través del sistema de referidos TDI, cada persona que se registre con tu enlace te genera una comisión.

Es una forma de ingresos pasivos mientras ayudas a otros negocios a tener presencia digital. ¡Ganas mientras ayudas!`,

  'necesito experiencia tecnica': `¡Para nada! 🐙

El TDI es completamente automático. Solo registras tus datos y el sistema genera tu tarjeta digital.

Es tan fácil como llenar un formulario. ¡Cualquier persona puede hacerlo sin conocimientos técnicos!`,

  'como pago': `Aceptamos varios métodos de pago: 🐙

✅ Pago Móvil
✅ Transferencia bancaria
✅ Próximamente: pasarelas de pago

Todos los métodos son seguros, rápidos y fáciles de usar. ¿Cuál prefieres?`,

  'puedo probarlo antes de pagar': `¡Por supuesto! 🐙

Puedes generar tu tarjeta TDI gratis y ver cómo funciona. Sin compromiso, sin costo.

Solo pagas si quieres aparecer en la Guía Digital de Cúcuta. Es una oportunidad sin riesgo. ¿Quieres probarlo ahora?`,

  'como empiezo': `¡Empezar es muy fácil! 🐙

1. Llena el formulario con tu nombre, teléfono y email
2. El sistema genera tu tarjeta digital automáticamente
3. Luego eliges el plan de visibilidad que mejor se adapte a tu negocio

¡En 5 minutos tienes tu presencia digital lista! ¿Te animas?`,

  'registrate': `¡Regístrate ahora en el TDI! 🐙

Haz que tu negocio sea encontrado en la Guía Digital de Cúcuta. La tarjeta es gratis. La visibilidad, invaluable.

PULPO 🐙 está listo para ayudarte en cada paso. ¡No esperes más, el momento es ahora!`,

  // === DESPEDIDAS PREMIUM ===
  'gracias': `¡De nada! Ha sido un placer atenderte. 🐙

Si necesitas más información sobre el TDI, aquí estoy con mis 8 brazos listos para servirte.

Recuerda: la tarjeta digital es gratis y la visibilidad en la Guía Digital te espera. ¡Éxito con tu negocio!`,

  'adios': `¡Ha sido un placer atenderte! 🐙

Recuerda: el TDI es tu aliado para tener presencia digital, visibilidad en la Guía de Cúcuta y generar ingresos pasivos.

Si en cualquier momento quieres saber más o generar tu tarjeta, aquí estaré. ¡Con gusto te atenderé!

Que tengas un excelente día. ¡Nos vemos pronto! 🌟`,

  'chao': `¡Chao, amigo! 🐙

Antes de irte, quiero recordarte que el primer paso para hacer crecer tu negocio es estar donde te buscan. El TDI te da ese lugar.

Si tienes dudas más adelante, aquí me tienes. Siempre con una sonrisa y con los 8 brazos listos para ayudarte.

¡Éxito con tu negocio! 💪`,

  // === DIVERSIÓN Y CALIDEZ ===
  'bingo': `¡BINGO! 🎵

B-I-N-G-O, B-I-N-G-O, ¡y Bingo fue su nombre! 😄

Ahora en serio, ¿en qué puedo ayudarte con el TDI? Aquí estoy para lo que necesites. 🐙`,

  'chiste': `¿Por qué PULPO 🐙 no usa paracaídas?

Porque siempre tiene un plan de respaldo... ¡y 8 brazos para agarrarse! 😄

¿Necesitas ayuda con tu tarjeta TDI o quieres otro chiste?`,

  'canta': `🎵 T-D-I, T-D-I, tarjeta digital con mucho style... 🎵

PULPO 🐙 canta para ti, mientras tu negocio brilla sin fin. 🎤

¿Qué más necesitas saber sobre el TDI?`,
};

// ======================================================
// RUTA: CHAT CON PULPO
// ======================================================
app.post('/chat', async (req, res) => {
  const { mensaje, usuario = 'anonimo' } = req.body;
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    const mensajeLower = mensaje.toLowerCase();
    let respuesta = null;
    
    for (const [key, value] of Object.entries(conocimiento)) {
      if (mensajeLower.includes(key)) {
        respuesta = value;
        break;
      }
    }

    if (!respuesta) {
      try {
        const fetch = await import('node-fetch');
        const response = await fetch.default('https://keylessai.thryx.workers.dev/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { 
                role: 'system', 
                content: `Eres PULPO 🐙, agente digital del TDI. 
                Responde en español, amable y profesional. 
                Si no sabes algo, di: "No tengo esa información exacta, pero puedo ayudarte con precios, cómo hacer tu tarjeta, o los beneficios del TDI."`
              },
              { role: 'user', content: mensaje }
            ],
            temperature: 0.7,
            max_tokens: 150
          })
        });
        const data = await response.json();
        respuesta = data.choices?.[0]?.message?.content || 
                   'No tengo esa información exacta, pero puedo ayudarte con precios, cómo hacer tu tarjeta, o los beneficios del TDI. ¿Qué te gustaría saber?';
      } catch (error) {
        respuesta = 'No tengo esa información exacta, pero puedo ayudarte con precios, cómo hacer tu tarjeta, o los beneficios del TDI. ¿Qué te gustaría saber?';
      }
    }

    if (!conversaciones[usuario]) conversaciones[usuario] = [];
    conversaciones[usuario].push({ usuario: mensaje, bot: respuesta });
    if (conversaciones[usuario].length > 10) {
      conversaciones[usuario] = conversaciones[usuario].slice(-10);
    }

    res.json({ respuesta });

  } catch (error) {
    console.error('Error en chat:', error);
    res.json({ 
      respuesta: 'No tengo esa información exacta, pero puedo ayudarte con precios, cómo hacer tu tarjeta, o los beneficios del TDI. ¿Qué te gustaría saber?' 
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
// RUTA: Ver tarjeta con CARRUSEL 3D
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
