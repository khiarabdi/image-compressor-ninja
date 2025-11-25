// ELEMENTS
const uploadInput = document.getElementById("upload");
const dropZone    = document.getElementById("drop-zone");
const chooseBtn   = document.getElementById("choose-btn");
const addMoreBtn  = document.getElementById("add-more-btn");
const fileNameEl  = document.getElementById("file-name");
const fileChipsEl = document.getElementById("file-chips");
const sizeListEl  = document.getElementById("size-list");
const compressBtn = document.getElementById("compress-btn");
const resetBtn    = document.getElementById("reset-btn");
const preview     = document.getElementById("preview");
const downloadEl  = document.getElementById("download");
const range       = document.getElementById("qualityRange");
const numberInput = document.getElementById("qualityNumber");
const toggleTheme = document.getElementById("toggle-theme");
const langButtons = document.querySelectorAll(".lang-btn");

// UI text elements for i18n
const titleText   = document.getElementById("title-text");
const subtitleText= document.getElementById("subtitle-text");
const pickLabel   = document.getElementById("pick-label");
const dropText    = document.getElementById("drop-text");
const qualityLabel= document.getElementById("quality-label");
const sizeTitle   = document.getElementById("size-title");
const resultTitle = document.getElementById("result-title");

let files = [];
let currentLang = "id";
let compressedResults = [];     // semua hasil kompres
let previewContainer = null;   // container thumbnail

/* ======= i18n TEXTS ======= */
const i18n = {
  id: {
    title: "Image Compressor Sederhana",
    subtitle: "Upload gambar, atur kualitas, lalu kompres & download.",
    pickLabel: "Pilih Gambar",
    dropText: "Drag & drop gambar ke sini<br>atau",
    chooseFile: "Pilih File",
    addMore: "+ Tambah Gambar Lagi",
    quality: "Kualitas",
    sizeTitle: "Ukuran file:",
    resultTitle: "Hasil Kompres:",
    compress: "Kompres",
    reset: "Reset",
    download: "Download semua file",
    noFile: "Belum ada file",
    alertNoImage: "Harap masukkan gambar terlebih dahulu (jpg/png/dll).",
    alertDoneMulti: "Semua file berhasil dikompres!"
  },
  en: {
    title: "Simple Image Compressor",
    subtitle: "Upload images, set quality, then compress & download.",
    pickLabel: "Select Image",
    dropText: "Drag & drop images here<br>or",
    chooseFile: "Choose File",
    addMore: "+ Add More Images",
    quality: "Quality",
    sizeTitle: "File sizes:",
    resultTitle: "Compression Result:",
    compress: "Compress",
    reset: "Reset",
    download: "Download all files",
    noFile: "No file chosen",
    alertNoImage: "Please add image files first (jpg/png/etc).",
    alertDoneMulti: "All files have been compressed!"
  }
};

function setLanguage(lang) {
  currentLang = lang;
  const t = i18n[lang];

  titleText.textContent    = t.title;
  subtitleText.textContent = t.subtitle;
  pickLabel.textContent    = t.pickLabel;
  dropText.innerHTML       = t.dropText;
  chooseBtn.textContent    = t.chooseFile;
  addMoreBtn.textContent   = t.addMore;
  qualityLabel.textContent = t.quality;
  sizeTitle.textContent    = t.sizeTitle;
  resultTitle.textContent  = t.resultTitle;
  compressBtn.textContent  = t.compress;
  resetBtn.textContent     = t.reset;
  downloadEl.textContent   = t.download;

  if (!files.length) fileNameEl.textContent = t.noFile;

  langButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setLanguage(btn.dataset.lang);
  });
});

/* ======= THEME TOGGLE ======= */
toggleTheme.addEventListener("click", () => {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");

  toggleTheme.textContent = document.body.classList.contains("dark")
    ? "Light Mode"
    : "Dark Mode";
});

/* ======= PREVENT DEFAULT WINDOW DRAG ======= */
["dragover", "drop"].forEach(event =>
  window.addEventListener(event, e => e.preventDefault())
);

/* ======= FILE HANDLING ======= */
chooseBtn.onclick = () => uploadInput.click();
addMoreBtn.onclick = () => uploadInput.click();

uploadInput.onchange = () => {
  addFiles([...uploadInput.files]);
};

dropZone.ondragover = (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
};

dropZone.ondragleave = () => {
  dropZone.classList.remove("dragover");
};

dropZone.ondrop = (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const newFiles = getFilesFromDataTransfer(e.dataTransfer);
  addFiles(newFiles);
};

