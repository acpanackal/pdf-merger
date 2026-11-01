const modeButtons = document.querySelectorAll('.mode-btn');
const mergePanel = document.getElementById('merge-panel');
const reducePanel = document.getElementById('reduce-panel');
const statusBox = document.getElementById('status-box');

const mergeInput = document.getElementById('merge-input');
const mergeFileCount = document.getElementById('merge-file-count');
const mergeDownloadBtn = document.getElementById('merge-download');

const reduceInput = document.getElementById('reduce-input');
const reduceFileName = document.getElementById('reduce-file-name');
const reduceDownloadBtn = document.getElementById('reduce-download');
const qualitySelect = document.getElementById('quality');

let currentMode = 'merge';
let mergedPdfBytes = null;
let reducedPdfBytes = null;

const setStatus = (message) => {
  statusBox.textContent = message;
};

const setMode = (mode) => {
  currentMode = mode;
  modeButtons.forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
  });

  mergePanel.classList.toggle('active', mode === 'merge');
  reducePanel.classList.toggle('active', mode === 'reduce');

  if (mode === 'merge') {
    setStatus('Ready to merge multiple PDF files.');
  } else {
    setStatus('Ready to compress one PDF file.');
  }
};

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

mergeInput.addEventListener('change', () => {
  const files = Array.from(mergeInput.files || []);
  mergeFileCount.textContent = `${files.length} file(s) selected`;
  mergedPdfBytes = null;
  if (files.length > 0) {
    setStatus(`${files.length} PDF file(s) selected for merging.`);
  } else {
    setStatus('No PDF files selected.');
  }
});

reduceInput.addEventListener('change', () => {
  const file = reduceInput.files?.[0];
  reducedPdfBytes = null;
  if (file) {
    reduceFileName.textContent = file.name;
    setStatus(`Selected: ${file.name}`);
  } else {
    reduceFileName.textContent = 'No file selected';
    setStatus('No PDF file selected.');
  }
});

mergeDownloadBtn.addEventListener('click', async () => {
  const files = Array.from(mergeInput.files || []);
  if (!files.length) {
    setStatus('Please choose at least one PDF file to merge.');
    return;
  }

  try {
    setStatus('Merging PDFs...');
    const mergedPdf = await PDFLib.PDFDocument.create();

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(bytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), 'merged.pdf');
    setStatus('Merge complete. Download started.');
  } catch (error) {
    console.error(error);
    setStatus('Merge failed. Please check that all selected files are valid PDFs.');
  }
});

reduceDownloadBtn.addEventListener('click', async () => {
  const file = reduceInput.files?.[0];
  if (!file) {
    setStatus('Please choose a PDF file to reduce.');
    return;
  }

  try {
    setStatus('Reducing PDF size...');
    const qualityLevel = qualitySelect.value;
    const qualityMap = { low: 0.5, medium: 0.7, high: 0.85 };
    const scale = qualityMap[qualityLevel] ?? 0.7;

    const pdfData = await file.arrayBuffer();
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const newPdf = await PDFLib.PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const jpegBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.7));
      if (!jpegBlob) {
        throw new Error('Could not convert page to JPEG.');
      }
      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const embedded = await newPdf.embedJpg(jpegBytes);

      const pageInNewPdf = newPdf.addPage([viewport.width, viewport.height]);
      pageInNewPdf.drawImage(embedded, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    const reducedBytes = await newPdf.save();
    const outputName = file.name.replace(/\.pdf$/i, '') + '-reduced.pdf';
    downloadBlob(new Blob([reducedBytes], { type: 'application/pdf' }), outputName);
    setStatus('PDF size reduction complete. Download started.');
  } catch (error) {
    console.error(error);
    setStatus('Compression failed. Please try a different PDF or a different quality setting.');
  }
});

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

setMode(currentMode);
