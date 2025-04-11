const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// JSON veri boyutu sınırını artır (resimler için)
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '.')));

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

// --- Kayıt ekleme endpoint'i ---
app.post('/saveEntry', (req, res) => {
  const { username, text, image, date } = req.body;
  
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
  
  entries.push({ username, text, image, date });
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

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
