document.addEventListener('DOMContentLoaded', () => {
    performance.mark('app-init-start');
    
    initTheme();
    initTabs();
    initTextTools();
    initImageTools();
    initAudioTools();
    initFileTools();
    initFPSCounter();
    initVersionPopup();
    
    // Ctrl+Shift+F 切换 FPS 计数器
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'F') {
            e.preventDefault();
            toggleFPSCounter();
        }
    });
    
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
    
    const initTime = performance.getEntriesByName('app-init')[0].duration;
    console.log(`🚀 应用初始化完成: ${initTime.toFixed(2)}ms`);
});

const DOMCache = {
    themeBtns: null,
    tabBtns: null,
    imageToolBtns: null,
    audioToolBtns: null
};

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    DOMCache.themeBtns = document.querySelectorAll('.theme-btn[data-theme]');
    DOMCache.themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('theme', theme);
        });
    });
    
    updateThemeButtons(savedTheme);
}

function applyTheme(theme) {
    const start = performance.now();
    
    if (theme === 'system') {
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : '');
    } else if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    updateThemeButtons(theme);
    
    const duration = performance.now() - start;
    if (duration > 10) {
        console.warn(`主题切换耗时较长: ${duration.toFixed(2)}ms`);
    }
}

function updateThemeButtons(theme) {
    if (!DOMCache.themeBtns) return;
    DOMCache.themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function initTabs() {
    DOMCache.tabBtns = document.querySelectorAll('.tab-btn');
    DOMCache.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            DOMCache.tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const tabContent = document.getElementById(`${tab}-tab`);
            if (tabContent) tabContent.classList.add('active');
        });
    });
}

function initTextTools() {
    const encodeBtn = document.getElementById('encode-btn');
    const decodeBtn = document.getElementById('decode-btn');
    const clearInputBtn = document.getElementById('clear-input');
    const copyOutputBtn = document.getElementById('copy-output');
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const toolSelect = document.getElementById('tool-select');
    const aesKeyBox = document.getElementById('aes-key-box');
    const aesKeyInput = document.getElementById('aes-key');
    
    function updateTextToolUI() {
        const tool = toolSelect.value;
        const isAes = tool === 'aes';
        const isHash = ['md5', 'sha1', 'sha256', 'sha512'].includes(tool);
        
        if (aesKeyBox) {
            aesKeyBox.style.display = isAes ? 'block' : 'none';
        }
        
        if (encodeBtn) encodeBtn.textContent = isAes ? '加密' : (isHash ? '生成哈希' : '加密');
        if (decodeBtn) {
            decodeBtn.style.display = isHash ? 'none' : 'inline-flex';
            decodeBtn.textContent = isAes ? '解密' : '解密';
        }
    }
    
    if (toolSelect) {
        toolSelect.addEventListener('change', updateTextToolUI);
        updateTextToolUI();
    }
    
    if (encodeBtn) {
        encodeBtn.addEventListener('click', async () => {
            try {
                const result = await encode(input.value, toolSelect.value, aesKeyInput ? aesKeyInput.value : '');
                output.value = result;
            } catch (e) {
                showToast(e.message || '处理失败');
            }
        });
    }
    
    if (decodeBtn) {
        decodeBtn.addEventListener('click', async () => {
            try {
                const result = await decode(input.value, toolSelect.value, aesKeyInput ? aesKeyInput.value : '');
                output.value = result;
            } catch (e) {
                showToast(e.message || '处理失败');
            }
        });
    }
    
    if (clearInputBtn) {
        clearInputBtn.addEventListener('click', () => {
            input.value = '';
            output.value = '';
        });
    }
    
    if (copyOutputBtn) {
        copyOutputBtn.addEventListener('click', () => {
            copyToClipboard(output.value);
        });
    }
}

