document.addEventListener('DOMContentLoaded', () => {
    performance.mark('app-init-start');
    
    initEffects();
    initTheme();
    initTabs();
    initTextTools();
    initImageTools();
    
    performance.mark('app-init-end');
    performance.measure('app-init', 'app-init-start', 'app-init-end');
    
    const initTime = performance.getEntriesByName('app-init')[0].duration;
    console.log(`🚀 应用初始化完成: ${initTime.toFixed(2)}ms`);
});

const DOMCache = {
    themeBtns: null,
    tabBtns: null,
    imageToolBtns: null,
    warningPopup: null,
    effectsBtn: null,
    noEffectsBtn: null
};

function initEffects() {
    const savedEffects = localStorage.getItem('effects');
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    
    if (savedEffects) {
        applyEffects(savedEffects);
    } else {
        DOMCache.warningPopup = document.getElementById('warning-popup');
        DOMCache.effectsBtn = document.getElementById('effects-version');
        DOMCache.noEffectsBtn = document.getElementById('no-effects-version');
        
        if (DOMCache.warningPopup) {
            DOMCache.warningPopup.style.display = 'flex';
        }
        
        if (DOMCache.effectsBtn) {
            DOMCache.effectsBtn.addEventListener('click', () => {
                selectEffects('effects');
            });
        }
        
        if (DOMCache.noEffectsBtn) {
            DOMCache.noEffectsBtn.addEventListener('click', () => {
                selectEffects('no-effects');
            });
        }
    }
    
    initEffectsToggle();
}

function initEffectsToggle() {
    const toggleBtn = document.getElementById('toggle-effects');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const currentEffects = localStorage.getItem('effects') || 'effects';
            const newEffects = currentEffects === 'effects' ? 'no-effects' : 'effects';
            
            localStorage.setItem('effects', newEffects);
            applyEffects(newEffects);
            
            showToast(newEffects === 'effects' ? '已切换到有特效版' : '已切换到无特效版');
        });
    }
}

function selectEffects(version) {
    localStorage.setItem('effects', version);
    applyEffects(version);
    
    if (DOMCache.warningPopup) {
        DOMCache.warningPopup.style.animation = 'popupFadeIn 0.3s ease-out reverse';
        setTimeout(() => {
            DOMCache.warningPopup.style.display = 'none';
        }, 300);
    }
}

function applyEffects(version) {
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    if (stylesheet) {
        if (version === 'no-effects') {
            stylesheet.href = 'style-no-effects.css';
        } else {
            stylesheet.href = 'style.css';
        }
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
    
    DOMCache.themeBtns = document.querySelectorAll('.theme-btn');
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
    
    if (encodeBtn) {
        encodeBtn.addEventListener('click', () => {
            const result = encode(input.value, toolSelect.value);
            output.value = result;
        });
    }
    
    if (decodeBtn) {
        decodeBtn.addEventListener('click', () => {
            const result = decode(input.value, toolSelect.value);
            output.value = result;
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

function encode(text, tool) {
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
            default:
                return text;
        }
    } catch (e) {
        showToast('加密失败: ' + e.message);
        return '';
    }
}

function decode(text, tool) {
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
            default:
                return text;
        }
    } catch (e) {
        showToast('解密失败: ' + e.message);
        return '';
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

function htmlEncode(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function htmlDecode(text) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '')
                            .replace(/<iframe[^>]*>([\S\s]*?)<\/iframe>/gmi, '')
                            .replace(/on\w+="[^"]*"/gmi, '');
    return tempDiv.textContent || tempDiv.innerText || '';
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

if (window.performance && window.performance.navigation) {
    const nav = performance.getEntriesByType('navigation')[0];
    if (nav) {
        console.log('📊 页面加载性能:');
        console.log(`  DOM解析: ${nav.domContentLoadedEventEnd - nav.fetchStart}ms`);
        console.log(`  完整加载: ${nav.loadEventEnd - nav.fetchStart}ms`);
    }
}
