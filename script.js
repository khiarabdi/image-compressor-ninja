const range       = document.getElementById("qualityRange");
const number      = document.getElementById("qualityNumber");
const toggleBtn   = document.getElementById("toggle-theme");
const beforeSize  = document.getElementById("beforeSize");
const afterSize   = document.getElementById("afterSize");
const uploadInput = document.getElementById("upload");
const fileNameEl  = document.getElementById("file-name");
const preview     = document.getElementById("preview");
const downloadEl  = document.getElementById("download");
const chooseBtn   = document.getElementById("choose-btn");
const compressBtn = document.getElementById("compress-btn");
const resetBtn    = document.getElementById("reset-btn");
const dropZone    = document.getElementById("drop-zone");
const fileChipsEl = document.getElementById("file-chips");

let files = [];
let currentIndex = null;

// cegah browser buka file di tab
["dragover", "drop"].forEach(eventName => {
  window.addEventListener(eventName, (e) => e.preventDefault());
});

/* ========== FILE INPUT & DROP ========== */

chooseBtn.addEventListener("click", () => uploadInput.click());

uploadInput.addEventListener("change", () => {
  const newFiles = Array.from(uploadInput.files).filter(f => f.type.startsWith("image/"));
  addFiles(newFiles);
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
  addFiles(newFiles);
});

/* ========== ADD FILES ========== */

function addFiles(newFiles) {
  if (!newFiles.length) {
    alert("Harap masukkan file gambar (jpg/png/webp dll)");
    return;
  }

  files = [...files, ...newFiles];
  currentIndex = files.length - 1; // terakhir jadi aktif

  renderFileChips();

  if (files.length === 1) {
    fileNameEl.textContent = files[0].name;
  } else {
    fileNameEl.textContent = `${files.length} file terpilih (aktif: ${files[currentIndex].name})`;
  }

  dropZone.classList.add("hidden");
  fileChipsEl.classList.remove("hidden");
}

/* ========== FILE LIST / CHIPS ========== */

function renderFileChips() {
  fileChipsEl.innerHTML = "";

  files.forEach((file, index) => {
    const chip = document.createElement("div");
    chip.className = "file-chip";
    chip.textContent = file.name;

    if (index === currentIndex) {
      chip.style.borderColor = "#00c853";
      chip.style.fontWeight = "bold";
    }

    // klik chip = pilih file aktif
    chip.onclick = () => {
      currentIndex = index;
      fileNameEl.textContent = `${files.length} file terpilih (aktif: ${file.name})`;
      renderFileChips();
    };

    fileChipsEl.appendChild(chip);
  });
}

/* ========== SLIDER ========== */

function updateSliderBackground() {
  const min = parseFloat(range.min) || 0;
  const max = parseFloat(range.max) || 1;
  const val = ((parseFloat(range.value) - min) / (max - min)) * 100;

  const baseColor = document.body.classList.contains("light")
    ? "#ddd"
    : "#2c2c2c";

  range.style.background = `linear-gradient(to right,
    #007bff 0%,
    #007bff ${val}%,
    ${baseColor} ${val}%,
    ${baseColor} 100%)`;
}

range.addEventListener("input", () => {
  number.value = range.value;
  updateSliderBackground();
});

number.addEventListener("input", () => {
  if (number.value >= 0.1 && number.value <= 1) {
    range.value = number.value;
    updateSliderBackground();
  }
});

/* ========== SIZE FORMAT ========== */

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
}

/* ========== COMPRESS SINGLE ========== */

function compressSingle(file) {
  return new Promise((resolve) => {
    const quality = parseFloat(range.value);

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url, name: file.name });
        }, "image/jpeg", quality);
      };
    };
    reader.readAsDataURL(file);
  });
}

/* ========== COMPRESS BUTTON ========== */

async function compress() {
  if (!files.length) {
    alert("Silakan pilih atau drop gambar terlebih dahulu.");
    return;
  }

  // 👉 kalau cuma 1 file
  if (files.length === 1) {
    const file = files[0];

    beforeSize.textContent = formatSize(file.size);

    const { blob, url } = await compressSingle(file);

    afterSize.textContent = formatSize(blob.size);

    preview.src = url;
    preview.style.display = "block";

    downloadEl.href = url;
    downloadEl.download = "compressed_" + file.name;
    downloadEl.classList.remove("hidden");

    return;
  }

  // 👉 MULTI FILE MODE
  alert("Banyak file terdeteksi. Akan dikompres & didownload satu per satu.");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    beforeSize.textContent = formatSize(file.size);

    const { blob, url, name } = await compressSingle(file);

    afterSize.textContent = formatSize(blob.size);

    // auto-download
    const link = document.createElement("a");
    link.href = url;
    link.download = "compressed_" + name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    await new Promise(r => setTimeout(r, 600)); // delay biar ga spam browser
  }

  alert("Semua file berhasil dikompres!");
}

/* ========== RESET ========== */

function resetAll() {
  files = [];
  currentIndex = null;

  uploadInput.value = "";
  fileNameEl.textContent = "No file chosen";
  fileChipsEl.innerHTML = "";
  fileChipsEl.classList.add("hidden");

  dropZone.classList.remove("hidden");

  preview.style.display = "none";
  preview.src = "";

  downloadEl.classList.add("hidden");
  downloadEl.removeAttribute("href");

  beforeSize.textContent = "-";
  afterSize.textContent = "-";

  range.value = 0.8;
  number.value = 0.8;
  updateSliderBackground();
}

/* ========== TOGGLE MODE ========== */

toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");

  toggleBtn.textContent = document.body.classList.contains("dark")
    ? "Light Mode"
    : "Dark Mode";

  updateSliderBackground();
});

/* ========== EVENTS ========== */

compressBtn.addEventListener("click", compress);
resetBtn.addEventListener("click", resetAll);

updateSliderBackground();