async function encode(text, tool, key = '') {
    if (!text) {
        showToast('请输入要加密的内容');
        return '';
    }
    
    try {
        switch (tool) {
            case 'base64':
                return base64Encode(text);
            case 'url':
                return encodeURIComponent(text);
            case 'html':
                return htmlEncode(text);
            case 'hex':
                return textToHex(text);
            case 'binary':
                return textToBinary(text);
            case 'morse':
                return textToMorse(text);
            case 'md5':
            case 'sha1':
            case 'sha256':
            case 'sha512':
                return await computeHash(text, tool);
            case 'aes':
                if (!key) throw new Error('请输入 AES 密码');
                return await aesEncrypt(text, key);
            default:
                return text;
        }
    } catch (e) {
        showToast('加密失败: ' + e.message);
        throw e;
    }
}

async function decode(text, tool, key = '') {
    if (!text) {
        showToast('请输入要解密的内容');
        return '';
    }
    
    try {
        switch (tool) {
            case 'base64':
                return base64Decode(text);
            case 'url':
                return safeUrlDecode(text);
            case 'html':
                return htmlDecode(text);
            case 'hex':
                return hexToText(text);
            case 'binary':
                return binaryToText(text);
            case 'morse':
                return morseToText(text);
            case 'aes':
                if (!key) throw new Error('请输入 AES 密码');
                return await aesDecrypt(text, key);
            default:
                return text;
        }
    } catch (e) {
        showToast('解密失败: ' + e.message);
        throw e;
    }
}

function base64Encode(str) {
    try {
        const bytes = new TextEncoder().encode(str);
        let binary = '';
        const len = bytes.length;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    } catch (e) {
        throw new Error('Base64编码失败');
    }
}

