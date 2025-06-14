let currentUser = "";

function showRegister() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("registerScreen").style.display = "block";
}

function showLogin() {
  document.getElementById("registerScreen").style.display = "none";
  document.getElementById("loginScreen").style.display = "block";
}

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return alert("Tüm alanlar gerekli!");

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert("Kayıt başarılı! Şimdi giriş yapabilirsiniz.");
      showLogin();
    } else {
      alert(data.message || "Kayıt işlemi başarısız.");
    }
  } catch (error) {
    alert("Bir hata oluştu: " + error.message);
  }
}

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  if (!username || !password) return alert("Tüm alanlar gerekli!");

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      currentUser = username;
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("appScreen").style.display = "block";
      document.getElementById("welcome").textContent = `${username}'nin Günlüğü`;
      loadEntries();
    } else {
      alert(data.message || "Kullanıcı adı veya şifre hatalı!");
    }
  } catch (error) {
    alert("Bir hata oluştu: " + error.message);
  }
}

async function saveEntry() {
  const entryText = document.getElementById("entry").value.trim();
  const imageInput = document.getElementById("imageInput");
  if (!entryText) return alert("Bir şeyler yazmalısın!");

  // Tarih formatı için
  const now = new Date();
  const dateStr = now.toLocaleDateString('tr-TR') + " " + 
                now.getHours().toString().padStart(2, '0') + ":" + 
                now.getMinutes().toString().padStart(2, '0');

  try {
    const formData = new FormData();
    formData.append('username', currentUser);
    formData.append('text', entryText);
    formData.append('date', dateStr);
    
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    const response = await fetch('/saveEntry', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Formu temizle
      document.getElementById("entry").value = "";
      imageInput.value = "";
      
      // Girişleri yeniden yükle
      loadEntries();
    } else {
      alert(data.message || "Kayıt eklenirken bir hata oluştu.");
    }
  } catch (error) {
    alert("Bir hata oluştu: " + error.message);
  }
}

async function loadEntries() {
  try {
    const response = await fetch(`/entries/${currentUser}`);
    const userEntries = await response.json();

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
  } catch (error) {
    console.error("Girişler yüklenirken hata oluştu:", error);
  }
}