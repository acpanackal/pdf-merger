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

const setStatus = (message) => {
  statusBox.textContent = message;
};

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
    setStatus('Ready to compress a single PDF file.');
  }
};

modeButtons.forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

mergeInput.addEventListener('change', () => {
  const files = Array.from(mergeInput.files || []);
  mergeFileCount.textContent = `${files.length} file(s) selected`;

  if (files.length > 0) {
    setStatus(`${files.length} PDF file(s) selected for merging.`);
  } else {
    setStatus('No PDF files selected.');
  }
});

reduceInput.addEventListener('change', () => {
  const file = reduceInput.files && reduceInput.files[0];

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
    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const fileBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBytes);
      const pageIndexes = pdf.getPageIndices();
      const copiedPages = await mergedPdf.copyPages(pdf, pageIndexes);
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    downloadBlob(new Blob([mergedBytes], { type: 'application/pdf' }), 'merged.pdf');
    setStatus('Merge complete. Download started.');
  } catch (error) {
    console.error(error);
    setStatus('Merge failed. Please make sure all selected files are valid PDFs.');
  }
});

reduceDownloadBtn.addEventListener('click', async () => {
  const file = reduceInput.files && reduceInput.files[0];

  if (!file) {
    setStatus('Please choose a PDF file to reduce.');
    return;
  }

  try {
    setStatus('Reducing PDF size...');
    const qualityLevel = qualitySelect.value;
    const qualityMap = { low: 0.5, medium: 0.7, high: 0.85 };
    const scale = qualityMap[qualityLevel] || 0.7;

    const pdfData = await file.arrayBuffer();
    const pdfjsLib = window.pdfjsLib;

    if (!pdfjsLib) {
      throw new Error('PDF.js failed to load.');
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.15.349/pdf.worker.min.js';
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const { PDFDocument } = PDFLib;
    const newPdf = await PDFDocument.create();

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext('2d');

      await page.render({ canvasContext: context, viewport }).promise;
      const jpegBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      });

      if (!jpegBlob) {
        throw new Error('Could not convert page to JPEG.');
      }

      const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
      const image = await newPdf.embedJpg(jpegBytes);
      const newPage = newPdf.addPage([viewport.width, viewport.height]);
      newPage.drawImage(image, {
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
    setStatus('Compression failed. Please try another PDF or a different compression setting.');
  }
});

setMode(currentMode);
