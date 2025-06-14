const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.static(path.join(__dirname, '.')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Uploads klasörünü erişilebilir yap

// Uploads klasörünün varlığını kontrol et, yoksa oluştur
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Resimlerin kaydedileceği yeri ve dosya ismini belirleyelim
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'), // Yüklenen resimler burada kaydedilecek
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) // Benzersiz isim veriyoruz
});

const upload = multer({ storage });

// Dosyaların varlığını kontrol et, yoksa oluştur
function ensureFileExists(filename, defaultContent = '[]') {
  try {
    fs.accessSync(filename);
  } catch (err) {
    fs.writeFileSync(filename, defaultContent);
  }
}

ensureFileExists('entries.json');
ensureFileExists('users.json');

// --- Ana sayfa ---
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Kayıt endpoint'i ---
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Kullanıcı adı ve şifre gerekli.' 
    });
  }

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  } catch (err) {
    users = [];
  }

  if (users.some(user => user.username === username)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Bu kullanıcı adı zaten kullanılıyor.' 
    });
  }

  users.push({ username, password });
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  
  res.json({ success: true, message: 'Kayıt başarılı!' });
});

// --- Giriş endpoint'i ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Kullanıcı adı ve şifre gerekli.' 
    });
  }

  let users = [];
  try {
    users = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  } catch (err) {
    users = [];
  }
  
  const user = users.find(user => user.username === username && user.password === password);
  
  if (user) {
    res.json({ success: true, message: 'Giriş başarılı!' });
  } else {
    res.status(401).json({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });
  }
});

// --- Resim yükleme endpoint'i ---
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Resim yüklenmedi.' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// --- Kayıt ekleme endpoint'i ---
app.post('/saveEntry', upload.single('image'), (req, res) => {
  const { username, text, date } = req.body;
  
  if (!username || !text) {
    return res.status(400).json({ 
      success: false, 
      message: 'Kullanıcı adı ve metin gerekli.' 
    });
  }
  
  let entries = [];
  try {
    entries = JSON.parse(fs.readFileSync('entries.json', 'utf8'));
  } catch (err) {
    entries = [];
  }
  
  let imagePath = null;
  if (req.file) {
    imagePath = `/uploads/${req.file.filename}`;
  }
  
  entries.push({ 
    username, 
    text, 
    image: imagePath, 
    date: date || new Date().toLocaleString('tr-TR') 
  });
  
  fs.writeFileSync('entries.json', JSON.stringify(entries, null, 2));
  
  res.json({ success: true });
});

// --- Kayıtları getirme endpoint'i ---
app.get('/entries/:username', (req, res) => {
  const username = req.params.username;
  
  let entries = [];
  try {
    entries = JSON.parse(fs.readFileSync('entries.json', 'utf8'));
  } catch (err) {
    entries = [];
  }
  
  const userEntries = entries
    .filter(entry => entry.username === username)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // En yeni en üstte
  
  res.json(userEntries);
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});