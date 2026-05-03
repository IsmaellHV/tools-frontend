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

    'home.metaTitle': 'DevTools — Free online developer utilities',
    'home.metaDescription':
      'Free in-browser developer tools: Base64, image to Base64, QR reader & generator, JSON viewer, JSON to Excel, AES encrypt/decrypt, JWT decoder. No upload, no tracking.',
    'home.heroPre': 'Developer tools,',
    'home.heroAccent': 'in your browser',
    'home.heroDot': '.',
    'home.heroLead': 'A small set of fast, private utilities. Everything runs locally in your browser — your data never leaves the page.',

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
    'seo.b64img.keywords': 'image to base64, base64 image converter, convert png to base64, jpg to base64, data url generator, image encoder',

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
    'seo.aes.keywords': 'aes encrypt online, aes decrypt online, encrypt text password, aes-256 online, cryptojs, openssl aes, encrypt decrypt tool',

    'seo.jwt.title': 'JWT Decoder Online — Inspect Header, Payload, Expiry · DevTools',
    'seo.jwt.description':
      'Decode any JWT (JSON Web Token) and inspect header, payload and expiration date. Runs entirely in your browser. Signature is not verified.',
    'seo.jwt.keywords': 'jwt decoder, decode jwt online, jwt parser, jwt inspector, json web token decoder, jwt debugger',

    'seo.pwd.title': 'Password Generator Online — Strong, Random, Free · DevTools',
    'seo.pwd.description':
      'Generate strong random passwords with custom length (4–128) and character sets (uppercase, lowercase, numbers, symbols). 100% in-browser, no logs.',
    'seo.pwd.keywords': 'password generator, random password, strong password, secure password generator, free password generator online, create password',
  },
  es: {
    'nav.home': 'Herramientas',
    'nav.about': 'Acerca',
    'nav.github': 'GitHub',
    'nav.toggleTheme': 'Cambiar tema',
    'nav.toggleLang': 'Cambiar idioma',

    'home.metaTitle': 'DevTools — Utilidades de desarrollo gratis en tu navegador',
    'home.metaDescription':
      'Utilidades para desarrolladores: Base64, imagen a Base64, lector y generador de QR, visor JSON, JSON a Excel, AES, decodificador JWT. Todo en tu navegador, sin rastreo.',
    'home.heroPre': 'Herramientas de desarrollo,',
    'home.heroAccent': 'en tu navegador',
    'home.heroDot': '.',
    'home.heroLead': 'Un set pequeño de utilidades rápidas y privadas. Todo se ejecuta localmente — tus datos nunca salen de la página.',

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
    'seo.b64.keywords': 'base64 online, codificar base64, decodificar base64, base64 a texto, texto a base64, encoder base64, decoder base64',

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
    'seo.pwd.keywords': 'generador de contraseñas, contraseña aleatoria, contraseña segura, generar password, crear contraseña fuerte, password generator español',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];