function base64Decode(str) {
    try {
        const binary = atob(str);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (e) {
        throw new Error('无效的Base64编码');
    }
}

function safeUrlDecode(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return decodeURIComponent(str.replace(/%([0-9A-F]{2})/gi, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }
}

async function computeHash(text, algorithm) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('当前浏览器不支持 Web Crypto API，无法计算哈希');
    }
    
    const algoMap = {
        'md5': 'SHA-1',
        'sha1': 'SHA-1',
        'sha256': 'SHA-256',
        'sha512': 'SHA-512'
    };
    
    const webAlgo = algoMap[algorithm] || 'SHA-256';
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(webAlgo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    if (algorithm === 'md5') {
        return md5(text);
    }
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function md5(str) {
    // 基于 spark-md5 核心逻辑的精简实现
    function rotateLeft(lValue, iShiftBits) {
        return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }
    
    function addUnsigned(lX, lY) {
        const lX8 = (lX & 0x80000000);
        const lY8 = (lY & 0x80000000);
        const lX4 = (lX & 0x40000000);
        const lY4 = (lY & 0x40000000);
        const lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        if (lX4 | lY4) {
            if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
        }
        return (lResult ^ lX8 ^ lY8);
    }
    
    function f(x, y, z) { return (x & y) | ((~x) & z); }
    function g(x, y, z) { return (x & z) | (y & (~z)); }
    function h(x, y, z) { return (x ^ y ^ z); }
    function i(x, y, z) { return (y ^ (x | (~z))); }
    
    function ff(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function gg(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function hh(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    function ii(a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    }
    
    function convertToWordArray(str) {
        let lWordCount;
        const lMessageLength = str.length;
        const lNumberOfWordsTemp1 = lMessageLength + 8;
        const lNumberOfWordsTemp2 = (lNumberOfWordsTemp1 - (lNumberOfWordsTemp1 % 64)) / 64;
        const lNumberOfWords = (lNumberOfWordsTemp2 + 1) * 16;
        const lWordArray = new Array(lNumberOfWords - 1);
        let lBytePosition = 0;
        let lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] || 0) | (str.charCodeAt(lByteCount) << lBytePosition);
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] || 0 | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength * 8;
        return lWordArray;
    }
    
    function wordToHex(lValue) {
        let wordToHexValue = '';
        let wordToHexValueTemp = '';
        for (let lCount = 0; lCount <= 3; lCount++) {
            wordToHexValueTemp = (lValue >>> (lCount * 8)) & 255;
            wordToHexValue += ('0' + wordToHexValueTemp.toString(16)).slice(-2);
        }
        return wordToHexValue;
    }
    
    const x = convertToWordArray(str);
    let a = 0x67452301;
    let b = 0xEFCDAB89;
    let c = 0x98BADCFE;
    let d = 0x10325476;
    
    for (let k = 0; k < x.length; k += 16) {
        const AA = a, BB = b, CC = c, DD = d;
        a = ff(a, b, c, d, x[k + 0], 7, 0xD76AA478);
        d = ff(d, a, b, c, x[k + 1], 12, 0xE8C7B756);
        c = ff(c, d, a, b, x[k + 2], 17, 0x242070DB);
        b = ff(b, c, d, a, x[k + 3], 22, 0xC1BDCEEE);
        a = ff(a, b, c, d, x[k + 4], 7, 0xF57C0FAF);
        d = ff(d, a, b, c, x[k + 5], 12, 0x4787C62A);
        c = ff(c, d, a, b, x[k + 6], 17, 0xA8304613);
        b = ff(b, c, d, a, x[k + 7], 22, 0xFD469501);
        a = ff(a, b, c, d, x[k + 8], 7, 0x698098D8);
        d = ff(d, a, b, c, x[k + 9], 12, 0x8B44F7AF);
        c = ff(c, d, a, b, x[k + 10], 17, 0xFFFF5BB1);
        b = ff(b, c, d, a, x[k + 11], 22, 0x895CD7BE);
        a = ff(a, b, c, d, x[k + 12], 7, 0x6B901122);
        d = ff(d, a, b, c, x[k + 13], 12, 0xFD987193);
        c = ff(c, d, a, b, x[k + 14], 17, 0xA679438E);
        b = ff(b, c, d, a, x[k + 15], 22, 0x49B40821);
        a = gg(a, b, c, d, x[k + 1], 5, 0xF61E2562);
        d = gg(d, a, b, c, x[k + 6], 9, 0xC040B340);
        c = gg(c, d, a, b, x[k + 11], 14, 0x265E5A51);
        b = gg(b, c, d, a, x[k + 0], 20, 0xE9B6C7AA);
        a = gg(a, b, c, d, x[k + 5], 5, 0xD62F105D);
        d = gg(d, a, b, c, x[k + 10], 9, 0x02441453);
        c = gg(c, d, a, b, x[k + 15], 14, 0xD8A1E681);
        b = gg(b, c, d, a, x[k + 4], 20, 0xE7D3FBC8);
        a = gg(a, b, c, d, x[k + 9], 5, 0x21E1CDE6);
        d = gg(d, a, b, c, x[k + 14], 9, 0xC33707D6);
        c = gg(c, d, a, b, x[k + 3], 14, 0xF4D50D87);
        b = gg(b, c, d, a, x[k + 8], 20, 0x455A14ED);
        a = gg(a, b, c, d, x[k + 13], 5, 0xA9E3E905);
        d = gg(d, a, b, c, x[k + 2], 9, 0xFCEFA3F8);
        c = gg(c, d, a, b, x[k + 7], 14, 0x676F02D9);
        b = gg(b, c, d, a, x[k + 12], 20, 0x8D2A4C8A);
        a = hh(a, b, c, d, x[k + 5], 4, 0xFFFA3942);
        d = hh(d, a, b, c, x[k + 8], 11, 0x8771F681);
        c = hh(c, d, a, b, x[k + 11], 16, 0x6D9D6122);
        b = hh(b, c, d, a, x[k + 14], 23, 0xFDE5380C);
        a = hh(a, b, c, d, x[k + 1], 4, 0xA4BEEA44);
        d = hh(d, a, b, c, x[k + 4], 11, 0x4BDECFA9);
        c = hh(c, d, a, b, x[k + 7], 16, 0xF6BB4B60);
        b = hh(b, c, d, a, x[k + 10], 23, 0xBEBFBC70);
        a = hh(a, b, c, d, x[k + 13], 4, 0x289B7EC6);
        d = hh(d, a, b, c, x[k + 0], 11, 0xEAA127FA);
        c = hh(c, d, a, b, x[k + 3], 16, 0xD4EF3085);
        b = hh(b, c, d, a, x[k + 6], 23, 0x04881D05);
        a = hh(a, b, c, d, x[k + 9], 4, 0xD9D4D039);
        d = hh(d, a, b, c, x[k + 12], 11, 0xE6DB99E5);
        c = hh(c, d, a, b, x[k + 15], 16, 0x1FA27CF8);
        b = hh(b, c, d, a, x[k + 2], 23, 0xC4AC5665);
        a = ii(a, b, c, d, x[k + 0], 6, 0xF4292244);
        d = ii(d, a, b, c, x[k + 7], 10, 0x432AFF97);
        c = ii(c, d, a, b, x[k + 14], 15, 0xAB9423A7);
        b = ii(b, c, d, a, x[k + 5], 21, 0xFC93A039);
        a = ii(a, b, c, d, x[k + 12], 6, 0x655B59C3);
        d = ii(d, a, b, c, x[k + 3], 10, 0x8F0CCC92);
        c = ii(c, d, a, b, x[k + 10], 15, 0xFFEFF47D);
        b = ii(b, c, d, a, x[k + 1], 21, 0x85845DD1);
        a = ii(a, b, c, d, x[k + 8], 6, 0x6FA87E4F);
        d = ii(d, a, b, c, x[k + 15], 10, 0xFE2CE6E0);
        c = ii(c, d, a, b, x[k + 6], 15, 0xA3014314);
        b = ii(b, c, d, a, x[k + 13], 21, 0x4E0811A1);
        a = ii(a, b, c, d, x[k + 4], 6, 0xF7537E82);
        d = ii(d, a, b, c, x[k + 11], 10, 0xBD3AF235);
        c = ii(c, d, a, b, x[k + 2], 15, 0x2AD7D2BB);
        b = ii(b, c, d, a, x[k + 9], 21, 0xEB86D391);
        a = addUnsigned(a, AA);
        b = addUnsigned(b, BB);
        c = addUnsigned(c, CC);
        d = addUnsigned(d, DD);
    }
    
    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

async function deriveKey(password, salt) {
    if (!window.crypto || !window.crypto.subtle) {
        throw new Error('当前浏览器不支持 Web Crypto API');
    }
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

async function aesEncrypt(text, password) {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(password, salt);
    const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(text)
    );
    
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);
    
    return arrayBufferToBase64(combined);
}

async function aesDecrypt(base64, password) {
    const decoder = new TextDecoder();
    const data = base64ToArrayBuffer(base64);
    
    if (data.length < 28) {
        throw new Error('无效的 AES 加密数据');
    }
    
    const salt = data.slice(0, 16);
    const iv = data.slice(16, 28);
    const ciphertext = data.slice(28);
    const key = await deriveKey(password, salt);
    
    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            ciphertext
        );
        return decoder.decode(decrypted);
    } catch (e) {
        throw new Error('解密失败：密码错误或数据已损坏');
    }
}

