// Ambil elemen
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

// simpan file-file yang dipilih
let files = [];
let currentFile = null;

// cegah browser buka file di tab baru saat drag & drop ke window
["dragover", "drop"].forEach(eventName => {
  window.addEventListener(eventName, (e) => {
    e.preventDefault();
  });
});

/* === FILE PICKER & DRAG DROP === */

// klik tombol -> open dialog
chooseBtn.addEventListener("click", () => {
  uploadInput.click();
});

// pilih file via dialog
uploadInput.addEventListener("change", () => {
  if (!uploadInput.files.length) return;

  const newFiles = Array.from(uploadInput.files).filter(f => f.type.startsWith("image/"));
  if (!newFiles.length) {
    alert("Harap pilih file gambar (jpg/png/dll).");
    return;
  }

  addFiles(newFiles);
});

// drag over area
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

// keluar dari area
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
});

// drop file ke area
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const dropped = e.dataTransfer.files;
  if (!dropped || !dropped.length) return;

  const newFiles = Array.from(dropped).filter(f => f.type.startsWith("image/"));
  if (!newFiles.length) {
    alert("Harap drop file gambar (jpg/png/dll).");
    return;
  }

  addFiles(newFiles);
});

// tambahkan file ke list + update tampilan
function addFiles(newFiles) {
  // tambahkan ke array
  newFiles.forEach(f => files.push(f));

  // file aktif = yang terakhir di-add
  currentFile = files[files.length - 1];

  // render chips
  renderFileChips();

  // ringkasan
  if (files.length === 1) {
    fileNameEl.textContent = files[0].name;
  } else {
    fileNameEl.textContent = `${files.length} file dipilih (terakhir: ${currentFile.name})`;
  }

  // sembunyikan dropzone, tampilkan list
  dropZone.classList.add("hidden");
  fileChipsEl.classList.remove("hidden");
}

// tampilkan list nama file sebagai chip
function renderFileChips() {
  fileChipsEl.innerHTML = "";

  files.forEach((file, index) => {
    const chip = document.createElement("div");
    chip.className = "file-chip";

    // tandai yang aktif (terakhir)
    if (index === files.length - 1) {
      chip.style.borderColor = "#00c853";
    }

    chip.textContent = file.name;
    fileChipsEl.appendChild(chip);
  });
}

/* === SLIDER BACKGROUND === */
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

// slider -> number
range.addEventListener("input", () => {
  number.value = range.value;
  updateSliderBackground();
});

// number -> slider
number.addEventListener("input", () => {
  const val = parseFloat(number.value);
  if (val >= 0.1 && val <= 1) {
    range.value = val;
    updateSliderBackground();
  }
});

/* === UTIL FORMAT SIZE === */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
}

/* === KOMPRES === */
function compress() {
  const file = currentFile;
  if (!file) {
    alert("Silakan pilih atau drop gambar terlebih dahulu.");
    return;
  }

  const quality = parseFloat(range.value);
  beforeSize.textContent = formatSize(file.size);

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

      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);

          afterSize.textContent = formatSize(blob.size);

          preview.src = url;
          preview.style.display = "block";

          downloadEl.href = url;
          downloadEl.download = "compressed.jpg";
          downloadEl.classList.remove("hidden");
        },
        "image/jpeg",
        quality
      );
    };
  };
  reader.readAsDataURL(file);
}

/* === RESET === */
function resetAll() {
  files = [];
  currentFile = null;

  uploadInput.value = "";
  fileNameEl.textContent = "No file chosen";

  // tampilkan lagi dropzone, sembunyikan list
  dropZone.classList.remove("hidden");
  fileChipsEl.classList.add("hidden");
  fileChipsEl.innerHTML = "";

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

/* === DARK / LIGHT MODE === */
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");

  toggleBtn.textContent = document.body.classList.contains("dark")
    ? "Light Mode"
    : "Dark Mode";

  updateSliderBackground();
});

/* === EVENT TOMBOL === */
compressBtn.addEventListener("click", compress);
resetBtn.addEventListener("click", resetAll);

/* INIT */
updateSliderBackground();
