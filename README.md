# PDF Toolkit

A browser-based PDF utility for:
- merging multiple PDFs into one file
- reducing the size of a single PDF while preserving readability

## Run the app

Open `index.html` directly in a browser, or run a local static server:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Features

- Merge PDFs from the browser without uploading to a server
- Reduce PDF file size using a browser-based rasterization workflow
- Download the processed result immediately

## Notes

This app uses the browser's PDF libraries (`pdf-lib` and `pdf.js`) and does all processing locally in the client.