function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function htmlEncode(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function htmlDecode(text) {
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    return txt.value;
}

function textToHex(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let hex = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
        hex += bytes[i].toString(16).padStart(2, '0') + ' ';
    }
    return hex.trim();
}

function hexToText(hex) {
    hex = hex.replace(/\s/g, '');
    if (!/^[0-9A-Fa-f]*$/.test(hex)) {
        throw new Error('无效的十六进制格式');
    }
    if (hex.length % 2 !== 0) {
        throw new Error('十六进制长度必须为偶数');
    }
    
    const len = hex.length;
    const bytes = new Uint8Array(len / 2);
    for (let i = 0; i < len; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16);
        if (isNaN(byte)) {
            throw new Error('无效的十六进制字符');
        }
        bytes[i / 2] = byte;
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

function textToBinary(text) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let binary = '';
    const len = bytes.length;
    for (let i = 0; i < len; i++) {
        binary += bytes[i].toString(2).padStart(8, '0') + ' ';
    }
    return binary.trim();
}

function binaryToText(binary) {
    binary = binary.replace(/\s/g, '');
    if (!/^[01]*$/.test(binary)) {
        throw new Error('无效的二进制格式');
    }
    if (binary.length % 8 !== 0) {
        throw new Error('二进制长度必须为8的倍数');
    }
    
    const len = binary.length;
    const bytes = new Uint8Array(len / 8);
    for (let i = 0; i < len; i += 8) {
        const byte = parseInt(binary.substr(i, 8), 2);
        if (isNaN(byte)) {
            throw new Error('无效的二进制字符');
        }
        bytes[i / 8] = byte;
    }
    
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

const morseMap = {
    'A': '.-',   'B': '-...', 'C': '-.-.', 'D': '-..',  'E': '.',
    'F': '..-.', 'G': '--.',  'H': '....', 'I': '..',   'J': '.---',
    'K': '-.-',  'L': '.-..', 'M': '--',   'N': '-.',   'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.',  'S': '...',  'T': '-',
    'U': '..-',  'V': '...-', 'W': '.--',  'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

const reverseMorseMap = {};
for (const [key, value] of Object.entries(morseMap)) {
    reverseMorseMap[value] = key;
}

function textToMorse(text) {
    const upper = text.toUpperCase();
    let result = '';
    for (let i = 0; i < upper.length; i++) {
        const ch = upper[i];
        if (ch === ' ') {
            result += '/ ';
        } else if (morseMap[ch]) {
            result += morseMap[ch] + ' ';
        }
    }
    return result.trim();
}

function morseToText(morse) {
    if (!morse || !morse.trim()) return '';
    const tokens = morse.trim().split(/\s+/);
    let result = '';
    for (const token of tokens) {
        if (token === '/') {
            result += ' ';
        } else if (reverseMorseMap[token]) {
            result += reverseMorseMap[token];
        } else {
            throw new Error('无效的摩尔斯电码: ' + token);
        }
    }
    return result;
}

function initImageTools() {
    DOMCache.imageToolBtns = document.querySelectorAll('.image-tool-btn');
    DOMCache.imageToolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            
            DOMCache.imageToolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.image-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`${tool}-panel`);
            if (panel) panel.classList.add('active');
        });
    });
    
    initImageToBase64();
    initBase64ToImage();
}

