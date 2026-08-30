export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export const defaultLang = 'en' as const;

export type Lang = keyof typeof languages;

export const ui = {
  en: {
    'nav.home': 'Tools',
    'nav.about': 'About',
    'nav.github': 'GitHub',
    'nav.toggleTheme': 'Toggle theme',
    'nav.toggleLang': 'Switch language',
    'shell.local': '100% in your browser · no file uploads',

    'home.metaTitle': 'DevTools — Free online developer utilities',
    'home.metaDescription':
      'Free in-browser developer tools: Base64, image to Base64, QR reader & generator, JSON viewer, JSON to Excel, AES encrypt/decrypt, JWT decoder. No upload, no tracking.',
    'home.heroPre': 'Developer tools,',
    'home.heroAccent': 'in your browser',
    'home.heroDot': '.',
    'home.heroLead': 'A small set of fast, private utilities. Everything runs locally in your browser — your data never leaves the page.',

    'home.searchPlaceholder': 'Search a tool…  (e.g. json, qr, aes)',
    'home.filterAll': 'All',
    'home.toolsLabel': 'tools',
    'home.noResults': 'No tools match your search.',
    'home.recent': 'Recently used',
    'home.recentClear': 'Clear',
    'home.manifesto1': 'Runs 100% in your browser',
    'home.manifesto2': 'Zero uploads, zero tracking',
    'home.manifesto3': 'Open source, MIT licensed',
    'home.manifesto4': 'Bilingual (EN / ES)',

    'home.viewAll': 'Category page',
    'cat.backHome': 'All tools',
    'cat.otherCats': 'Other categories',
    'cat.toolCount': 'tools in this category',

    'seo.cat.encoding.title': 'Free Online Encoding Tools — Base64, JWT, Image to Base64 · No Upload',
    'seo.cat.encoding.description':
      'Encode and decode data in your browser: Base64 text, image to Base64 data URL, JWT decoder. Everything runs client-side, nothing is uploaded.',
    'seo.cat.encoding.keywords': 'encoding tools, base64 encoder, base64 decoder, jwt decoder, image to base64, online encoding tools free',
    'cat.encoding.intro':
      'Encoding tools turn data from one representation into another so it can travel safely through text-only channels. All of these run inside your browser tab — the text or image you paste never reaches a server.',

    'seo.cat.security.title': 'Free Online Security Tools — AES Encryption, Password Generator · No Upload',
    'seo.cat.security.description':
      'Encrypt and decrypt text with AES and generate strong random passwords, entirely in your browser. Keys and passphrases never leave your device.',
    'seo.cat.security.keywords':
      'security tools, aes encrypt online, aes decrypt, password generator, strong password, encryption tools free',
    'cat.security.intro':
      'These tools use the browser Web Crypto API, so your passphrase, plaintext and generated passwords stay on your machine. Nothing is transmitted, logged or stored.',

    'seo.cat.qr.title': 'Free Online QR Code Tools — Reader and Generator · No Upload',
    'seo.cat.qr.description':
      'Generate a QR code for any text or URL, and decode QR codes from an image, right in your browser. No upload, no watermark, no signup.',
    'seo.cat.qr.keywords': 'qr code tools, qr generator free, qr reader online, decode qr from image, qr code no upload',
    'cat.qr.intro':
      'Generate QR codes for links, Wi-Fi credentials or plain text, and read codes back from a screenshot or photo. The image is decoded in the page — it is never uploaded.',

    'seo.cat.data.title': 'Free Online Data Tools — JSON Viewer, JSON to Excel · No Upload',
    'seo.cat.data.description':
      'Validate, format and explore JSON as a collapsible tree, and export a JSON array to an .xlsx spreadsheet. Runs entirely in your browser.',
    'seo.cat.data.keywords': 'data tools, json viewer, json formatter, json validator, json to excel, json to xlsx free',
    'cat.data.intro':
      'Inspect and convert structured data without pasting it into a third-party server. Useful when the payload contains tokens, customer records or anything you would rather not upload.',

    'seo.cat.text.title': 'Free Online Text Tools — Compare Two Texts, Diff Checker · No Upload',
    'seo.cat.text.description':
      'Compare two texts and see every difference highlighted by line and by word, in your browser. Side-by-side or inline view. Nothing is uploaded.',
    'seo.cat.text.keywords': 'text tools, compare text online, diff checker free, difference between two texts, text comparison no upload',
    'cat.text.intro':
      'Plain-text utilities that work on whatever you paste — contracts, logs, code or translations. The comparison happens in the page, so confidential drafts stay private.',

    'seo.cat.pdf.title': 'Free Online PDF Tools — Merge, Split, Rotate, Compress · No Upload',
    'seo.cat.pdf.description':
      'Seven free PDF tools that run in your browser: merge, split, rotate, compress, add page numbers, images to PDF and PDF to images. No upload, no watermark, no signup.',
    'seo.cat.pdf.keywords':
      'pdf tools, merge pdf, split pdf, compress pdf, rotate pdf, pdf to images, add page numbers pdf, free pdf tools no upload',
    'cat.pdf.intro':
      'Every PDF tool here works with pdf-lib inside your browser tab. Contracts, invoices and scans are processed on your own machine — no upload, no queue, no watermark, and no file size limit beyond your available memory.',

    'seo.cat.image.title': 'Free Online Image Tools — Compress, Convert, Resize · No Upload',
    'seo.cat.image.description':
      'Compress, convert and resize images in your browser. JPG, PNG and WebP, batch processing and ZIP download. No upload, no watermark, private.',
    'seo.cat.image.keywords': 'image tools, compress image, convert image, resize image, jpg to webp, png to jpg, image tools no upload',
    'cat.image.intro':
      'Image processing runs on the HTML canvas in your browser, so photos and screenshots never leave your device. Batch several files at once and download them as a ZIP.',

    'home.cat.encoding.title': 'Encoding',
    'home.cat.encoding.body': 'Encode, decode and inspect text-based formats.',
    'home.cat.security.title': 'Security',
    'home.cat.security.body': 'Encrypt data and generate secure credentials.',
    'home.cat.qr.title': 'QR codes',
    'home.cat.qr.body': 'Generate and decode QR codes from text or images.',
    'home.cat.data.title': 'Data',
    'home.cat.data.body': 'Validate, format and convert structured data.',

    'home.cards.base64.title': 'Base64 — text',
    'home.cards.base64.body': 'Encode and decode UTF-8 text to and from Base64.',
    'home.cards.base64Image.title': 'Image ⇄ Base64',
    'home.cards.base64Image.body': 'Convert an image to a Base64 data URL and back.',
    'home.cards.qrRead.title': 'QR reader',
    'home.cards.qrRead.body': 'Decode a QR code from an uploaded image.',
    'home.cards.qrGen.title': 'QR generator',
    'home.cards.qrGen.body': 'Generate a QR code for any text or URL.',
    'home.cards.json.title': 'JSON viewer',
    'home.cards.json.body': 'Validate, format and explore JSON as a collapsible tree.',
    'home.cards.jsonExcel.title': 'JSON → Excel',
    'home.cards.jsonExcel.body': 'Convert a JSON array of objects into an .xlsx file.',
    'home.cards.aes.title': 'AES encrypt / decrypt',
    'home.cards.aes.body': 'Encrypt or decrypt text with AES and a passphrase.',
    'home.cards.jwt.title': 'JWT decoder',
    'home.cards.jwt.body': 'Inspect a JWT — header, payload and expiration — without verifying.',
    'home.cards.password.title': 'Password generator',
    'home.cards.password.body': 'Generate strong random passwords with custom length and character sets.',

    'footer.tagline': 'DevTools · Private, in-browser developer utilities',
    'footer.privacy': 'Everything runs locally in your browser.',
    'footer.byAuthor': 'by',

    'about.metaTitle': 'About DevTools — Free, In-Browser Developer Utilities',
    'about.metaDescription':
      'About DevTools: a free collection of in-browser developer utilities (Base64, JSON, JWT, AES, QR). 100% client-side, private, no upload, no tracking.',
    'about.metaKeywords': 'about devtools, free developer tools, browser developer utilities, no upload tools, privacy tools',
    'about.title': 'About DevTools',
    'about.body1':
      'DevTools is a small set of free developer utilities that run entirely in your browser. Base64, JSON viewer, JSON to Excel, QR reader and generator, AES encrypt/decrypt, JWT decoder — all without uploading anything.',
    'about.body2':
      'Everything is client-side. Your input never leaves the page, so you can paste tokens, JSON payloads or images without worrying about leaks or third-party trackers.',
    'about.authorTitle': 'About the author',
    'about.authorBody':
      'Built and maintained by Ismael Hurtado Vargas, a Full-Stack developer based in Lima, Peru. Focused on web, mobile and AI automation since 2014.',
    'about.viewSource': 'View source on GitHub',
    'about.visitPortfolio': 'Visit portfolio',
    'about.madeBy': 'Made by',

    // Captcha gate
    'gate.title': 'Quick check',
    'gate.body': 'Solve the captcha once to unlock all tools for this session. Helps keep the site free of automated abuse.',
    'gate.unlocking': 'Unlocking…',
    'gate.unlocked': 'Unlocked. Reloading…',
    'gate.failed': 'Captcha failed. Try again.',
    'gate.retry': 'Retry',

    // Generic UI
    'ui.input': 'Input',
    'ui.output': 'Output',
    'ui.copy': 'Copy',
    'ui.copied': 'Copied!',
    'ui.copyFailed': 'Could not copy',
    'ui.clear': 'Clear',
    'ui.paste': 'Paste',
    'ui.download': 'Download',
    'ui.upload': 'Upload',
    'ui.dragDrop': 'Drag & drop a file or click to choose',
    'ui.run': 'Run',
    'ui.invalid': 'Invalid input',
    'ui.empty': 'No input yet',
    'ui.bytes': 'bytes',

    // Base64 text
    't.b64.title': 'Base64 — text',
    't.b64.lead': 'Encode UTF-8 text to Base64 or decode it back. Runs locally.',
    't.b64.encode': 'Encode',
    't.b64.decode': 'Decode',
    't.b64.placeholderEnc': 'Type or paste text…',
    't.b64.placeholderDec': 'Paste Base64…',

    // Base64 image
    't.b64img.title': 'Image ⇄ Base64',
    't.b64img.lead': 'Convert an image to a Base64 data URL or paste a data URL to preview it.',
    't.b64img.toB64': 'Image → Base64',
    't.b64img.toImg': 'Base64 → Image',
    't.b64img.dropImage': 'Drop an image here or click to choose',
    't.b64img.dataUrlPlaceholder': 'data:image/png;base64,…',
    't.b64img.preview': 'Preview',
    't.b64img.size': 'Size',

    // QR reader
    't.qrRead.title': 'QR reader',
    't.qrRead.lead': 'Decode a QR code from an image. The image never leaves your device.',
    't.qrRead.drop': 'Drop a QR image here or click to choose',
    't.qrRead.notFound': 'No QR code found in the image.',
    't.qrRead.result': 'Decoded value',
    't.qrRead.pasteHint': 'or paste an image — Ctrl / Cmd + V',
    't.qrRead.pasteEmpty': 'No image found in the clipboard.',
    't.qrRead.pasteError': 'Could not read the clipboard. Check browser permissions.',
    't.qrRead.history': 'History',
    't.qrRead.historyEmpty': 'Nothing decoded yet.',
    't.qrRead.clearHistory': 'Clear',
    't.qrRead.remove': 'Remove',
    't.qrRead.open': 'Open link',
    't.qrRead.namePlaceholder': 'Name this code…',
    't.qrRead.rename': 'Rename',
    't.qrRead.untitled': 'Untitled',

    // QR generator
    't.qrGen.title': 'QR generator',
    't.qrGen.lead': 'Generate a QR code for any text or URL.',
    't.qrGen.placeholder': 'https://example.com or any text',
    't.qrGen.size': 'Size (px)',
    't.qrGen.ec': 'Error correction',
    't.qrGen.downloadPng': 'Download PNG',

    // JSON
    't.json.title': 'JSON viewer',
    't.json.lead': 'Format, validate and explore JSON. Collapsible tree, no upload.',
    't.json.placeholder': 'Paste JSON here…',
    't.json.format': 'Format',
    't.json.minify': 'Minify',
    't.json.tree': 'Tree',
    't.json.raw': 'Raw',

    // JSON → Excel
    't.j2x.title': 'JSON → Excel',
    't.j2x.lead': 'Paste a JSON array of objects and download it as .xlsx (or .csv).',
    't.j2x.placeholder': '[{"name":"Ada","age":36}, …]',
    't.j2x.sheetName': 'Sheet name',
    't.j2x.dlXlsx': 'Download .xlsx',
    't.j2x.dlCsv': 'Download .csv',
    't.j2x.notArray': 'JSON must be an array of objects.',
    't.j2x.rows': 'rows',
    't.j2x.cols': 'columns',

    // AES
    't.aes.title': 'AES encrypt / decrypt',
    't.aes.lead': 'AES-256 with a passphrase (CryptoJS, OpenSSL-compatible). Runs locally.',
    't.aes.passphrase': 'Passphrase',
    't.aes.passphrasePh': 'Your secret key…',
    't.aes.plaintext': 'Plaintext',
    't.aes.ciphertext': 'Ciphertext',
    't.aes.encrypt': 'Encrypt',
    't.aes.decrypt': 'Decrypt',
    't.aes.errDecrypt': 'Could not decrypt. Wrong passphrase or corrupted ciphertext.',

    // Password generator
    't.pwd.title': 'Password generator',
    't.pwd.lead': 'Generate cryptographically strong random passwords. Runs locally — never leaves your browser.',
    't.pwd.intro': 'Use our online password generator to instantly create a secure, random password.',
    't.pwd.length': 'Length',
    't.pwd.upper': 'Uppercase',
    't.pwd.lower': 'Lowercase',
    't.pwd.numbers': 'Numbers',
    't.pwd.symbols': 'Symbols',
    't.pwd.regenerate': 'Regenerate',
    't.pwd.copy': 'Copy password',
    't.pwd.charsUsed': 'Characters used',
    't.pwd.errNoChars': 'Select at least one character set.',
    't.pwd.strength.veryWeak': 'Very weak',
    't.pwd.strength.weak': 'Weak',
    't.pwd.strength.fair': 'Fair',
    't.pwd.strength.strong': 'Strong',
    't.pwd.strength.veryStrong': 'Very strong',

    // JWT
    't.jwt.title': 'JWT decoder',
    't.jwt.lead': 'Decode a JWT and inspect its header, payload and expiration. Signature is NOT verified.',
    't.jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs…',
    't.jwt.header': 'Header',
    't.jwt.payload': 'Payload',
    't.jwt.signature': 'Signature',
    't.jwt.expIn': 'Expires in',
    't.jwt.expAt': 'Expires at',
    't.jwt.expired': 'Expired',
    't.jwt.invalid': 'Not a valid JWT (expected three Base64URL parts).',

    // SEO — per-tool meta. Keep titles ≤60 chars, descriptions ≤160 chars.
    'seo.b64.title': 'Base64 Encoder & Decoder Online — Free, In-Browser · DevTools',
    'seo.b64.description':
      'Free online Base64 encoder and decoder. Convert UTF-8 text to Base64 or decode Base64 back to text instantly in your browser. No upload, no tracking.',
    'seo.b64.keywords': 'base64 encoder, base64 decoder, base64 online, base64 to text, text to base64, encode base64, decode base64',

    'seo.b64img.title': 'Image to Base64 Converter — Free Online Tool · DevTools',
    'seo.b64img.description':
      'Convert any image to a Base64 data URL — or paste a data URL to preview the image. PNG, JPG, SVG, WebP. Runs in your browser, no upload.',
    'seo.b64img.keywords':
      'image to base64, base64 image converter, convert png to base64, jpg to base64, data url generator, image encoder',

    'seo.qrRead.title': 'QR Code Reader Online — Decode QR from Image · DevTools',
    'seo.qrRead.description':
      'Read and decode QR codes from any image (PNG, JPG, SVG). 100% in-browser — your image never leaves your device. Free, no signup, no ads.',
    'seo.qrRead.keywords': 'qr code reader, qr scanner online, decode qr from image, scan qr code, qr code decoder, read qr',

    'seo.qrGen.title': 'QR Code Generator — Free, Custom Size · DevTools',
    'seo.qrGen.description':
      'Generate free QR codes for any URL or text. Custom size and error correction level. Download as PNG instantly. No watermark, no signup.',
    'seo.qrGen.keywords': 'qr code generator, free qr generator, create qr code, qr maker, generate qr png, qr code online',

    'seo.json.title': 'JSON Viewer, Formatter & Validator — Free Online · DevTools',
    'seo.json.description':
      'Format, minify, validate and explore JSON as a collapsible tree. Pretty-print and inspect nested objects in your browser — no upload, no limits.',
    'seo.json.keywords': 'json viewer, json formatter, json validator, json pretty print, json parser, json beautifier, json tree',

    'seo.j2x.title': 'JSON to Excel & CSV Converter — Free Online · DevTools',
    'seo.j2x.description':
      'Convert any JSON array of objects to Excel (.xlsx) or CSV in one click. Preview rows and columns before download. Free, in-browser, no upload.',
    'seo.j2x.keywords': 'json to excel, json to xlsx, json to csv, convert json spreadsheet, json export excel, json table converter',

    'seo.aes.title': 'AES Encrypt & Decrypt Online — Free, Browser-Only · DevTools',
    'seo.aes.description':
      'Encrypt or decrypt text with AES-256 and a passphrase (CryptoJS, OpenSSL-compatible). 100% client-side — your text and key never leave the browser.',
    'seo.aes.keywords':
      'aes encrypt online, aes decrypt online, encrypt text password, aes-256 online, cryptojs, openssl aes, encrypt decrypt tool',

    'seo.jwt.title': 'JWT Decoder Online — Inspect Header, Payload, Expiry · DevTools',
    'seo.jwt.description':
      'Decode any JWT (JSON Web Token) and inspect header, payload and expiration date. Runs entirely in your browser. Signature is not verified.',
    'seo.jwt.keywords': 'jwt decoder, decode jwt online, jwt parser, jwt inspector, json web token decoder, jwt debugger',

    'seo.pwd.title': 'Password Generator Online — Strong, Random, Free · DevTools',
    'seo.pwd.description':
      'Generate strong random passwords with custom length (4–128) and character sets (uppercase, lowercase, numbers, symbols). 100% in-browser, no logs.',
    'seo.pwd.keywords':
      'password generator, random password, strong password, secure password generator, free password generator online, create password',

    'home.cat.pdf.title': 'PDF',
    'home.cat.pdf.body': 'Merge, split and organize PDF files — all in your browser.',

    'home.cards.pdfMerge.title': 'Merge PDF',
    'home.cards.pdfMerge.body': 'Combine multiple PDFs into one file, in any order.',
    'home.cards.pdfSplit.title': 'Split PDF',
    'home.cards.pdfSplit.body': 'Extract a range of pages from a PDF into a new file.',

    't.pdfMerge.title': 'Merge PDF',
    't.pdfMerge.lead': 'Combine multiple PDF files into one. Reorder before merging. Your files never leave your device.',
    't.pdfMerge.drop': 'Add PDF files or click to choose',
    't.pdfMerge.add': 'Add more',
    't.pdfMerge.merge': 'Merge & download',
    't.pdfMerge.working': 'Merging…',
    't.pdfMerge.need2': 'Add at least 2 PDF files to merge.',
    't.pdfMerge.pages': 'pages',
    't.pdfMerge.up': 'Move up',
    't.pdfMerge.down': 'Move down',
    't.pdfMerge.remove': 'Remove',
    't.pdfMerge.rotate': 'Rotate',
    't.pdfMerge.addMore': 'Add more',
    't.pdfMerge.dragHint': 'Drag to reorder',
    't.pdfMerge.error': 'Could not read a PDF (it may be encrypted or corrupt).',

    't.pdfSplit.title': 'Split PDF',
    't.pdfSplit.lead': 'Extract a range of pages from a PDF into a new file. 100% in your browser.',
    't.pdfSplit.drop': 'Drop a PDF here or click to choose',
    't.pdfSplit.total': 'total pages',
    't.pdfSplit.from': 'From page',
    't.pdfSplit.to': 'To page',
    't.pdfSplit.extract': 'Extract & download',
    't.pdfSplit.working': 'Extracting…',
    't.pdfSplit.invalid': 'Enter a valid page range.',
    't.pdfSplit.error': 'Could not read this PDF (it may be encrypted or corrupt).',
    't.pdfSplit.rendering': 'Rendering preview…',

    'seo.pdfMerge.title': 'Merge PDF Online — Free, Private, No Upload · DevTools',
    'seo.pdfMerge.description':
      'Combine multiple PDF files into one, right in your browser. Reorder pages, no upload, no watermark, 100% private.',
    'seo.pdfMerge.keywords': 'merge pdf, combine pdf, join pdf online, pdf merger free, merge pdf in browser, no upload pdf',
    'seo.pdfSplit.title': 'Split PDF Online — Extract Pages Free, No Upload · DevTools',
    'seo.pdfSplit.description':
      'Extract a range of pages from a PDF into a new file, entirely in your browser. No upload, no watermark, private.',
    'seo.pdfSplit.keywords': 'split pdf, extract pdf pages, separate pdf, pdf splitter free, split pdf in browser, no upload pdf',

    'home.cards.imagesToPdf.title': 'Images → PDF',
    'home.cards.imagesToPdf.body': 'Turn JPG/PNG images into a single PDF, one per page.',
    'home.cards.pdfRotate.title': 'Rotate PDF',
    'home.cards.pdfRotate.body': 'Rotate all pages of a PDF 90, 180 or 270 degrees.',

    't.imagesToPdf.title': 'Images → PDF',
    't.imagesToPdf.lead':
      'Combine JPG and PNG images into a single PDF, one image per page. Reorder before exporting. Nothing is uploaded.',
    't.imagesToPdf.drop': 'Add images or click to choose',
    't.imagesToPdf.create': 'Create PDF & download',
    't.imagesToPdf.working': 'Building…',
    't.imagesToPdf.need1': 'Add at least 1 image.',
    't.imagesToPdf.up': 'Move up',
    't.imagesToPdf.down': 'Move down',
    't.imagesToPdf.remove': 'Remove',
    't.imagesToPdf.rotate': 'Rotate',
    't.imagesToPdf.addMore': 'Add more',
    't.imagesToPdf.dragHint': 'Drag to reorder',
    't.imagesToPdf.error': 'Could not process an image.',

    't.pdfRotate.title': 'Rotate PDF',
    't.pdfRotate.lead': 'Rotate every page of a PDF. 100% in your browser.',
    't.pdfRotate.drop': 'Drop a PDF here or click to choose',
    't.pdfRotate.total': 'total pages',
    't.pdfRotate.direction': 'Rotation',
    't.pdfRotate.apply': 'Rotate & download',
    't.pdfRotate.working': 'Rotating…',
    't.pdfRotate.error': 'Could not read this PDF (it may be encrypted or corrupt).',
    't.pdfRotate.rendering': 'Rendering preview…',

    'seo.imagesToPdf.title': 'JPG to PDF Online — Free, No Upload · DevTools',
    'seo.imagesToPdf.description':
      'Convert JPG and PNG images into a single PDF, right in your browser. Reorder pages, no upload, no watermark, private.',
    'seo.imagesToPdf.keywords': 'jpg to pdf, png to pdf, images to pdf, image to pdf converter free, jpg to pdf no upload',
    'seo.pdfRotate.title': 'Rotate PDF Online — Free, No Upload · DevTools',
    'seo.pdfRotate.description':
      'Rotate the pages of a PDF 90, 180 or 270 degrees, entirely in your browser. No upload, no watermark, private.',
    'seo.pdfRotate.keywords': 'rotate pdf, turn pdf pages, rotate pdf online free, rotate pdf no upload',

    'home.cards.pdfToImages.title': 'PDF → images',
    'home.cards.pdfToImages.body': 'Export each PDF page as a PNG or JPG image.',

    't.pdfToImages.title': 'PDF → images',
    't.pdfToImages.lead': 'Turn each page of a PDF into a PNG or JPG image. Download one page or all as a ZIP. Nothing is uploaded.',
    't.pdfToImages.drop': 'Drop a PDF here or click to choose',
    't.pdfToImages.total': 'total pages',
    't.pdfToImages.format': 'Format',
    't.pdfToImages.rendering': 'Rendering pages…',
    't.pdfToImages.downloadAll': 'Download all (ZIP)',
    't.pdfToImages.downloadPage': 'Download',
    't.pdfToImages.working': 'Working…',
    't.pdfToImages.page': 'Page',
    't.pdfToImages.error': 'Could not read this PDF (it may be encrypted or corrupt).',

    'seo.pdfToImages.title': 'PDF to JPG / PNG Online — Free, No Upload · DevTools',
    'seo.pdfToImages.description':
      'Convert each page of a PDF into a PNG or JPG image, entirely in your browser. Download one page or all as a ZIP. No upload, no watermark.',
    'seo.pdfToImages.keywords': 'pdf to jpg, pdf to png, pdf to image, convert pdf to images free, pdf to jpg no upload',

    'home.cat.image.title': 'Image',
    'home.cat.image.body': 'Compress, convert and resize images — all in your browser.',

    'home.cards.imageCompress.title': 'Compress image',
    'home.cards.imageCompress.body': 'Shrink JPG/PNG/WebP file size with a quality slider.',
    'home.cards.pdfCompress.title': 'Compress PDF',
    'home.cards.pdfCompress.body': 'Reduce PDF file size by re-encoding its pages.',

    't.imageCompress.title': 'Compress image',
    't.imageCompress.lead':
      'Reduce the file size of an image with a quality slider. Convert to JPG or WebP for the smallest result. Nothing is uploaded.',
    't.imageCompress.drop': 'Drop an image here or click to choose',
    't.imageCompress.quality': 'Quality',
    't.imageCompress.maxWidth': 'Max width (px, 0 = original)',
    't.imageCompress.format': 'Format',
    't.imageCompress.original': 'Original',
    't.imageCompress.compressed': 'Compressed',
    't.imageCompress.saved': 'saved',
    't.imageCompress.bigger': 'bigger',
    't.imageCompress.download': 'Download',
    't.imageCompress.working': 'Compressing…',
    't.imageCompress.error': 'Could not process this image.',

    't.pdfCompress.title': 'Compress PDF',
    't.pdfCompress.lead':
      'Reduce a PDF file size by re-encoding its pages as compressed images. Best for scanned or image-heavy PDFs. Nothing is uploaded.',
    't.pdfCompress.drop': 'Drop a PDF here or click to choose',
    't.pdfCompress.total': 'total pages',
    't.pdfCompress.quality': 'Quality',
    't.pdfCompress.resolution': 'Resolution',
    't.pdfCompress.resLow': 'Low',
    't.pdfCompress.resMed': 'Medium',
    't.pdfCompress.resHigh': 'High',
    't.pdfCompress.compress': 'Compress & download',
    't.pdfCompress.working': 'Compressing…',
    't.pdfCompress.original': 'Original',
    't.pdfCompress.result': 'Result',
    't.pdfCompress.saved': 'saved',
    't.pdfCompress.note': 'Text and vectors are rasterized — best for scanned PDFs, not text documents.',
    't.pdfCompress.bigger': 'Result is larger than the original — this PDF is likely text-based. Compression skipped.',
    't.pdfCompress.error': 'Could not read this PDF (it may be encrypted or corrupt).',

    'seo.imageCompress.title': 'Compress Image Online — JPG / PNG / WebP, Free, No Upload · DevTools',
    'seo.imageCompress.description':
      'Reduce image file size in your browser with a quality slider and optional resize. Convert to JPG or WebP. No upload, no watermark, private.',
    'seo.imageCompress.keywords':
      'compress image, reduce image size, image compressor free, compress jpg, compress png, webp converter, no upload',
    'seo.pdfCompress.title': 'Compress PDF Online — Reduce PDF Size Free, No Upload · DevTools',
    'seo.pdfCompress.description':
      'Reduce PDF file size in your browser by re-encoding pages as compressed images. Best for scanned PDFs. No upload, no watermark, private.',
    'seo.pdfCompress.keywords': 'compress pdf, reduce pdf size, pdf compressor free, shrink pdf, compress pdf no upload, make pdf smaller',

    'home.cards.imageConvert.title': 'Convert image',
    'home.cards.imageConvert.body': 'Convert images between PNG, JPG and WebP. Batch + ZIP.',
    'home.cards.imageResize.title': 'Resize image',
    'home.cards.imageResize.body': 'Resize by pixels or percentage, keep aspect ratio.',
    'home.cards.imageRedact.title': 'Redact image',
    'home.cards.imageRedact.body': 'Cover sensitive data with boxes, pixelation or blur, and write on top.',

    't.imageConvert.title': 'Convert image',
    't.imageConvert.lead': 'Convert one or many images between PNG, JPG and WebP. Download each or all as a ZIP. Nothing is uploaded.',
    't.imageConvert.drop': 'Add images or click to choose',
    't.imageConvert.addMore': 'Add more',
    't.imageConvert.to': 'Convert to',
    't.imageConvert.quality': 'Quality',
    't.imageConvert.downloadAll': 'Download all (ZIP)',
    't.imageConvert.download': 'Download',
    't.imageConvert.remove': 'Remove',
    't.imageConvert.working': 'Converting…',
    't.imageConvert.error': 'Could not process an image.',

    't.imageResize.title': 'Resize image',
    't.imageResize.lead': 'Resize an image by pixels or percentage, keeping aspect ratio. Nothing is uploaded.',
    't.imageResize.drop': 'Drop an image here or click to choose',
    't.imageResize.width': 'Width (px)',
    't.imageResize.height': 'Height (px)',
    't.imageResize.lock': 'Lock aspect ratio',
    't.imageResize.percent': 'Scale',
    't.imageResize.format': 'Format',
    't.imageResize.original': 'Original',
    't.imageResize.result': 'Result',
    't.imageResize.download': 'Download',
    't.imageResize.working': 'Resizing…',
    't.imageResize.error': 'Could not process this image.',
    't.imageRedact.title': 'Redact & annotate image',
    't.imageRedact.lead': 'Hide sensitive data behind a box, pixelation or blur, and write notes on top. The export is flattened and nothing is uploaded.',
    't.imageRedact.drop': 'Drop an image, paste a screenshot, or click to choose',
    't.imageRedact.tool.box': 'Box',
    't.imageRedact.tool.pixelate': 'Pixelate',
    't.imageRedact.tool.blur': 'Blur',
    't.imageRedact.tool.text': 'Text',
    't.imageRedact.tool.ellipse': 'Ellipse',
    't.imageRedact.tool.polygon': 'Polygon',
    't.imageRedact.tool.arrow': 'Arrow',
    't.imageRedact.style': 'Style',
    't.imageRedact.filled': 'Filled',
    't.imageRedact.outline': 'Outline',
    't.imageRedact.stroke': 'Line width',
    't.imageRedact.hintPolygon': 'Click to add corners. Close it by clicking the first point or pressing Enter.',
    't.imageRedact.hintArrow': 'Drag from the tail to the tip of the arrow.',
    't.imageRedact.copy': 'Copy image',
    't.imageRedact.copied': 'Copied',
    't.imageRedact.copyFail': 'Copy failed',
    't.imageRedact.shortcuts': 'Shortcuts: Ctrl/⌘+Z undo · Ctrl/⌘+Shift+Z redo · Esc cancel · Ctrl/⌘+V paste a screenshot',
    't.imageRedact.hintDrag': 'Drag over the area you want to cover.',
    't.imageRedact.hintText': 'Click on the image and type right there. Enter to place it.',
    't.imageRedact.color': 'Color',
    't.imageRedact.blockSize': 'Block size',
    't.imageRedact.radius': 'Blur radius',
    't.imageRedact.text': 'Text',
    't.imageRedact.textPlaceholder': 'e.g. CONFIDENTIAL',
    't.imageRedact.textBadge': 'Type here · Enter to place · Esc to cancel',
    't.imageRedact.fontSize': 'Font size',
    't.imageRedact.undo': 'Undo',
    't.imageRedact.redo': 'Redo',
    't.imageRedact.reset': 'Clear edits',
    't.imageRedact.download': 'Download',
    't.imageRedact.safety':
      'The exported file is flattened: covered pixels are gone, not hidden under a layer. A solid box is the only edit that cannot be reversed — pixelation and blur can sometimes be partly recovered from text.',
    't.imageRedact.history': 'Saved on this device',
    't.imageRedact.historyEmpty': 'Your edits are saved here automatically so you can pick them up later.',
    't.imageRedact.restore': 'Open',
    't.imageRedact.delete': 'Delete',
    't.imageRedact.clearAll': 'Delete all',
    't.imageRedact.storageNote':
      'Only the redacted result is stored — the untouched original never leaves memory, so a covered password cannot be recovered from here. Reopening one continues on top of the redacted image, so earlier redactions stay permanent. Everything stays in this browser and is never uploaded.',
    't.imageRedact.error': 'Could not open this image.',

    'seo.imageConvert.title': 'Convert Image Online — PNG / JPG / WebP, Free, No Upload · DevTools',
    'seo.imageConvert.description':
      'Convert images between PNG, JPG and WebP in your browser. Batch convert and download as a ZIP. No upload, no watermark, private.',
    'seo.imageConvert.keywords':
      'convert image, png to jpg, jpg to png, webp converter, image format converter free, png to webp, no upload',
    'seo.imageResize.title': 'Resize Image Online — By Pixels or Percent, Free, No Upload · DevTools',
    'seo.imageResize.description':
      'Resize images by exact pixels or percentage in your browser, keeping aspect ratio. Export to PNG, JPG or WebP. No upload, no watermark.',
    'seo.imageResize.keywords': 'resize image, image resizer free, scale image, resize jpg png, change image dimensions, no upload',
    'seo.imageRedact.title': 'Redact Image Online — Hide Data with a Box, Pixelate or Blur, Free, No Upload · DevTools',
    'seo.imageRedact.description':
      'Redact sensitive data in a photo or screenshot: cover it with a box, pixelate or blur it, and add text on top. Runs in your browser — no upload, no watermark.',
    'seo.imageRedact.keywords':
      'redact image, hide data in image, censor photo, pixelate image, blur part of image, black out text in screenshot, annotate image, no upload',

    'home.cards.pdfPageNumbers.title': 'Number pages',
    'home.cards.pdfPageNumbers.body': 'Add page numbers to a PDF — choose the position.',

    't.pdfPageNumbers.title': 'Number pages',
    't.pdfPageNumbers.lead': 'Add page numbers to a PDF and choose where they go. 100% in your browser.',
    't.pdfPageNumbers.drop': 'Drop a PDF here or click to choose',
    't.pdfPageNumbers.total': 'total pages',
    't.pdfPageNumbers.position': 'Position',
    't.pdfPageNumbers.format': 'Format',
    't.pdfPageNumbers.start': 'Start at',
    't.pdfPageNumbers.size': 'Font size',
    't.pdfPageNumbers.rendering': 'Rendering preview…',
    't.pdfPageNumbers.apply': 'Add numbers & download',
    't.pdfPageNumbers.working': 'Adding…',
    't.pdfPageNumbers.error': 'Could not read this PDF (it may be encrypted or corrupt).',

    'seo.pdfPageNumbers.title': 'Add Page Numbers to PDF Online — Free, No Upload · DevTools',
    'seo.pdfPageNumbers.description':
      'Add page numbers to a PDF in your browser and choose the position (top or bottom, left, center or right). No upload, no watermark, private.',
    'seo.pdfPageNumbers.keywords':
      'add page numbers to pdf, number pdf pages, pdf pagination, paginate pdf free, page numbers pdf no upload',

    'home.cards.pdfImage.title': 'Insert image',
    'home.cards.pdfImage.body': 'Place any image on a PDF — move, resize, rotate and crop it.',

    't.pdfImage.title': 'Insert an image into a PDF',
    't.pdfImage.lead':
      'Add any image — a signature, logo, stamp or photo — and drag it anywhere on the document, across pages. Resize, rotate and crop it, then download. 100% in your browser.',
    't.pdfImage.dropPdf': 'Drop a PDF here or click to choose',
    't.pdfImage.total': 'pages',
    't.pdfImage.rendering': 'Rendering pages…',
    't.pdfImage.addImage': 'Add image',
    't.pdfImage.replaceImage': 'Change image',
    't.pdfImage.image': 'Image',
    't.pdfImage.placeAnother': 'Place another',
    't.pdfImage.placed': 'placed',
    't.pdfImage.crop': 'Crop image',
    't.pdfImage.autoTrim': 'Auto-trim margins',
    't.pdfImage.cropReset': 'Whole image',
    't.pdfImage.cropApply': 'Apply crop',
    't.pdfImage.cropCancel': 'Cancel',
    't.pdfImage.cropHint':
      'Drag inside the box to move it, or its corners to resize. Auto-trim removes the blank margin around the image — handy for a scanned signature or logo.',
    't.pdfImage.trimEmpty': 'Nothing to trim: the image looks blank.',
    't.pdfImage.capped': 'showing first',
    't.pdfImage.dragAcross': 'Click a page to place it there · drag to move · corner to resize · top handle to rotate (hold Shift to snap)',
    't.pdfImage.page': 'Page',
    't.pdfImage.size': 'Size',
    't.pdfImage.rotation': 'Rotation',
    't.pdfImage.reset': 'Reset',
    't.pdfImage.opacity': 'Opacity',
    't.pdfImage.remove': 'Remove',
    't.pdfImage.apply': 'Download PDF with the image',
    't.pdfImage.working': 'Preparing…',
    't.pdfImage.needImage': 'Add an image and place it on the document first.',
    't.pdfImage.imageError': 'Could not load this image.',
    't.pdfImage.error': 'Could not read this PDF (it may be encrypted or corrupt).',

    'seo.pdfImage.title': 'Insert an Image into a PDF Online — Free, No Upload · DevTools',
    'seo.pdfImage.description':
      'Add any image to a PDF — a signature, logo, stamp or photo — and drag it anywhere across the pages. Resize, rotate, crop and download. In your browser, no upload, no watermark.',
    'seo.pdfImage.keywords':
      'insert image into pdf, add image to pdf, place picture in pdf, add logo to pdf, sign pdf online, add signature to pdf, pdf image no upload',

    'home.cat.text.title': 'Text',
    'home.cat.text.body': 'Compare and inspect plain text — all in your browser.',
    'home.cards.textDiff.title': 'Compare text',
    'home.cards.textDiff.body': 'Diff two texts with colored line and word highlighting.',

    't.textDiff.title': 'Compare text',
    't.textDiff.lead': 'Paste two texts and see every difference highlighted line by line and word by word. Nothing is uploaded.',
    't.textDiff.original': 'Original',
    't.textDiff.changed': 'Changed',
    't.textDiff.placeholderA': 'Paste the original text…',
    't.textDiff.placeholderB': 'Paste the modified text…',
    't.textDiff.lines': 'lines',
    't.textDiff.viewSplit': 'Side by side',
    't.textDiff.viewUnified': 'Inline',
    't.textDiff.swap': 'Swap',
    't.textDiff.ignoreCase': 'Ignore case',
    't.textDiff.ignoreWhitespace': 'Ignore whitespace',
    't.textDiff.onlyDiff': 'Only differences',
    't.textDiff.added': 'added',
    't.textDiff.removed': 'removed',
    't.textDiff.modified': 'modified',
    't.textDiff.same': 'unchanged',
    't.textDiff.unchangedLine': 'unchanged line',
    't.textDiff.unchangedLines': 'unchanged lines',
    't.textDiff.identical': 'Both texts are identical.',
    't.textDiff.empty': 'Paste text on both sides to see the differences.',
    't.textDiff.tooLarge': 'Very large input — lines compared position by position.',

    'seo.textDiff.title': 'Compare Two Texts Online — Free Diff Checker, No Upload · DevTools',
    'seo.textDiff.description':
      'Compare two texts in your browser and see the differences highlighted by line and by word. Side-by-side or inline view, ignore case or whitespace. No upload, private.',
    'seo.textDiff.keywords':
      'compare text, diff checker, text diff online, compare two texts, difference between texts, diff tool free, no upload',
  },
  es: {
    'nav.home': 'Herramientas',
    'nav.about': 'Acerca',
    'nav.github': 'GitHub',
    'nav.toggleTheme': 'Cambiar tema',
    'nav.toggleLang': 'Cambiar idioma',
    'shell.local': '100% en tu navegador · sin subir archivos',

    'home.metaTitle': 'DevTools — Utilidades de desarrollo gratis en tu navegador',
    'home.metaDescription':
      'Utilidades para desarrolladores: Base64, imagen a Base64, lector y generador de QR, visor JSON, JSON a Excel, AES, decodificador JWT. Todo en tu navegador, sin rastreo.',
    'home.heroPre': 'Herramientas de desarrollo,',
    'home.heroAccent': 'en tu navegador',
    'home.heroDot': '.',
    'home.heroLead': 'Un set pequeño de utilidades rápidas y privadas. Todo se ejecuta localmente — tus datos nunca salen de la página.',

    'home.searchPlaceholder': 'Buscar herramienta…  (ej. json, qr, aes)',
    'home.filterAll': 'Todas',
    'home.toolsLabel': 'tools',
    'home.noResults': 'Ninguna herramienta coincide con tu búsqueda.',
    'home.recent': 'Usadas recientemente',
    'home.recentClear': 'Limpiar',
    'home.manifesto1': 'Corre 100% en tu navegador',
    'home.manifesto2': 'Cero subidas, cero rastreo',
    'home.manifesto3': 'Código abierto, licencia MIT',
    'home.manifesto4': 'Bilingüe (EN / ES)',

    'home.viewAll': 'Ver categoría',
    'cat.backHome': 'Todas las herramientas',
    'cat.otherCats': 'Otras categorías',
    'cat.toolCount': 'herramientas en esta categoría',

    'seo.cat.encoding.title': 'Herramientas de Codificación Online Gratis — Base64, JWT · Sin Subir Nada',
    'seo.cat.encoding.description':
      'Codifica y decodifica datos en tu navegador: texto Base64, imagen a data URL Base64, decodificador JWT. Todo corre del lado del cliente, no se sube nada.',
    'seo.cat.encoding.keywords':
      'herramientas codificación, codificar base64, decodificar base64, decodificador jwt, imagen a base64, sin subir',
    'cat.encoding.intro':
      'Las herramientas de codificación convierten datos de una representación a otra para que viajen seguros por canales de solo texto. Todas corren dentro de tu navegador — el texto o la imagen que pegas nunca llega a un servidor.',

    'seo.cat.security.title': 'Herramientas de Seguridad Online Gratis — Cifrado AES, Contraseñas · Sin Subir',
    'seo.cat.security.description':
      'Cifra y descifra texto con AES y genera contraseñas aleatorias seguras, todo en tu navegador. Las claves nunca salen de tu dispositivo.',
    'seo.cat.security.keywords':
      'herramientas seguridad, cifrar aes online, descifrar aes, generador de contraseñas, contraseña segura, gratis',
    'cat.security.intro':
      'Estas herramientas usan la Web Crypto API del navegador, así que tu clave, tu texto y las contraseñas generadas se quedan en tu máquina. Nada se transmite, registra ni almacena.',

    'seo.cat.qr.title': 'Herramientas de Códigos QR Online Gratis — Lector y Generador · Sin Subir',
    'seo.cat.qr.description':
      'Genera un código QR para cualquier texto o URL, y decodifica códigos QR desde una imagen, en tu navegador. Sin subir nada, sin marca de agua, sin registro.',
    'seo.cat.qr.keywords': 'herramientas qr, generador qr gratis, lector qr online, decodificar qr desde imagen, qr sin subir',
    'cat.qr.intro':
      'Genera códigos QR para enlaces, credenciales Wi-Fi o texto plano, y vuelve a leerlos desde una captura o foto. La imagen se decodifica en la página — nunca se sube.',

    'seo.cat.data.title': 'Herramientas de Datos Online Gratis — Visor JSON, JSON a Excel · Sin Subir',
    'seo.cat.data.description':
      'Valida, formatea y explora JSON como árbol colapsable, y exporta un arreglo JSON a una hoja .xlsx. Todo corre en tu navegador.',
    'seo.cat.data.keywords': 'herramientas datos, visor json, formatear json, validar json, json a excel, json a xlsx gratis',
    'cat.data.intro':
      'Inspecciona y convierte datos estructurados sin pegarlos en un servidor ajeno. Útil cuando el payload trae tokens, datos de clientes o cualquier cosa que prefieras no subir.',

    'seo.cat.text.title': 'Herramientas de Texto Online Gratis — Comparar Dos Textos · Sin Subir',
    'seo.cat.text.description':
      'Compara dos textos y ve cada diferencia resaltada por línea y por palabra, en tu navegador. Vista lado a lado o en línea. No se sube nada.',
    'seo.cat.text.keywords': 'herramientas de texto, comparar texto online, comparar dos textos, diferencias entre textos, sin subir',
    'cat.text.intro':
      'Utilidades de texto plano que funcionan con lo que pegues: contratos, logs, código o traducciones. La comparación ocurre en la página, así que los borradores confidenciales siguen siendo privados.',

    'seo.cat.pdf.title': 'Herramientas PDF Online Gratis — Unir, Dividir, Rotar, Comprimir · Sin Subir',
    'seo.cat.pdf.description':
      'Siete herramientas PDF gratis que corren en tu navegador: unir, dividir, rotar, comprimir, numerar páginas, imágenes a PDF y PDF a imágenes. Sin subir, sin marca de agua, sin registro.',
    'seo.cat.pdf.keywords':
      'herramientas pdf, unir pdf, dividir pdf, comprimir pdf, rotar pdf, pdf a imágenes, numerar páginas pdf, pdf gratis sin subir',
    'cat.pdf.intro':
      'Cada herramienta PDF trabaja con pdf-lib dentro de tu navegador. Contratos, facturas y escaneos se procesan en tu propia máquina — sin subir, sin cola, sin marca de agua y sin más límite de tamaño que tu memoria disponible.',

    'seo.cat.image.title': 'Herramientas de Imagen Online Gratis — Comprimir, Convertir, Redimensionar · Sin Subir',
    'seo.cat.image.description':
      'Comprime, convierte y redimensiona imágenes en tu navegador. JPG, PNG y WebP, por lote y descarga en ZIP. Sin subir nada, sin marca de agua, privado.',
    'seo.cat.image.keywords':
      'herramientas imagen, comprimir imagen, convertir imagen, redimensionar imagen, jpg a webp, png a jpg, sin subir',
    'cat.image.intro':
      'El procesamiento de imágenes corre sobre el canvas HTML de tu navegador, así que fotos y capturas nunca salen de tu dispositivo. Procesa varios archivos a la vez y descárgalos en un ZIP.',

    'home.cat.encoding.title': 'Codificación',
    'home.cat.encoding.body': 'Codifica, decodifica e inspecciona formatos de texto.',
    'home.cat.security.title': 'Seguridad',
    'home.cat.security.body': 'Cifra datos y genera credenciales seguras.',
    'home.cat.qr.title': 'Códigos QR',
    'home.cat.qr.body': 'Genera y decodifica códigos QR desde texto o imágenes.',
    'home.cat.data.title': 'Datos',
    'home.cat.data.body': 'Valida, formatea y convierte datos estructurados.',

    'home.cards.base64.title': 'Base64 — texto',
    'home.cards.base64.body': 'Codifica y decodifica texto UTF-8 a Base64 y viceversa.',
    'home.cards.base64Image.title': 'Imagen ⇄ Base64',
    'home.cards.base64Image.body': 'Convierte una imagen a data URL Base64 y al revés.',
    'home.cards.qrRead.title': 'Lector QR',
    'home.cards.qrRead.body': 'Decodifica un QR a partir de una imagen.',
    'home.cards.qrGen.title': 'Generador QR',
    'home.cards.qrGen.body': 'Genera un código QR para cualquier texto o URL.',
    'home.cards.json.title': 'Visor JSON',
    'home.cards.json.body': 'Valida, formatea y explora JSON como árbol colapsable.',
    'home.cards.jsonExcel.title': 'JSON → Excel',
    'home.cards.jsonExcel.body': 'Convierte un arreglo JSON de objetos en un archivo .xlsx.',
    'home.cards.aes.title': 'Cifrar / descifrar AES',
    'home.cards.aes.body': 'Cifra o descifra texto con AES y una clave.',
    'home.cards.jwt.title': 'Decodificador JWT',
    'home.cards.jwt.body': 'Inspecciona un JWT — header, payload y expiración — sin verificar firma.',
    'home.cards.password.title': 'Generador de contraseñas',
    'home.cards.password.body': 'Genera contraseñas aleatorias seguras con longitud y caracteres personalizados.',

    'footer.tagline': 'DevTools · Utilidades privadas en tu navegador',
    'footer.privacy': 'Todo se ejecuta localmente en tu navegador.',
    'footer.byAuthor': 'por',

    'about.metaTitle': 'Acerca de DevTools — Utilidades de Desarrollador en tu Navegador',
    'about.metaDescription':
      'Acerca de DevTools: un set gratis de utilidades para desarrolladores que funcionan 100% en tu navegador (Base64, JSON, JWT, AES, QR). Sin subir nada, sin rastreo.',
    'about.metaKeywords': 'acerca devtools, herramientas desarrollador gratis, utilidades navegador, sin upload, herramientas privadas',
    'about.title': 'Acerca de DevTools',
    'about.body1':
      'DevTools es un set pequeño de utilidades gratis para desarrolladores que se ejecutan completamente en tu navegador. Base64, visor JSON, JSON a Excel, lector y generador QR, cifrado AES, decodificador JWT — todo sin subir nada.',
    'about.body2':
      'Todo corre del lado cliente. Tu entrada nunca sale de la página, así que puedes pegar tokens, payloads JSON o imágenes sin preocuparte por filtraciones ni rastreadores de terceros.',
    'about.authorTitle': 'Sobre el autor',
    'about.authorBody':
      'Construido y mantenido por Ismael Hurtado Vargas, desarrollador Full-Stack en Lima, Perú. Enfocado en web, mobile y automatización con IA desde 2014.',
    'about.viewSource': 'Ver código en GitHub',
    'about.visitPortfolio': 'Ver portfolio',
    'about.madeBy': 'Hecho por',

    'gate.title': 'Verificación rápida',
    'gate.body': 'Resuelve el captcha una vez para desbloquear todas las herramientas de la sesión. Ayuda a evitar abuso automatizado.',
    'gate.unlocking': 'Desbloqueando…',
    'gate.unlocked': 'Desbloqueado. Recargando…',
    'gate.failed': 'Captcha fallido. Intenta de nuevo.',
    'gate.retry': 'Reintentar',

    'ui.input': 'Entrada',
    'ui.output': 'Salida',
    'ui.copy': 'Copiar',
    'ui.copied': '¡Copiado!',
    'ui.copyFailed': 'No se pudo copiar',
    'ui.clear': 'Limpiar',
    'ui.paste': 'Pegar',
    'ui.download': 'Descargar',
    'ui.upload': 'Subir',
    'ui.dragDrop': 'Arrastra un archivo o haz clic para elegir',
    'ui.run': 'Ejecutar',
    'ui.invalid': 'Entrada inválida',
    'ui.empty': 'Sin entrada aún',
    'ui.bytes': 'bytes',

    't.b64.title': 'Base64 — texto',
    't.b64.lead': 'Codifica texto UTF-8 a Base64 o decodifícalo. Todo local.',
    't.b64.encode': 'Codificar',
    't.b64.decode': 'Decodificar',
    't.b64.placeholderEnc': 'Escribe o pega texto…',
    't.b64.placeholderDec': 'Pega Base64…',

    't.b64img.title': 'Imagen ⇄ Base64',
    't.b64img.lead': 'Convierte una imagen a data URL Base64 o pega un data URL para previsualizarlo.',
    't.b64img.toB64': 'Imagen → Base64',
    't.b64img.toImg': 'Base64 → Imagen',
    't.b64img.dropImage': 'Arrastra una imagen o haz clic para elegir',
    't.b64img.dataUrlPlaceholder': 'data:image/png;base64,…',
    't.b64img.preview': 'Vista previa',
    't.b64img.size': 'Tamaño',

    't.qrRead.title': 'Lector QR',
    't.qrRead.lead': 'Decodifica un QR desde una imagen. La imagen no sale de tu dispositivo.',
    't.qrRead.drop': 'Arrastra una imagen QR o haz clic para elegir',
    't.qrRead.notFound': 'No se encontró ningún QR en la imagen.',
    't.qrRead.result': 'Valor decodificado',
    't.qrRead.pasteHint': 'o pega una imagen — Ctrl / Cmd + V',
    't.qrRead.pasteEmpty': 'No se encontró ninguna imagen en el portapapeles.',
    't.qrRead.pasteError': 'No se pudo leer el portapapeles. Revisa los permisos del navegador.',
    't.qrRead.history': 'Historial',
    't.qrRead.historyEmpty': 'Aún no has decodificado nada.',
    't.qrRead.clearHistory': 'Limpiar',
    't.qrRead.remove': 'Quitar',
    't.qrRead.open': 'Abrir enlace',
    't.qrRead.namePlaceholder': 'Nombra este código…',
    't.qrRead.rename': 'Renombrar',
    't.qrRead.untitled': 'Sin nombre',

    't.qrGen.title': 'Generador QR',
    't.qrGen.lead': 'Genera un código QR para cualquier texto o URL.',
    't.qrGen.placeholder': 'https://ejemplo.com o cualquier texto',
    't.qrGen.size': 'Tamaño (px)',
    't.qrGen.ec': 'Corrección de errores',
    't.qrGen.downloadPng': 'Descargar PNG',

    't.json.title': 'Visor JSON',
    't.json.lead': 'Formatea, valida y explora JSON. Árbol colapsable, sin upload.',
    't.json.placeholder': 'Pega JSON aquí…',
    't.json.format': 'Formatear',
    't.json.minify': 'Minificar',
    't.json.tree': 'Árbol',
    't.json.raw': 'Texto',

    't.j2x.title': 'JSON → Excel',
    't.j2x.lead': 'Pega un arreglo JSON de objetos y descárgalo como .xlsx (o .csv).',
    't.j2x.placeholder': '[{"nombre":"Ada","edad":36}, …]',
    't.j2x.sheetName': 'Nombre de hoja',
    't.j2x.dlXlsx': 'Descargar .xlsx',
    't.j2x.dlCsv': 'Descargar .csv',
    't.j2x.notArray': 'El JSON debe ser un arreglo de objetos.',
    't.j2x.rows': 'filas',
    't.j2x.cols': 'columnas',

    't.aes.title': 'Cifrar / descifrar AES',
    't.aes.lead': 'AES-256 con una clave (CryptoJS, compatible con OpenSSL). Todo local.',
    't.aes.passphrase': 'Clave',
    't.aes.passphrasePh': 'Tu clave secreta…',
    't.aes.plaintext': 'Texto plano',
    't.aes.ciphertext': 'Texto cifrado',
    't.aes.encrypt': 'Cifrar',
    't.aes.decrypt': 'Descifrar',
    't.aes.errDecrypt': 'No se pudo descifrar. Clave incorrecta o texto corrupto.',

    // Password generator
    't.pwd.title': 'Generador de contraseñas',
    't.pwd.lead': 'Genera contraseñas aleatorias seguras criptográficamente. Todo local — no sale de tu navegador.',
    't.pwd.intro': 'Utiliza nuestro generador de contraseñas online para crear al instante una contraseña segura y aleatoria.',
    't.pwd.length': 'Longitud',
    't.pwd.upper': 'Mayúsculas',
    't.pwd.lower': 'Minúsculas',
    't.pwd.numbers': 'Números',
    't.pwd.symbols': 'Símbolos',
    't.pwd.regenerate': 'Regenerar',
    't.pwd.copy': 'Copiar contraseña',
    't.pwd.charsUsed': 'Caracteres usados',
    't.pwd.errNoChars': 'Selecciona al menos un tipo de caracteres.',
    't.pwd.strength.veryWeak': 'Muy débil',
    't.pwd.strength.weak': 'Débil',
    't.pwd.strength.fair': 'Aceptable',
    't.pwd.strength.strong': 'Segura',
    't.pwd.strength.veryStrong': 'Muy segura',

    't.jwt.title': 'Decodificador JWT',
    't.jwt.lead': 'Decodifica un JWT e inspecciona header, payload y expiración. La firma NO se verifica.',
    't.jwt.placeholder': 'eyJhbGciOiJIUzI1NiIs…',
    't.jwt.header': 'Header',
    't.jwt.payload': 'Payload',
    't.jwt.signature': 'Firma',
    't.jwt.expIn': 'Expira en',
    't.jwt.expAt': 'Expira el',
    't.jwt.expired': 'Expirado',
    't.jwt.invalid': 'No es un JWT válido (se esperan tres partes Base64URL).',

    'seo.b64.title': 'Codificar y Decodificar Base64 Online — Gratis · DevTools',
    'seo.b64.description':
      'Codificador y decodificador Base64 gratis online. Convierte texto UTF-8 a Base64 o decodifica Base64 a texto al instante en tu navegador. Sin uploads, sin rastreo.',
    'seo.b64.keywords':
      'base64 online, codificar base64, decodificar base64, base64 a texto, texto a base64, encoder base64, decoder base64',

    'seo.b64img.title': 'Imagen a Base64 — Convertidor Online Gratis · DevTools',
    'seo.b64img.description':
      'Convierte cualquier imagen a Base64 (data URL) o pega un data URL para previsualizar la imagen. PNG, JPG, SVG, WebP. En tu navegador, sin upload.',
    'seo.b64img.keywords': 'imagen a base64, convertir png base64, jpg a base64, data url generador, codificar imagen base64',

    'seo.qrRead.title': 'Lector de QR Online — Decodifica QR desde Imagen · DevTools',
    'seo.qrRead.description':
      'Lee y decodifica códigos QR desde cualquier imagen (PNG, JPG, SVG). 100% en tu navegador — la imagen nunca sale de tu dispositivo. Gratis, sin registro.',
    'seo.qrRead.keywords': 'lector qr online, escanear qr imagen, decodificar qr, leer codigo qr, qr scanner, decoder qr',

    'seo.qrGen.title': 'Generador de Códigos QR — Gratis, Tamaño Personalizable · DevTools',
    'seo.qrGen.description':
      'Genera códigos QR gratis para cualquier URL o texto. Tamaño y nivel de corrección personalizables. Descarga en PNG al instante. Sin marca de agua, sin registro.',
    'seo.qrGen.keywords': 'generador qr, crear codigo qr gratis, generar qr, qr maker, qr png, codigo qr online',

    'seo.json.title': 'Visor, Formateador y Validador JSON — Online Gratis · DevTools',
    'seo.json.description':
      'Formatea, minifica, valida y explora JSON como árbol colapsable. Pretty-print e inspección de objetos anidados en tu navegador. Sin upload ni límites.',
    'seo.json.keywords': 'visor json, formateador json, validador json, json pretty print, parser json, json beautifier, arbol json',

    'seo.j2x.title': 'JSON a Excel y CSV — Convertidor Online Gratis · DevTools',
    'seo.j2x.description':
      'Convierte cualquier arreglo JSON de objetos a Excel (.xlsx) o CSV en un clic. Previsualiza filas y columnas antes de descargar. Gratis, sin upload.',
    'seo.j2x.keywords': 'json a excel, json a xlsx, json a csv, convertir json hoja calculo, exportar json excel',

    'seo.aes.title': 'Cifrar y Descifrar AES Online — Gratis y Privado · DevTools',
    'seo.aes.description':
      'Cifra o descifra texto con AES-256 y una contraseña (CryptoJS, compatible con OpenSSL). 100% en tu navegador — el texto y la clave nunca salen.',
    'seo.aes.keywords': 'cifrar aes online, descifrar aes online, encriptar texto contraseña, aes-256, cryptojs, openssl aes',

    'seo.jwt.title': 'Decodificador JWT Online — Header, Payload, Expiración · DevTools',
    'seo.jwt.description':
      'Decodifica cualquier JWT (JSON Web Token) e inspecciona header, payload y fecha de expiración. Todo en tu navegador. La firma no se verifica.',
    'seo.jwt.keywords': 'decodificar jwt, jwt online, parser jwt, decoder json web token, inspector jwt',

    'seo.pwd.title': 'Generador de Contraseñas Online — Seguras y Aleatorias · DevTools',
    'seo.pwd.description':
      'Genera contraseñas aleatorias seguras con longitud personalizada (4–128) y juegos de caracteres (mayúsculas, minúsculas, números, símbolos). 100% en tu navegador.',
    'seo.pwd.keywords':
      'generador de contraseñas, contraseña aleatoria, contraseña segura, generar password, crear contraseña fuerte, password generator español',

    'home.cat.pdf.title': 'PDF',
    'home.cat.pdf.body': 'Une, divide y organiza archivos PDF — todo en tu navegador.',

    'home.cards.pdfMerge.title': 'Unir PDF',
    'home.cards.pdfMerge.body': 'Combina varios PDF en un solo archivo, en el orden que quieras.',
    'home.cards.pdfSplit.title': 'Dividir PDF',
    'home.cards.pdfSplit.body': 'Extrae un rango de páginas de un PDF a un archivo nuevo.',

    't.pdfMerge.title': 'Unir PDF',
    't.pdfMerge.lead': 'Combina varios PDF en uno. Reordena antes de unir. Tus archivos no salen de tu dispositivo.',
    't.pdfMerge.drop': 'Agrega archivos PDF o haz clic para elegir',
    't.pdfMerge.add': 'Agregar más',
    't.pdfMerge.merge': 'Unir y descargar',
    't.pdfMerge.working': 'Uniendo…',
    't.pdfMerge.need2': 'Agrega al menos 2 archivos PDF para unir.',
    't.pdfMerge.pages': 'páginas',
    't.pdfMerge.up': 'Subir',
    't.pdfMerge.down': 'Bajar',
    't.pdfMerge.remove': 'Quitar',
    't.pdfMerge.rotate': 'Rotar',
    't.pdfMerge.addMore': 'Agregar más',
    't.pdfMerge.dragHint': 'Arrastra para reordenar',
    't.pdfMerge.error': 'No se pudo leer un PDF (puede estar cifrado o dañado).',

    't.pdfSplit.title': 'Dividir PDF',
    't.pdfSplit.lead': 'Extrae un rango de páginas de un PDF a un archivo nuevo. 100% en tu navegador.',
    't.pdfSplit.drop': 'Arrastra un PDF o haz clic para elegir',
    't.pdfSplit.total': 'páginas en total',
    't.pdfSplit.from': 'Desde página',
    't.pdfSplit.to': 'Hasta página',
    't.pdfSplit.extract': 'Extraer y descargar',
    't.pdfSplit.working': 'Extrayendo…',
    't.pdfSplit.invalid': 'Ingresa un rango de páginas válido.',
    't.pdfSplit.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',
    't.pdfSplit.rendering': 'Generando vista previa…',

    'seo.pdfMerge.title': 'Unir PDF Online — Gratis, Privado, Sin Subir Archivos · DevTools',
    'seo.pdfMerge.description':
      'Combina varios archivos PDF en uno, directo en tu navegador. Reordena páginas, sin subir nada, sin marca de agua, 100% privado.',
    'seo.pdfMerge.keywords': 'unir pdf, combinar pdf, juntar pdf online, unir pdf gratis, unir pdf en navegador, pdf sin subir',
    'seo.pdfSplit.title': 'Dividir PDF Online — Extraer Páginas Gratis, Sin Subir · DevTools',
    'seo.pdfSplit.description':
      'Extrae un rango de páginas de un PDF a un archivo nuevo, completamente en tu navegador. Sin subir nada, sin marca de agua, privado.',
    'seo.pdfSplit.keywords': 'dividir pdf, extraer páginas pdf, separar pdf, dividir pdf gratis, dividir pdf en navegador, pdf sin subir',

    'home.cards.imagesToPdf.title': 'Imágenes → PDF',
    'home.cards.imagesToPdf.body': 'Convierte imágenes JPG/PNG en un solo PDF, una por página.',
    'home.cards.pdfRotate.title': 'Rotar PDF',
    'home.cards.pdfRotate.body': 'Rota todas las páginas de un PDF 90, 180 o 270 grados.',

    't.imagesToPdf.title': 'Imágenes → PDF',
    't.imagesToPdf.lead': 'Combina imágenes JPG y PNG en un solo PDF, una por página. Reordena antes de exportar. No se sube nada.',
    't.imagesToPdf.drop': 'Agrega imágenes o haz clic para elegir',
    't.imagesToPdf.create': 'Crear PDF y descargar',
    't.imagesToPdf.working': 'Generando…',
    't.imagesToPdf.need1': 'Agrega al menos 1 imagen.',
    't.imagesToPdf.up': 'Subir',
    't.imagesToPdf.down': 'Bajar',
    't.imagesToPdf.remove': 'Quitar',
    't.imagesToPdf.rotate': 'Rotar',
    't.imagesToPdf.addMore': 'Agregar más',
    't.imagesToPdf.dragHint': 'Arrastra para reordenar',
    't.imagesToPdf.error': 'No se pudo procesar una imagen.',

    't.pdfRotate.title': 'Rotar PDF',
    't.pdfRotate.lead': 'Rota cada página de un PDF. 100% en tu navegador.',
    't.pdfRotate.drop': 'Arrastra un PDF o haz clic para elegir',
    't.pdfRotate.total': 'páginas en total',
    't.pdfRotate.direction': 'Rotación',
    't.pdfRotate.apply': 'Rotar y descargar',
    't.pdfRotate.working': 'Rotando…',
    't.pdfRotate.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',
    't.pdfRotate.rendering': 'Generando vista previa…',

    'seo.imagesToPdf.title': 'JPG a PDF Online — Gratis, Sin Subir · DevTools',
    'seo.imagesToPdf.description':
      'Convierte imágenes JPG y PNG en un solo PDF, directo en tu navegador. Reordena páginas, sin subir nada, sin marca de agua, privado.',
    'seo.imagesToPdf.keywords': 'jpg a pdf, png a pdf, imágenes a pdf, convertir imagen a pdf gratis, jpg a pdf sin subir',
    'seo.pdfRotate.title': 'Rotar PDF Online — Gratis, Sin Subir · DevTools',
    'seo.pdfRotate.description':
      'Rota las páginas de un PDF 90, 180 o 270 grados, completamente en tu navegador. Sin subir nada, sin marca de agua, privado.',
    'seo.pdfRotate.keywords': 'rotar pdf, girar páginas pdf, rotar pdf online gratis, rotar pdf sin subir',

    'home.cards.pdfToImages.title': 'PDF → imágenes',
    'home.cards.pdfToImages.body': 'Exporta cada página del PDF como imagen PNG o JPG.',

    't.pdfToImages.title': 'PDF → imágenes',
    't.pdfToImages.lead': 'Convierte cada página de un PDF en imagen PNG o JPG. Descarga una página o todas en un ZIP. No se sube nada.',
    't.pdfToImages.drop': 'Arrastra un PDF o haz clic para elegir',
    't.pdfToImages.total': 'páginas en total',
    't.pdfToImages.format': 'Formato',
    't.pdfToImages.rendering': 'Generando páginas…',
    't.pdfToImages.downloadAll': 'Descargar todas (ZIP)',
    't.pdfToImages.downloadPage': 'Descargar',
    't.pdfToImages.working': 'Procesando…',
    't.pdfToImages.page': 'Página',
    't.pdfToImages.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',

    'seo.pdfToImages.title': 'PDF a JPG / PNG Online — Gratis, Sin Subir · DevTools',
    'seo.pdfToImages.description':
      'Convierte cada página de un PDF en imagen PNG o JPG, completamente en tu navegador. Descarga una página o todas en un ZIP. Sin subir nada, sin marca de agua.',
    'seo.pdfToImages.keywords': 'pdf a jpg, pdf a png, pdf a imagen, convertir pdf a imágenes gratis, pdf a jpg sin subir',

    'home.cat.image.title': 'Imagen',
    'home.cat.image.body': 'Comprime, convierte y redimensiona imágenes — todo en tu navegador.',

    'home.cards.imageCompress.title': 'Comprimir imagen',
    'home.cards.imageCompress.body': 'Reduce el peso de JPG/PNG/WebP con un control de calidad.',
    'home.cards.pdfCompress.title': 'Comprimir PDF',
    'home.cards.pdfCompress.body': 'Reduce el peso de un PDF recodificando sus páginas.',

    't.imageCompress.title': 'Comprimir imagen',
    't.imageCompress.lead':
      'Reduce el peso de una imagen con un control de calidad. Convierte a JPG o WebP para el menor tamaño. No se sube nada.',
    't.imageCompress.drop': 'Arrastra una imagen o haz clic para elegir',
    't.imageCompress.quality': 'Calidad',
    't.imageCompress.maxWidth': 'Ancho máx (px, 0 = original)',
    't.imageCompress.format': 'Formato',
    't.imageCompress.original': 'Original',
    't.imageCompress.compressed': 'Comprimida',
    't.imageCompress.saved': 'menos',
    't.imageCompress.bigger': 'más',
    't.imageCompress.download': 'Descargar',
    't.imageCompress.working': 'Comprimiendo…',
    't.imageCompress.error': 'No se pudo procesar esta imagen.',

    't.pdfCompress.title': 'Comprimir PDF',
    't.pdfCompress.lead':
      'Reduce el peso de un PDF recodificando sus páginas como imágenes comprimidas. Ideal para PDFs escaneados o con muchas imágenes. No se sube nada.',
    't.pdfCompress.drop': 'Arrastra un PDF o haz clic para elegir',
    't.pdfCompress.total': 'páginas en total',
    't.pdfCompress.quality': 'Calidad',
    't.pdfCompress.resolution': 'Resolución',
    't.pdfCompress.resLow': 'Baja',
    't.pdfCompress.resMed': 'Media',
    't.pdfCompress.resHigh': 'Alta',
    't.pdfCompress.compress': 'Comprimir y descargar',
    't.pdfCompress.working': 'Comprimiendo…',
    't.pdfCompress.original': 'Original',
    't.pdfCompress.result': 'Resultado',
    't.pdfCompress.saved': 'menos',
    't.pdfCompress.note': 'El texto y los vectores se rasterizan — ideal para PDFs escaneados, no para documentos de texto.',
    't.pdfCompress.bigger': 'El resultado es más grande que el original — este PDF probablemente es de texto. Compresión omitida.',
    't.pdfCompress.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',

    'seo.imageCompress.title': 'Comprimir Imagen Online — JPG / PNG / WebP, Gratis, Sin Subir · DevTools',
    'seo.imageCompress.description':
      'Reduce el peso de una imagen en tu navegador con un control de calidad y redimensión opcional. Convierte a JPG o WebP. Sin subir nada, sin marca de agua.',
    'seo.imageCompress.keywords':
      'comprimir imagen, reducir tamaño imagen, compresor de imágenes gratis, comprimir jpg, comprimir png, convertir webp, sin subir',
    'seo.pdfCompress.title': 'Comprimir PDF Online — Reduce el Tamaño Gratis, Sin Subir · DevTools',
    'seo.pdfCompress.description':
      'Reduce el peso de un PDF en tu navegador recodificando sus páginas como imágenes comprimidas. Ideal para PDFs escaneados. Sin subir nada, sin marca de agua.',
    'seo.pdfCompress.keywords':
      'comprimir pdf, reducir tamaño pdf, compresor de pdf gratis, achicar pdf, comprimir pdf sin subir, hacer pdf más pequeño',

    'home.cards.imageConvert.title': 'Convertir imagen',
    'home.cards.imageConvert.body': 'Convierte imágenes entre PNG, JPG y WebP. Por lote + ZIP.',
    'home.cards.imageResize.title': 'Redimensionar imagen',
    'home.cards.imageResize.body': 'Redimensiona por píxeles o porcentaje, mantiene proporción.',
    'home.cards.imageRedact.title': 'Censurar imagen',
    'home.cards.imageRedact.body': 'Oculta datos sensibles con recuadros, pixelado o desenfoque y escribe encima.',

    't.imageConvert.title': 'Convertir imagen',
    't.imageConvert.lead': 'Convierte una o varias imágenes entre PNG, JPG y WebP. Descarga cada una o todas en un ZIP. No se sube nada.',
    't.imageConvert.drop': 'Agrega imágenes o haz clic para elegir',
    't.imageConvert.addMore': 'Agregar más',
    't.imageConvert.to': 'Convertir a',
    't.imageConvert.quality': 'Calidad',
    't.imageConvert.downloadAll': 'Descargar todas (ZIP)',
    't.imageConvert.download': 'Descargar',
    't.imageConvert.remove': 'Quitar',
    't.imageConvert.working': 'Convirtiendo…',
    't.imageConvert.error': 'No se pudo procesar una imagen.',

    't.imageResize.title': 'Redimensionar imagen',
    't.imageResize.lead': 'Redimensiona una imagen por píxeles o porcentaje, manteniendo la proporción. No se sube nada.',
    't.imageResize.drop': 'Arrastra una imagen o haz clic para elegir',
    't.imageResize.width': 'Ancho (px)',
    't.imageResize.height': 'Alto (px)',
    't.imageResize.lock': 'Bloquear proporción',
    't.imageResize.percent': 'Escala',
    't.imageResize.format': 'Formato',
    't.imageResize.original': 'Original',
    't.imageResize.result': 'Resultado',
    't.imageResize.download': 'Descargar',
    't.imageResize.working': 'Redimensionando…',
    't.imageResize.error': 'No se pudo procesar esta imagen.',
    't.imageRedact.title': 'Censurar y anotar imagen',
    't.imageRedact.lead': 'Oculta datos sensibles tras un recuadro, pixelado o desenfoque, y escribe notas encima. La exportación va aplanada y no se sube nada.',
    't.imageRedact.drop': 'Arrastra una imagen, pega una captura o haz clic para elegir',
    't.imageRedact.tool.box': 'Recuadro',
    't.imageRedact.tool.pixelate': 'Pixelar',
    't.imageRedact.tool.blur': 'Desenfocar',
    't.imageRedact.tool.text': 'Texto',
    't.imageRedact.tool.ellipse': 'Elipse',
    't.imageRedact.tool.polygon': 'Polígono',
    't.imageRedact.tool.arrow': 'Flecha',
    't.imageRedact.style': 'Estilo',
    't.imageRedact.filled': 'Relleno',
    't.imageRedact.outline': 'Contorno',
    't.imageRedact.stroke': 'Grosor de línea',
    't.imageRedact.hintPolygon': 'Haz clic para añadir vértices. Ciérralo pulsando en el primer punto o con Enter.',
    't.imageRedact.hintArrow': 'Arrastra desde el inicio hasta la punta de la flecha.',
    't.imageRedact.copy': 'Copiar imagen',
    't.imageRedact.copied': 'Copiada',
    't.imageRedact.copyFail': 'No se pudo copiar',
    't.imageRedact.shortcuts': 'Atajos: Ctrl/⌘+Z deshacer · Ctrl/⌘+Shift+Z rehacer · Esc cancelar · Ctrl/⌘+V pegar una captura',
    't.imageRedact.hintDrag': 'Arrastra sobre la zona que quieres tapar.',
    't.imageRedact.hintText': 'Haz clic en la imagen y escribe ahí mismo. Enter para colocarlo.',
    't.imageRedact.color': 'Color',
    't.imageRedact.blockSize': 'Tamaño de bloque',
    't.imageRedact.radius': 'Radio de desenfoque',
    't.imageRedact.text': 'Texto',
    't.imageRedact.textPlaceholder': 'ej. CONFIDENCIAL',
    't.imageRedact.textBadge': 'Escribe aquí · Enter coloca · Esc cancela',
    't.imageRedact.fontSize': 'Tamaño de letra',
    't.imageRedact.undo': 'Deshacer',
    't.imageRedact.redo': 'Rehacer',
    't.imageRedact.reset': 'Quitar ediciones',
    't.imageRedact.download': 'Descargar',
    't.imageRedact.safety':
      'El archivo exportado va aplanado: los píxeles tapados desaparecen, no quedan bajo una capa. El recuadro sólido es la única edición irreversible — el pixelado y el desenfoque a veces se recuperan en parte cuando tapan texto.',
    't.imageRedact.history': 'Guardado en este dispositivo',
    't.imageRedact.historyEmpty': 'Tus ediciones se guardan aquí solas para que puedas retomarlas después.',
    't.imageRedact.restore': 'Abrir',
    't.imageRedact.delete': 'Borrar',
    't.imageRedact.clearAll': 'Borrar todo',
    't.imageRedact.storageNote':
      'Solo se guarda el resultado ya censurado: el original nunca sale de la memoria, así que una contraseña tapada no se puede recuperar desde aquí. Al reabrir una sesión continúas sobre la imagen censurada, de modo que las censuras anteriores son permanentes. Todo se queda en este navegador y nunca se sube.',
    't.imageRedact.error': 'No se pudo abrir esta imagen.',

    'seo.imageConvert.title': 'Convertir Imagen Online — PNG / JPG / WebP, Gratis, Sin Subir · DevTools',
    'seo.imageConvert.description':
      'Convierte imágenes entre PNG, JPG y WebP en tu navegador. Convierte por lote y descarga en ZIP. Sin subir nada, sin marca de agua, privado.',
    'seo.imageConvert.keywords':
      'convertir imagen, png a jpg, jpg a png, convertir webp, conversor de formato de imagen gratis, png a webp, sin subir',
    'seo.imageResize.title': 'Redimensionar Imagen Online — Por Píxeles o Porcentaje, Gratis, Sin Subir · DevTools',
    'seo.imageResize.description':
      'Redimensiona imágenes por píxeles exactos o porcentaje en tu navegador, manteniendo la proporción. Exporta a PNG, JPG o WebP. Sin subir nada.',
    'seo.imageResize.keywords':
      'redimensionar imagen, redimensionar imágenes gratis, escalar imagen, cambiar tamaño imagen, resize jpg png, sin subir',
    'seo.imageRedact.title': 'Censurar Imagen Online — Ocultar Datos con Recuadro, Pixelado o Desenfoque, Gratis · DevTools',
    'seo.imageRedact.description':
      'Censura datos sensibles en una foto o captura: tápalos con un recuadro, pixelado o desenfoque y añade texto encima. Todo en tu navegador — sin subir nada, sin marca de agua.',
    'seo.imageRedact.keywords':
      'censurar imagen, ocultar datos en imagen, tapar datos en captura, pixelar imagen, desenfocar parte de una imagen, tachar texto en captura, anotar imagen, sin subir',

    'home.cards.pdfPageNumbers.title': 'Numerar páginas',
    'home.cards.pdfPageNumbers.body': 'Agrega números de página a un PDF — elige la posición.',

    't.pdfPageNumbers.title': 'Numerar páginas',
    't.pdfPageNumbers.lead': 'Agrega números de página a un PDF y elige dónde van. 100% en tu navegador.',
    't.pdfPageNumbers.drop': 'Arrastra un PDF o haz clic para elegir',
    't.pdfPageNumbers.total': 'páginas en total',
    't.pdfPageNumbers.position': 'Posición',
    't.pdfPageNumbers.format': 'Formato',
    't.pdfPageNumbers.start': 'Empezar en',
    't.pdfPageNumbers.size': 'Tamaño',
    't.pdfPageNumbers.rendering': 'Generando vista previa…',
    't.pdfPageNumbers.apply': 'Agregar números y descargar',
    't.pdfPageNumbers.working': 'Agregando…',
    't.pdfPageNumbers.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',

    'seo.pdfPageNumbers.title': 'Numerar Páginas de PDF Online — Gratis, Sin Subir · DevTools',
    'seo.pdfPageNumbers.description':
      'Agrega números de página a un PDF en tu navegador y elige la posición (arriba o abajo, izquierda, centro o derecha). Sin subir nada, sin marca de agua.',
    'seo.pdfPageNumbers.keywords':
      'numerar páginas pdf, agregar números de página pdf, paginar pdf, paginación pdf gratis, números de página pdf sin subir',

    'home.cards.pdfImage.title': 'Insertar imagen',
    'home.cards.pdfImage.body': 'Coloca cualquier imagen en un PDF — muévela, redimensiónala, gírala y recórtala.',

    't.pdfImage.title': 'Insertar una imagen en un PDF',
    't.pdfImage.lead':
      'Agrega cualquier imagen —una firma, logo, sello o foto— y arrástrala a cualquier parte del documento, entre páginas. Redimensiónala, gírala, recórtala y descarga. 100% en tu navegador.',
    't.pdfImage.dropPdf': 'Arrastra un PDF o haz clic para elegir',
    't.pdfImage.total': 'páginas',
    't.pdfImage.rendering': 'Generando páginas…',
    't.pdfImage.addImage': 'Agregar imagen',
    't.pdfImage.replaceImage': 'Cambiar imagen',
    't.pdfImage.image': 'Imagen',
    't.pdfImage.placeAnother': 'Colocar otra',
    't.pdfImage.placed': 'colocadas',
    't.pdfImage.crop': 'Recortar imagen',
    't.pdfImage.autoTrim': 'Recorte automático',
    't.pdfImage.cropReset': 'Imagen completa',
    't.pdfImage.cropApply': 'Aplicar recorte',
    't.pdfImage.cropCancel': 'Cancelar',
    't.pdfImage.cropHint':
      'Arrastra dentro del recuadro para moverlo, o sus esquinas para ajustarlo. El recorte automático quita el margen en blanco de la imagen — útil para una firma o un logo escaneados.',
    't.pdfImage.trimEmpty': 'No hay nada que recortar: la imagen se ve vacía.',
    't.pdfImage.capped': 'mostrando primeras',
    't.pdfImage.dragAcross':
      'Haz clic en una página para colocarla ahí · arrastra para mover · esquina para redimensionar · tirador superior para girar (Shift para ángulos fijos)',
    't.pdfImage.page': 'Página',
    't.pdfImage.size': 'Tamaño',
    't.pdfImage.rotation': 'Rotación',
    't.pdfImage.reset': 'Reiniciar',
    't.pdfImage.opacity': 'Opacidad',
    't.pdfImage.remove': 'Quitar',
    't.pdfImage.apply': 'Descargar PDF con la imagen',
    't.pdfImage.working': 'Preparando…',
    't.pdfImage.needImage': 'Agrega una imagen y colócala en el documento primero.',
    't.pdfImage.imageError': 'No se pudo cargar esta imagen.',
    't.pdfImage.error': 'No se pudo leer este PDF (puede estar cifrado o dañado).',

    'seo.pdfImage.title': 'Insertar una Imagen en un PDF Online — Gratis, Sin Subir · DevTools',
    'seo.pdfImage.description':
      'Agrega cualquier imagen a un PDF —una firma, logo, sello o foto— y arrástrala a cualquier parte, entre las páginas. Redimensiona, gira, recorta y descarga. En tu navegador, sin subir nada.',
    'seo.pdfImage.keywords':
      'insertar imagen en pdf, agregar imagen a pdf, poner foto en pdf, agregar logo a pdf, firmar pdf online, agregar firma a pdf, imagen pdf sin subir',

    'home.cat.text.title': 'Texto',
    'home.cat.text.body': 'Compara e inspecciona texto plano — todo en tu navegador.',
    'home.cards.textDiff.title': 'Comparar texto',
    'home.cards.textDiff.body': 'Compara dos textos con resaltado por línea y por palabra.',

    't.textDiff.title': 'Comparar texto',
    't.textDiff.lead': 'Pega dos textos y ve cada diferencia resaltada línea por línea y palabra por palabra. No se sube nada.',
    't.textDiff.original': 'Original',
    't.textDiff.changed': 'Modificado',
    't.textDiff.placeholderA': 'Pega aquí el texto original…',
    't.textDiff.placeholderB': 'Pega aquí el texto modificado…',
    't.textDiff.lines': 'líneas',
    't.textDiff.viewSplit': 'Lado a lado',
    't.textDiff.viewUnified': 'En línea',
    't.textDiff.swap': 'Intercambiar',
    't.textDiff.ignoreCase': 'Ignorar mayúsculas',
    't.textDiff.ignoreWhitespace': 'Ignorar espacios',
    't.textDiff.onlyDiff': 'Solo diferencias',
    't.textDiff.added': 'agregadas',
    't.textDiff.removed': 'eliminadas',
    't.textDiff.modified': 'modificadas',
    't.textDiff.same': 'iguales',
    't.textDiff.unchangedLine': 'línea sin cambios',
    't.textDiff.unchangedLines': 'líneas sin cambios',
    't.textDiff.identical': 'Los dos textos son idénticos.',
    't.textDiff.empty': 'Pega texto en ambos lados para ver las diferencias.',
    't.textDiff.tooLarge': 'Entrada muy grande — las líneas se comparan posición a posición.',

    'seo.textDiff.title': 'Comparar Dos Textos Online — Diff Gratis, Sin Subir Nada · DevTools',
    'seo.textDiff.description':
      'Compara dos textos en tu navegador y ve las diferencias resaltadas por línea y por palabra. Vista lado a lado o en línea, ignorar mayúsculas o espacios. Sin subir nada, privado.',
    'seo.textDiff.keywords':
      'comparar texto, comparar dos textos, diferencias entre textos, diff online, comparador de texto gratis, text diff, sin subir',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];
