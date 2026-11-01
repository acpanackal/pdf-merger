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
const mergeSelection = [];

const setStatus = (message) => {
  if (statusBox) {
    statusBox.textContent = message;
  }
};

const normalizeFiles = (files) => {
  const unique = [];
  const seen = new Set();

  files.forEach((file) => {
    const key = `${file.name}-${file.size}-${file.lastModified}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(file);
    }
  });

  return unique;
};

const updateMergeSelectionUI = () => {
  const count = mergeSelection.length;

  if (mergeFileCount) {
    mergeFileCount.textContent = `${count} file(s) selected`;
  }

  if (count > 0) {
    setStatus(`${count} PDF file(s) selected for merging.`);
  } else {
    setStatus('No PDF files selected.');
  }
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

  if (mergePanel) {
    mergePanel.classList.toggle('active', mode === 'merge');
  }

  if (reducePanel) {
    reducePanel.classList.toggle('active', mode === 'reduce');
  }

  if (mode === 'merge') {
    setStatus(
      mergeSelection.length
        ? `${mergeSelection.length} PDF file(s) selected for merging.`
        : 'Ready to merge multiple PDF files.'
    );
  } else {
    setStatus('Ready to compress a single PDF file.');
  }
};

if (mergeInput) {
  mergeInput.multiple = true;
  mergeInput.addEventListener('click', () => {
    mergeInput.value = '';
  });

  mergeInput.addEventListener('change', () => {
    const selectedFiles = normalizeFiles(Array.from(mergeInput.files || []));

    selectedFiles.forEach((file) => {
      const alreadyAdded = mergeSelection.some(
        (existing) =>
          existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified
      );

      if (!alreadyAdded) {
        mergeSelection.push(file);
      }
    });

    mergeInput.value = '';
    updateMergeSelectionUI();
  });
}

if (modeButtons.length) {
  modeButtons.forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });
}

if (reduceInput) {
  reduceInput.addEventListener('change', () => {
    const file = reduceInput.files && reduceInput.files[0];

    if (file) {
      if (reduceFileName) {
        reduceFileName.textContent = file.name;
      }
      setStatus(`Selected: ${file.name}`);
    } else {
      if (reduceFileName) {
        reduceFileName.textContent = 'No file selected';
      }
      setStatus('No PDF file selected.');
    }
  });
}

if (mergeDownloadBtn) {
  mergeDownloadBtn.addEventListener('click', async () => {
    const files = [...mergeSelection];

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
}

if (reduceDownloadBtn) {
  reduceDownloadBtn.addEventListener('click', async () => {
    const file = reduceInput?.files && reduceInput.files[0];

    if (!file) {
      setStatus('Please choose a PDF file to reduce.');
      return;
    }

    try {
      setStatus('Reducing PDF size...');
      const qualityLevel = qualitySelect?.value || 'medium';
      const qualityMap = {
        low: { scale: 1.1, jpeg: 0.72 },
        medium: { scale: 1.35, jpeg: 0.82 },
        high: { scale: 1.6, jpeg: 0.9 },
      };
      const renderConfig = qualityMap[qualityLevel] || qualityMap.medium;

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
        const viewport = page.getViewport({ scale: renderConfig.scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');

        await page.render({ canvasContext: context, viewport }).promise;
        const jpegBlob = await new Promise((resolve) => {
          canvas.toBlob(resolve, 'image/jpeg', renderConfig.jpeg);
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
}

setMode(currentMode);
