const express = require('express');
const app = express();
const PORT = process.env.PORT || 1880;

app.use(express.json());
app.use(express.static(__dirname));

// ======================================================
// RUTA PRINCIPAL: SIRVE agente.html
// ======================================================
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/agente.html');
});

// ======================================================
// RUTA /chat PARA HABLAR CON EL AGENTE (USANDO GEMINI)
// ======================================================
app.post('/chat', async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ error: 'Mensaje vacío' });
  }

  try {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: mensaje }] }]
        })
      }
    );

    const data = await respuesta.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar tu mensaje.';

    res.json({ respuesta: texto });
  } catch (error) {
    console.error('Error con Gemini:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud' });
  }
});

// ======================================================
// INICIO DEL SERVIDOR
// ======================================================
app.listen(PORT, () => {
  console.log(`✅ Servidor MAP con Gemini corriendo en puerto ${PORT}`);
});});

// 4. Registro de Particulares (POST)
app.post('/api/particulares/registro', (req, res) => {
  const { nombre, telefono, profesion, direccion } = req.body;
  console.log('Particular registrado:', { nombre, telefono, profesion, direccion });
  res.json({
    mensaje: `✅ Registro exitoso, ${nombre}. Tu perfil ha sido creado.`
  });
});

// 5. Página principal (MAP)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/agente.html');
});

// 6. Página de motorizados
app.get('/motorizados.html', (req, res) => {
  res.sendFile(__dirname + '/motorizados.html');
});

// 7. Tarjeta SAI (GET con ID)
app.get('/tarjeta/:id', (req, res) => {
  const id = req.params.id;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Tarjeta SAI</title>
      <style>
        body { font-family: Arial; max-width: 600px; margin: 40px auto; padding: 20px; background: #f5f5f5; text-align: center; }
        .card { background: white; padding: 30px; border-radius: 16px; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        h1 { color: #0b2b40; }
        .datos { font-size: 18px; margin: 20px 0; }
        .id { color: #888; font-size: 14px; margin-top: 20px; }
        .enlace { color: #0b2b40; text-decoration: none; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🧾 Tarjeta SAI</h1>
        <div class="datos">
          <p><strong>👤 Usuario:</strong> ${id}</p>
          <p>✅ Registro exitoso en el SAI.</p>
        </div>
        <div class="id">ID de tarjeta: ${id}</div>
        <p><a href="/" class="enlace">← Volver al SAI</a></p>
      </div>
    </body>
    </html>
  `);
});

// ==================== SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`Servidor SAI corriendo en puerto ${PORT}`);
});
