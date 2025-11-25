const range = document.getElementById("qualityRange");
const number = document.getElementById("qualityNumber");
const toggleBtn = document.getElementById("toggle-theme");
const beforeSize = document.getElementById("beforeSize");
const afterSize = document.getElementById("afterSize");
const uploadInput = document.getElementById("upload");
const fileNameText = document.getElementById("file-name");
const preview = document.getElementById("preview");
const downloadLink = document.getElementById("download");
const chooseBtn = document.getElementById("choose-btn");
const compressBtn = document.getElementById("compress-btn");
const resetBtn = document.getElementById("reset-btn");

/* Choose file */
chooseBtn.addEventListener("click", () => {
  uploadInput.click();
});

/* Nama file */
uploadInput.addEventListener("change", () => {
  if (uploadInput.files.length > 0) {
    fileNameText.textContent = uploadInput.files[0].name;
  } else {
    fileNameText.textContent = "No file chosen";
  }
});

/* Slider warna */
function updateSliderBackground() {
  const min = parseFloat(range.min) || 0;
  const max = parseFloat(range.max) || 1;
  const val = ((parseFloat(range.value) - min) / (max - min)) * 100;
  range.style.background = `linear-gradient(to right, #007bff ${val}%, #2c2c2c ${val}%)`;
}

/* slider -> number */
range.addEventListener("input", () => {
  number.value = range.value;
  updateSliderBackground();
});

/* number -> slider */
number.addEventListener("input", () => {
  if (number.value >= 0.1 && number.value <= 1) {
    range.value = number.value;
    updateSliderBackground();
  }
});

/* format size */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
}

/* KOMPRES */
function compress() {
  const file = uploadInput.files[0];
  if (!file) {
    alert("Silakan pilih gambar terlebih dahulu.");
    return;
  }

  const quality = parseFloat(range.value);
  beforeSize.textContent = formatSize(file.size);

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.src = e.target.result;

    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);

        afterSize.textContent = formatSize(blob.size);

        preview.src = url;
        preview.style.display = "block";

        downloadLink.href = url;
        downloadLink.download = "compressed.jpg";
        downloadLink.classList.remove("hidden");
      }, "image/jpeg", quality);
    }
  };

  reader.readAsDataURL(file);
}

/* RESET */
function resetAll() {
  uploadInput.value = "";
  fileNameText.textContent = "No file chosen";

  preview.style.display = "none";
  preview.src = "";

  downloadLink.classList.add("hidden");
  downloadLink.removeAttribute("href");

  beforeSize.textContent = "-";
  afterSize.textContent = "-";

  range.value = 0.8;
  number.value = 0.8;

  updateSliderBackground();
}

/* Tombol event */
compressBtn.addEventListener("click", compress);
resetBtn.addEventListener("click", resetAll);

/* Toggle Dark/Light */
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");

  toggleBtn.textContent = 
    document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
});

/* start awal */
updateSliderBackground();