function initImageToBase64() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const imagePreview = document.getElementById('image-preview');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const base64Output = document.getElementById('base64-output');
    const copyBase64Btn = document.getElementById('copy-base64');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => imageInput && imageInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleImageFile(e.target.files[0]);
            }
        });
    }
    
    if (copyBase64Btn) {
        copyBase64Btn.addEventListener('click', () => {
            copyToClipboard(base64Output.value);
        });
    }
    
    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('请选择图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if (base64Output) base64Output.value = base64;
            if (imagePreview) imagePreview.src = base64;
            if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
            showToast('图片转换成功');
        };
        reader.onerror = () => {
            showToast('图片读取失败');
        };
        reader.readAsDataURL(file);
    }
}

function initBase64ToImage() {
    const base64Input = document.getElementById('base64-input');
    const convertBtn = document.getElementById('convert-to-image');
    const imageOutput = document.getElementById('image-output');
    const imageOutputContainer = document.getElementById('image-output-container');
    const downloadBtn = document.getElementById('download-image');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const base64 = base64Input.value.trim();
            if (!base64) {
                showToast('请输入 Base64 编码');
                return;
            }
            
            if (imageOutput) {
                imageOutput.onload = null;
                imageOutput.onerror = null;
                imageOutput.onload = () => {
                    if (downloadBtn) downloadBtn.href = base64;
                    if (imageOutputContainer) imageOutputContainer.style.display = 'block';
                    showToast('图片转换成功');
                };
                
                imageOutput.onerror = () => {
                    showToast('转换失败: 无效的 Base64 编码');
                    if (imageOutputContainer) imageOutputContainer.style.display = 'none';
                };
                
                imageOutput.src = base64;
            }
        });
    }
}

