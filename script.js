let currentUser = "";

function showRegister() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("registerScreen").style.display = "block";
}

function showLogin() {
  document.getElementById("registerScreen").style.display = "none";
  document.getElementById("loginScreen").style.display = "block";
}

function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Tüm alanlar gerekli!");

  // Kullanıcıları yerel depolamadan al
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
  } catch (e) {
    users = [];
  }

  // Kullanıcı zaten var mı kontrol et
  if (users.some(user => user.username === username)) {
    return alert("Bu kullanıcı adı zaten kullanılıyor!");
  }

  // Yeni kullanıcı ekle
  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  
  alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
  showLogin();
}

function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (!username || !password) return alert("Tüm alanlar gerekli!");

  // Kullanıcıları yerel depolamadan al
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
  } catch (e) {
    users = [];
  }

  // Kullanıcıyı ve şifreyi kontrol et
  const user = users.find(user => user.username === username && user.password === password);
  
  if (user) {
    currentUser = username;
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appScreen").style.display = "block";
    document.getElementById("welcome").textContent = `${username}'nin Günlüğü`;
    loadEntries();
  } else {
    alert("Kullanıcı adı veya şifre hatalı!");
  }
}

function saveEntry() {
  const entryText = document.getElementById("entry").value.trim();
  const imageInput = document.getElementById("imageInput");
  if (!entryText) return alert("Bir şeyler yazmalısın!");

  // Tarih formatı için
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR') + " " + 
                  now.getHours().toString().padStart(2, '0') + ":" + 
                  now.getMinutes().toString().padStart(2, '0');

  const reader = new FileReader();
  reader.onload = function () {
    const imageBase64 = imageInput.files[0] ? reader.result : null;

    // Yerel depolama için giriş nesnesini oluştur
    const entry = {
      username: currentUser,
      text: entryText,
      image: imageBase64,
      date: dateStr
    };

    // Mevcut kayıtları al
    let entries = [];
    try {
      entries = JSON.parse(localStorage.getItem('entries')) || [];
    } catch (e) {
      entries = [];
    }

    // Yeni girişi ekle
    entries.push(entry);
    
    // Güncellenmiş girişleri kaydet
    localStorage.setItem('entries', JSON.stringify(entries));

    // Formu temizle
    document.getElementById("entry").value = "";
    imageInput.value = "";
    
    // Girişleri yeniden yükle
    loadEntries();
  };

  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    reader.onload(); // görsel yoksa da çalış
  }
}

function loadEntries() {
  // Yerel depolamadan girişleri al
  let entries = [];
  try {
    entries = JSON.parse(localStorage.getItem('entries')) || [];
  } catch (e) {
    entries = [];
  }

  // Sadece mevcut kullanıcının girişlerini filtrele
  const userEntries = entries
    .filter(entry => entry.username === currentUser)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // En yeni en üstte

  const container = document.getElementById("entries");
  container.innerHTML = "";

  userEntries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `<small>${entry.date}</small><p>${entry.text}</p>`;
    if (entry.image) {
      div.innerHTML += `<img src="${entry.image}" alt="Günlük görseli">`;
    }
    container.appendChild(div);
  });
}
