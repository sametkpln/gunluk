let currentUser = "";

function login() {
  const username = document.getElementById("username").value.trim();
  if (!username) return alert("Kullanıcı adı gerekli!");

  currentUser = username;
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
  document.getElementById("welcome").textContent = `${username}'nin Günlüğü`;
  showEntries();
}

function saveEntry() {
  const entryText = document.getElementById("entry").value.trim();
  const imageInput = document.getElementById("imageInput");
  if (!entryText) return;

  const reader = new FileReader();
  reader.onload = function () {
    const imageBase64 = imageInput.files[0] ? reader.result : null;

    const now = new Date();
    const date = now.toLocaleDateString("tr-TR", {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    const newEntry = { text: entryText, date, image: imageBase64 };
    const key = `entries_${currentUser}`;
    let entries = JSON.parse(localStorage.getItem(key) || "[]");
    entries.unshift(newEntry);
    localStorage.setItem(key, JSON.stringify(entries));

    document.getElementById("entry").value = "";
    imageInput.value = "";
    showEntries();
  };

  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    reader.onload(); // Görsel yoksa bile çalışsın
  }
}

function showEntries() {
  const key = `entries_${currentUser}`;
  let entries = JSON.parse(localStorage.getItem(key) || "[]");
  const container = document.getElementById("entries");
  container.innerHTML = "";

  entries.forEach(entry => {
    const div = document.createElement("div");
    div.className = "entry";
    div.innerHTML = `<small>${entry.date}</small><p>${entry.text}</p>`;
    if (entry.image) {
      div.innerHTML += `<img src="${entry.image}" style="max-width:100%; border-radius:8px; margin-top:8px;">`;
    }
    container.appendChild(div);
  });
}
