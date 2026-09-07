const express = require('express');
const multer = require('multer');
const fs = require('fs');

const TARJETAS_FILE = './tarjetas.json';

function cargarTarjetas() {
  try {
    if (fs.existsSync(TARJETAS_FILE)) {
      return JSON.parse(fs.readFileSync(TARJETAS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error:', e);
  }
  return {};
}

function guardarTarjetas(t) {
  fs.writeFileSync(TARJETAS_FILE, JSON.stringify(t, null, 2));
}

const tarjetas = cargarTarjetas();
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

app.get('/test', (req, res) => {
  res.send('OK');
});

app.post('/chat', (req, res) => {
  const { mensaje } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Falta mensaje' });
  
  let r = 'Hola';
  const m = mensaje.toLowerCase();
  if (m.includes('hola')) r = 'Hola! Soy PULPO';
  else if (m.includes('plan')) r = 'Planes desde $25k';
  
  res.json({ respuesta: r });
});

app.post('/api/generar-tarjeta', upload.any(), (req, res) => {
  const { nombre, telefono, email } = req.body;
  const id = Date.now().toString(36);
  const enlace = 'https://tu-app.onrender.com/tarjeta/' + id;
  
  tarjetas[id] = {
    nombre,
    telefono,
    email: email || '',
    fotoPortada: null,
    fotosCarrusel: [],
    enlace,
    fecha: new Date().toISOString()
  };
  
  guardarTarjetas(tarjetas);
  res.json({ mensaje: 'OK', enlace });
});

app.get('/tarjeta/:id', (req, res) => {
  const t = tarjetas[req.params.id];
  if (!t) return res.status(404).send('No encontrada');
  
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(t.enlace);
  
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>' + t.nombre + '</title>' +
    '<style>body{background:linear-gradient(145deg,#0a1a2e,#1a2f44);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px;font-family:sans-serif}.container{max-width:520px;width:100%;background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);border-radius:32px;padding:24px}.info{text-align:center;color:#fff;margin-top:20px;padding:16px;background:rgba(0,0,0,0.3);border-radius:16px}.info h2{color:#fbbf24}.botones{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px 0}.btn{padding:12px 20px;border-radius:60px;font-weight:700;border:none;text-decoration:none;cursor:pointer}.btn-wa{background:#25D366;color:#fff}.btn-call{background:#1a4b6d;color:#fff}.qr{text-align:center;margin:12px 0}.qr img{width:100px;height:100px;border-radius:16px;background:#fff;padding:8px}</style>' +
    '</head><body><div class="container"><div class="info"><h2>' + t.nombre + '</h2><p>' + t.telefono + '</p><p>' + (t.email || '') + '</p></div><div class="botones"><a href="https://wa.me/' + t.telefono + '" class="btn btn-wa">WhatsApp</a><a href="tel:' + t.telefono + '" class="btn btn-call">Llamar</a></div><div class="qr"><img src="' + qrUrl + '" alt="QR"><p>Escanea</p></div></div></body></html>';
  
  res.send(html);
});

app.get('/julio-vargas', (req, res) => {
  const t = {
    nombre: 'Julio Vargas',
    telefono: '04166520591',
    email: 'juliovargas1478@gmail.com',
    enlace: 'https://guia-digital.com/julio-vargas'
  };
  
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(t.enlace);
  
  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Julio Vargas</title>' +
    '<style>body{background:linear-gradient(145deg,#0a1a2e,#1a2f44);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:16px;font-family:sans-serif}.container{max-width:520px;width:100%;background:rgba(255,255,255,0.06);border-radius:32px;padding:24px}.info{text-align:center;color:#fff;margin-top:20px;padding:16px;background:rgba(0,0,0,0.3);border-radius:16px}h2{color:#fbbf24}.btn{display:inline-block;padding:12px 20px;margin:5px;border-radius:60px;text-decoration:none;font-weight:700}.btn-wa{background:#25D366;color:#fff}.btn-call{background:#1a4b6d;color:#fff}.qr{text-align:center;margin:12px 0}.qr img{width:100px;height:100px;border-radius:16px;background:#fff;padding:8px}.form{background:rgba(255,255,255,0.05);border-radius:24px;padding:24px;margin-top:24px}input,select{width:100%;padding:12px;margin:8px 0;border-radius:12px;border:none;background:rgba(255,255,255,0.06);color:#fff}.btn-submit{width:100%;padding:14px;background:linear-gradient(135deg,#25D366,#128C7E);color:#fff;border:none;border-radius:40px;font-weight:700;cursor:pointer;margin-top:12px}</style>' +
    '</head><body><div class="container"><div class="info"><h2>' + t.nombre + '</h2><p>' + t.telefono + '</p><p>' + t.email + '</p></div><div><a href="https://wa.me/' + t.telefono + '" class="btn btn-wa">WhatsApp</a><a href="tel:' + t.telefono + '" class="btn btn-call">Llamar</a></div><div class="qr"><img src="' + qrUrl + '"><p>Escanea</p></div><div class="form"><h3 style="color:#fbbf24;text-align:center">Obtén tu Tarjeta</h3><form onsubmit="enviar(event)"><input type="text" id="nombre" placeholder="Nombre" required><input type="tel" id="telefono" placeholder="Teléfono" required><input type="email" id="email" placeholder="Email"><input type="text" id="negocio" placeholder="Negocio"><select id="plan"><option>Básico ($25k)</option><option selected>Intermedio ($50k)</option><option>Avanzado ($100k)</option><option>Premium ($200k)</option></select><button type="submit" class="btn-submit">Enviar por WhatsApp</button></form></div></div><script>function enviar(e){e.preventDefault();const n=document.getElementById("nombre").value,t=document.getElementById("telefono").value,email=document.getElementById("email").value,neg=document.getElementById("negocio").value,plan=document.getElementById("plan").value;if(!n||!t){alert("Completa nombre y teléfono");return}const msg=encodeURIComponent("📇 NUEVO AFILIADO\\n👤 "+n+"\\n📱 "+t+"\\n📧 "+(email||"")+"\\n🏢 "+(neg||"")+"\\n📋 "+plan);window.open("https://wa.me/573244913371?text="+msg,"_blank")}</script></body></html>';
  
  res.send(html);
});

app.listen(PORT, '0.0.0.0', function() {
  console.log('Servidor TDI en puerto ' + PORT);
});
