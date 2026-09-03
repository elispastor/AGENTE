const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static(__dirname));

// =============================================
// RUTA DEL CHAT - LA MÁS SIMPLE DEL MUNDO
// =============================================
app.post('/api/chat', (req, res) => {
  console.log('📩 Mensaje recibido:', req.body);
  
  const { mensaje } = req.body;
  
  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }
  
  // Respuesta simple pero funcional
  let respuesta = '🐙 ¡Hola! Soy PULPO. Recibí tu mensaje: "' + mensaje + '"';
  
  // Algunas respuestas básicas
  const msg = mensaje.toLowerCase();
  if (msg.includes('hola')) {
    respuesta = '🐙 ¡Hola! Soy PULPO, tu agente del TDI. ¿Cómo puedo ayudarte a hacer crecer tu negocio hoy?';
  } else if (msg.includes('tarjeta')) {
    respuesta = '📇 Nuestra tarjeta digital incluye QR, botones de acción y carrusel de fotos. ¿Quieres más información?';
  } else if (msg.includes('plan') || msg.includes('precio')) {
    respuesta = '💰 Planes desde $25.000/año. ¿Te interesa el Básico, Intermedio, Avanzado o Premium?';
  }
  
  res.json({ respuesta });
});

// =============================================
// RUTA PRINCIPAL - PÁGINA DE PRUEBA
// =============================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>🐙 PULPO - Prueba</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial; background: #0a1a2e; color: white; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .container { max-width: 500px; background: rgba(255,255,255,0.1); padding: 30px; border-radius: 20px; text-align: center; }
        input, button { padding: 12px; margin: 8px; border-radius: 10px; border: none; font-size: 16px; width: 80%; }
        button { background: #fbbf24; color: #0a1a2e; font-weight: bold; cursor: pointer; }
        #respuesta { margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; min-height: 50px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🐙 PULPO - Prueba</h1>
        <p>Escribe un mensaje y PULPO te responderá:</p>
        <input type="text" id="mensaje" placeholder="Escribe algo...">
        <button onclick="enviar()">Enviar</button>
        <div id="respuesta">Esperando tu mensaje...</div>
      </div>
      <script>
        async function enviar() {
          const mensaje = document.getElementById('mensaje').value;
          const respuestaDiv = document.getElementById('respuesta');
          respuestaDiv.textContent = '⏳ Pensando...';
          
          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mensaje })
            });
            const data = await response.json();
            respuestaDiv.textContent = data.respuesta || '🐙 No entendí, intenta de nuevo.';
          } catch (error) {
            respuestaDiv.textContent = '❌ Error de conexión. Revisa que el servidor esté corriendo.';
          }
        }
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Servidor PULPO corriendo en puerto ${PORT}`);
});
