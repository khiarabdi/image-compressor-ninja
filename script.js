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

// file yang sedang dipakai (pilih / drag-drop)
let currentFile = null;

/* === FILE PICKER & DRAG DROP === */

// klik tombol -> buka dialog file
chooseBtn.addEventListener("click", () => {
  uploadInput.click();
});

// saat pilih file biasa
uploadInput.addEventListener("change", () => {
  if (uploadInput.files.length > 0) {
    currentFile = uploadInput.files[0];
    fileNameEl.textContent = currentFile.name;
  } else {
    currentFile = null;
    fileNameEl.textContent = "No file chosen";
  }
});

// drag over
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

// drag leave
dropZone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
});

// drop file
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const files = e.dataTransfer.files;
  if (!files || !files.length) return;

  const file = files[0];
  if (!file.type.startsWith("image/")) {
    alert("Harap drop file gambar (jpg/png/dll).");
    return;
  }

  currentFile = file;
  fileNameEl.textContent = file.name;
});

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
  currentFile = null;
  uploadInput.value = "";
  fileNameEl.textContent = "No file chosen";

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