let toastTimeout = null;
function copyToClipboard(text) {
    if (!text) {
        showToast('没有内容可复制');
        return;
    }
    
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('已复制到剪贴板');
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
darkModeMediaQuery.addEventListener('change', () => {
    if (localStorage.getItem('theme') === 'system') {
        applyTheme('system');
    }
});

let fpsCounterInterval = null;
let fpsCounterRunning = false;

function initFPSCounter() {
    // FPS 计数器默认隐藏，可通过 Ctrl+Shift+F 切换
    const fpsCounter = document.getElementById('fps-counter');
    if (fpsCounter) {
        fpsCounter.style.display = 'none';
    }
}

function toggleFPSCounter() {
    const fpsCounter = document.getElementById('fps-counter');
    if (!fpsCounter) return;
    
    if (fpsCounterRunning) {
        fpsCounter.style.display = 'none';
        stopFPSCounter();
        fpsCounterRunning = false;
    } else {
        fpsCounter.style.display = 'block';
        startFPSCounter();
        fpsCounterRunning = true;
    }
}

function startFPSCounter() {
    stopFPSCounter();
    startFPSWithInterval();
}

function stopFPSCounter() {
    if (fpsCounterInterval) {
        clearInterval(fpsCounterInterval);
        fpsCounterInterval = null;
    }
}

function startFPSWithInterval() {
    let lastTime = Date.now();
    let frameCount = 0;
    const fpsCounter = document.getElementById('fps-counter');
    
    fpsCounterInterval = setInterval(() => {
        const now = Date.now();
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        if (fpsCounter) {
            fpsCounter.textContent = `${fps} FPS`;
        }
        frameCount = 0;
        lastTime = now;
    }, 1000);
    
    function countFrame() {
        frameCount++;
        requestAnimationFrame(countFrame);
    }
    countFrame();
}

function initFileTools() {
    const fileToolBtns = document.querySelectorAll('.file-tool-btn');
    fileToolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            fileToolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.file-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`${tool}-panel`);
            if (panel) panel.classList.add('active');
        });
    });
    
    initFileToBase64();
    initBase64ToFile();
}

function initFileToBase64() {
    const uploadArea = document.getElementById('file-upload-area');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const fileType = document.getElementById('file-type');
    const base64Output = document.getElementById('file-base64-output');
    const copyBase64Btn = document.getElementById('copy-file-base64');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput && fileInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });
    }
    
    if (copyBase64Btn) {
        copyBase64Btn.addEventListener('click', () => {
            copyToClipboard(base64Output.value);
        });
    }
    
    function handleFile(file) {
        if (fileInfo) fileInfo.style.display = 'block';
        if (fileName) fileName.textContent = `名称: ${file.name}`;
        if (fileSize) fileSize.textContent = `大小: ${formatFileSize(file.size)}`;
        if (fileType) fileType.textContent = `类型: ${file.type || '未知'}`;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if (base64Output) base64Output.value = base64;
            showToast('文件转换成功');
        };
        reader.onerror = () => {
            showToast('文件读取失败');
        };
        reader.readAsDataURL(file);
    }
}

function initBase64ToFile() {
    const base64Input = document.getElementById('file-base64-input');
    const downloadNameInput = document.getElementById('file-download-name');
    const convertBtn = document.getElementById('convert-to-file');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const base64 = base64Input.value.trim();
            if (!base64) {
                showToast('请输入 Base64 编码');
                return;
            }
            
            try {
                const link = document.createElement('a');
                link.href = base64;
                link.download = downloadNameInput.value.trim() || 'download.bin';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToast('文件下载已触发');
            } catch (e) {
                showToast('转换失败: 无效的 Base64 编码');
            }
        });
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initAudioTools() {
    DOMCache.audioToolBtns = document.querySelectorAll('.audio-tool-btn');
    DOMCache.audioToolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            
            DOMCache.audioToolBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.audio-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`${tool}-panel`);
            if (panel) panel.classList.add('active');
        });
    });
    
    initAudioToBase64();
    initBase64ToAudio();
}

