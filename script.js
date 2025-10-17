// Elements
const textInput = document.getElementById('textInput');
const sizeInput = document.getElementById('size');
const fgInput = document.getElementById('fg');
const bgInput = document.getElementById('bg');
const ecSelect = document.getElementById('ec');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qrContainer = document.getElementById('qrContainer');
const placeholder = document.getElementById('placeholder');
const metaText = document.getElementById('metaText');

let lastDataUrl = null;

// helper: show meta info
function setMeta(text) {
    metaText.textContent = text ? `Previewing: ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}` : 'No content';
}

// generate QR
async function generate() {
    const value = textInput.value.trim();
    if (!value) {
        alert('Please enter text or URL to generate a QR code.');
        textInput.focus();
        return;
    }
    const size = Math.max(100, Math.min(1200, parseInt(sizeInput.value) || 280));
    const fg = fgInput.value || '#000000';
    const bg = bgInput.value || '#ffffff';
    const ecLevel = ecSelect.value || 'M';

    // show loading placeholder
    placeholder.textContent = 'Generating…';
    qrContainer.innerHTML = '';
    qrContainer.appendChild(placeholder);

    try {
        // use QRCode.toDataURL to generate PNG data URL
        const opts = {
            errorCorrectionLevel: ecLevel,
            margin: 1,
            width: size,
            color: {
                dark: fg,
                light: bg
            }
        };

        const dataUrl = await QRCode.toDataURL(value, opts);

        // create image element
        const img = new Image();
        img.src = dataUrl;
        img.alt = 'QR code';
        img.width = size;
        img.height = size;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '8px';
        qrContainer.innerHTML = '';
        qrContainer.appendChild(img);

        lastDataUrl = dataUrl;
        downloadBtn.disabled = false;
        setMeta(value);
    } catch (err) {
        console.error('QR generation error', err);
        placeholder.textContent = 'Failed to generate QR';
        lastDataUrl = null;
        downloadBtn.disabled = true;
    }
}

// download image
function download() {
    if (!lastDataUrl) return;
    const a = document.createElement('a');
    a.href = lastDataUrl;
    // filename sanitize
    const fileName = (textInput.value || 'qr').replace(/[^a-z0-9_\-\.]/ig, '_').slice(0, 60) || 'qr';
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// clear UI
function clearAll() {
    textInput.value = '';
    sizeInput.value = 280;
    fgInput.value = '#0b1220';
    bgInput.value = '#ffffff';
    ecSelect.value = 'M';
    qrContainer.innerHTML = '';
    qrContainer.appendChild(placeholder);
    placeholder.textContent = 'Your QR preview will appear here';
    setMeta('');
    lastDataUrl = null;
    downloadBtn.disabled = true;
}

// quick generate on Enter
textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { generate(); } });
generateBtn.addEventListener('click', generate);
downloadBtn.addEventListener('click', download);
clearBtn.addEventListener('click', clearAll);

// accessibility: focus styles
generateBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') generate(); });

// persistence: remember last input
try {
    const saved = localStorage.getItem('cwz_last_qr');
    if (saved) {
        textInput.value = saved;
        setMeta(saved);
    }
    // save on changes
    textInput.addEventListener('input', () => localStorage.setItem('cwz_last_qr', textInput.value));
} catch (e) { /* ignore storage errors */ }

// initial state
setMeta('');
