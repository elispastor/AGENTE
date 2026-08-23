const express = require('express');
const app = express();
const PORT = process.env.PORT || 1880;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// ==================== RUTAS ====================

// 1. Registro SAI (POST)
app.post('/api/sai/registro', (req, res) => {
  const { nombre, telefono, email } = req.body;
  console.log('Registro SAI recibido:', { nombre, telefono, email });
  res.json({
    mensaje: `✅ Registro exitoso, ${nombre}. Bienvenido al SAI.`,
    datos: { nombre, telefono, email }
  });
});

// 2. Página principal (MAP)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/agente.html');
});

// 3. Tarjeta SAI (GET con ID)
app.get('/tarjeta/:id', (req, res) => {
  const id = req.params.id;
  // Aquí podrías buscar los datos en una base de datos (por ahora usamos datos de ejemplo)
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