function getFilesFromDataTransfer(dt) {
  const result = [];
  if (dt.items && dt.items.length) {
    for (let i = 0; i < dt.items.length; i++) {
      const item = dt.items[i];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file && file.type.startsWith("image/")) result.push(file);
      }
    }
  } else if (dt.files && dt.files.length) {
    for (let i = 0; i < dt.files.length; i++) {
      const file = dt.files[i];
      if (file.type.startsWith("image/")) result.push(file);
    }
  }
  return result;
}

function addFiles(newFiles) {
  newFiles.forEach(f => {
    if (f.type.startsWith("image/")) files.push(f);
  });

  if (!files.length) return;

  fileNameEl.textContent = `${files.length} file terpilih`;
  addMoreBtn.classList.remove("hidden");
  fileChipsEl.classList.remove("hidden");

  renderFileList();
}

function renderFileList() {
  fileChipsEl.innerHTML = "";
  files.forEach(file => {
    const div = document.createElement("div");
    div.className = "file-chip";
    div.textContent = file.name;
    fileChipsEl.appendChild(div);
  });
}

/* ======= SIZE FORMAT ======= */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / 1048576).toFixed(2) + " MB";
}

/* ======= COMPRESS LOGIC ======= */
compressBtn.onclick = async () => {
  if (!files.length) {
    alert(i18n[currentLang].alertNoImage);
    return;
  }

  sizeListEl.innerHTML = "";
  compressedResults = [];

  // siapkan container preview banyak
  if (!previewContainer) {
    previewContainer = document.getElementById("preview-container");
    if (!previewContainer) {
      previewContainer = document.createElement("div");
      previewContainer.id = "preview-container";
      preview.insertAdjacentElement("afterend", previewContainer);
    }
  }
  preview.style.display = "none";
  preview.src = "";
  previewContainer.innerHTML = "";

  downloadEl.classList.add("hidden");
  downloadEl.removeAttribute("href");
  downloadEl.removeAttribute("download");

  for (const file of files) {
    const { blob, url } = await compressSingle(file);
    const before = formatSize(file.size);
    const after  = formatSize(blob.size);

    const item = document.createElement("div");
    item.className = "size-item";
    item.textContent = `${file.name}: ${before} → ${after}`;
    sizeListEl.appendChild(item);

    // simpan untuk tombol download all
    compressedResults.push({ name: file.name, url });

    // PREVIEW + DOWNLOAD PER FILE
    const wrapper = document.createElement("div");
    wrapper.className = "preview-item";

    const img = document.createElement("img");
    img.src = url;
    img.alt = file.name;
    img.className = "preview-thumb";

    const btn = document.createElement("a");
    btn.className = "download-single";
    btn.textContent = "Download";
    btn.href = url;
    btn.download = "compressed_" + file.name;

    wrapper.appendChild(img);
    wrapper.appendChild(btn);
    previewContainer.appendChild(wrapper);

    await new Promise(r => setTimeout(r, 150));
  }

  // tampilkan tombol download all jika ada hasil
  if (compressedResults.length > 0) {
    downloadEl.classList.remove("hidden");
    downloadEl.href = "#";
  }

  // nggak ada alert "berhasil dikompres"
};

function compressSingle(file) {
  return new Promise((resolve) => {
    const q = parseFloat(range.value);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        }, "image/jpeg", q);
      };
    };

    reader.readAsDataURL(file);
  });
}

/* ======= DOWNLOAD SEMUA FILE ======= */
downloadEl.addEventListener("click", (e) => {
  e.preventDefault();
  if (!compressedResults.length) return;

  compressedResults.forEach(({ name, url }) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_" + name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

/* ======= RESET ======= */
resetBtn.onclick = () => {
  files = [];
  compressedResults = [];
  uploadInput.value = "";
  fileNameEl.textContent = i18n[currentLang].noFile;
  fileChipsEl.innerHTML = "";
  fileChipsEl.classList.add("hidden");
  addMoreBtn.classList.add("hidden");
  sizeListEl.innerHTML = "";

  preview.style.display = "none";
  preview.src = "";

  if (previewContainer) {
    previewContainer.innerHTML = "";
  }

  downloadEl.classList.add("hidden");
  downloadEl.removeAttribute("href");
  downloadEl.removeAttribute("download");
};

/* ======= SYNC RANGE & NUMBER ======= */
range.addEventListener("input", () => {
  numberInput.value = range.value;
});

numberInput.addEventListener("input", () => {
  const v = parseFloat(numberInput.value);
  if (v >= 0.1 && v <= 1) range.value = v;
});

/* INIT */
setLanguage("id");