function initAudioToBase64() {
    const uploadArea = document.getElementById('audio-upload-area');
    const audioInput = document.getElementById('audio-input');
    const audioPreview = document.getElementById('audio-preview');
    const audioPreviewContainer = document.getElementById('audio-preview-container');
    const base64Output = document.getElementById('audio-base64-output');
    const copyBase64Btn = document.getElementById('copy-audio-base64');
    
    if (uploadArea) {
        uploadArea.addEventListener('click', () => audioInput && audioInput.click());
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleAudioFile(e.dataTransfer.files[0]);
            }
        });
    }
    
    if (audioInput) {
        audioInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleAudioFile(e.target.files[0]);
            }
        });
    }
    
    if (copyBase64Btn) {
        copyBase64Btn.addEventListener('click', () => {
            copyToClipboard(base64Output.value);
        });
    }
    
    function handleAudioFile(file) {
        if (!file.type.startsWith('audio/')) {
            showToast('请选择音频文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if (base64Output) base64Output.value = base64;
            if (audioPreview) audioPreview.src = base64;
            if (audioPreviewContainer) audioPreviewContainer.style.display = 'block';
            showToast('音频转换成功');
        };
        reader.onerror = () => {
            showToast('音频读取失败');
        };
        reader.readAsDataURL(file);
    }
}

function initBase64ToAudio() {
    const base64Input = document.getElementById('audio-base64-input');
    const convertBtn = document.getElementById('convert-to-audio');
    const audioOutput = document.getElementById('audio-output');
    const audioOutputContainer = document.getElementById('audio-output-container');
    const downloadBtn = document.getElementById('download-audio');
    
    if (convertBtn) {
        convertBtn.addEventListener('click', () => {
            const base64 = base64Input.value.trim();
            if (!base64) {
                showToast('请输入 Base64 编码');
                return;
            }
            
            if (audioOutput) {
                audioOutput.onloadedmetadata = null;
                audioOutput.onerror = null;
                audioOutput.onloadedmetadata = () => {
                    if (downloadBtn) downloadBtn.href = base64;
                    if (audioOutputContainer) audioOutputContainer.style.display = 'block';
                    showToast('音频转换成功');
                };
                
                audioOutput.onerror = () => {
                    showToast('转换失败: 无效的 Base64 编码');
                    if (audioOutputContainer) audioOutputContainer.style.display = 'none';
                };
                
                audioOutput.src = base64;
            }
        });
    }
}

function initVersionPopup() {
    const showVersionsBtn = document.getElementById('show-versions');
    const versionPopup = document.getElementById('version-popup');
    const closeVersionsBtn = document.getElementById('close-versions');
    
    if (showVersionsBtn && versionPopup) {
        showVersionsBtn.addEventListener('click', () => {
            versionPopup.style.display = 'flex';
        });
    }
    
    if (closeVersionsBtn && versionPopup) {
        closeVersionsBtn.addEventListener('click', () => {
            versionPopup.style.display = 'none';
        });
    }
    
    if (versionPopup) {
        versionPopup.addEventListener('click', (e) => {
            if (e.target === versionPopup) {
                versionPopup.style.display = 'none';
            }
        });
    }
}

if (window.performance && window.performance.navigation) {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
        console.log('📊 页面加载性能:');
        console.log(`  DOM解析: ${nav.domContentLoadedEventEnd - nav.fetchStart}ms`);
        console.log(`  完整加载: ${nav.loadEventEnd - nav.fetchStart}ms`);
    }
}
