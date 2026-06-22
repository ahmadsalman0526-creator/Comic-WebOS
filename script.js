/**
 * Stardance Cosmic WebOS Production Core Kernel Engine
 */

const OS = {
    windows: [],
    activeWindow: null,
    baseZIndex: 100,

    init() {
        this.windows = Array.from(document.querySelectorAll('.window')).map(el => new OSWindow(el));
        this.bindSystemEvents();
        SystemClock.run();
        NotepadApp.loadSavedData();
        SearchEngine.init(); 
        BrowserApp.init(); 
    },

    bindSystemEvents() {
        // Handle desktop app launcher events
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                this.launchApp(icon.getAttribute('data-app'));
            });
        });

        document.querySelectorAll('.menu-link[data-app]').forEach(link => {
            link.addEventListener('click', () => {
                this.launchApp(link.getAttribute('data-app'));
                StartMenu.close();
            });
        });

        document.getElementById('desktop').addEventListener('mousedown', (e) => {
            if (e.target === document.getElementById('desktop')) {
                this.clearActiveFocus();
                StartMenu.close();
            }
        });
    },

    launchApp(appKey) {
        const targetWin = this.windows.find(w => w.id === `win-${appKey}`);
        if (targetWin) targetWin.open();
    },

    clearActiveFocus() {
        this.windows.forEach(w => w.element.classList.remove('active'));
        this.activeWindow = null;
        this.syncTaskbarTabs();
    },

    setFocus(windowInstance) {
        if (this.activeWindow === windowInstance) return;
        
        this.clearActiveFocus();
        this.activeWindow = windowInstance;
        
        this.baseZIndex += 2;
        windowInstance.element.style.zIndex = this.baseZIndex;
        windowInstance.element.classList.add('active');
        
        this.syncTaskbarTabs();
    },

    syncTaskbarTabs() {
        const tray = document.getElementById('running-tasks');
        tray.innerHTML = ''; 

        this.windows.forEach(win => {
            if (!win.isOpen) return;

            const tab = document.createElement('div');
            tab.className = `task-tab ${this.activeWindow === win ? 'active' : ''}`;
            tab.textContent = win.title;
            
            tab.addEventListener('click', () => {
                if (this.activeWindow === win) {
                    win.minimize();
                } else {
                    win.restore();
                }
            });
            tray.appendChild(tab);
        });
    }
};

// ==========================================
// CENTRAL DESKTOP SEARCH & ROUTING FRAMEWORK
// ==========================================
const SearchEngine = {
    input: document.getElementById('desktop-search'),
    icons: [],

    init() {
        this.icons = Array.from(document.querySelectorAll('.desktop-icon'));
        this.input.addEventListener('input', () => this.filterIcons());
        
        // Router intercepts Enter key submission commands
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeCommand();
            }
        });
    },

    filterIcons() {
        const query = this.input.value.toLowerCase().trim();
        
        this.icons.forEach(icon => {
            const label = icon.querySelector('.icon-text').textContent.toLowerCase();
            if (label.includes(query)) {
                icon.style.opacity = '1';
                icon.style.pointerEvents = 'auto';
            } else {
                icon.style.opacity = '0.15'; 
                icon.style.pointerEvents = 'none';
            }
        });
    },

    executeCommand() {
        const query = this.input.value.toLowerCase().trim();
        if (!query) return;

        const appAliases = {
            notepad: 'notepad',
            notes: 'notepad',
            calculator: 'calc',
            calc: 'calc',
            browser: 'browser',
            web: 'browser',
            settings: 'settings',
            config: 'settings'
        };
        const appTarget = query.startsWith('open ') ? query.replace('open ', '').trim() : query;

        // Smart routing shortcuts to bypass iframe constraints natively
        if (query === 'hackclub') {
            BrowserApp.directNavigate('https://hackclub.com');
            this.clearSearch();
        } else if (query === 'stardance') {
            BrowserApp.directNavigate('https://stardance.hackclub.app');
            this.clearSearch();
        } else if (query === 'wikipedia') {
            BrowserApp.directNavigate('https://www.wikipedia.org');
            this.clearSearch();
        } else if (appAliases[appTarget]) {
            OS.launchApp(appAliases[appTarget]);
            this.clearSearch();
        } else {
            BrowserApp.searchWeb(query);
            this.clearSearch();
        }
    },

    clearSearch() {
        this.input.value = '';
        this.filterIcons();
        this.input.blur(); 
    }
};

// ==========================================
// WINDOW EVENT INSTANTIATOR CONSTRUCTOR
// ==========================================
class OSWindow {
    constructor(element) {
        this.element = element;
        this.id = element.id;
        this.title = element.querySelector('.window-title').textContent;
        this.isOpen = false;
        this.setupFunctionalHooks();
    }

    setupFunctionalHooks() {
        const header = this.element.querySelector('.window-header');
        this.element.addEventListener('mousedown', () => OS.setFocus(this));
        this.element.querySelector('.close-btn').addEventListener('click', () => this.close());
        this.element.querySelector('.min-btn').addEventListener('click', () => this.minimize());
        header.addEventListener('mousedown', (e) => this.initiateDrag(e));
    }

    open() {
        this.isOpen = true;
        this.element.classList.remove('minimized');
        this.element.classList.add('open');
        OS.setFocus(this);
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('open', 'active');
        if (OS.activeWindow === this) OS.activeWindow = null;
        OS.syncTaskbarTabs();
    }

    minimize() {
        this.element.classList.add('minimized');
        this.element.classList.remove('active');
        if (OS.activeWindow === this) OS.clearActiveFocus();
    }

    restore() {
        this.element.classList.remove('minimized');
        this.element.classList.add('open');
        OS.setFocus(this);
    }

    initiateDrag(e) {
        if (e.target.classList.contains('win-btn')) return;

        OS.setFocus(this); 

        const offsetX = e.clientX - this.element.offsetLeft;
        const offsetY = e.clientY - this.element.offsetTop;

        const trackDrag = (moveEvent) => {
            this.element.style.left = `${moveEvent.clientX - offsetX}px`;
            this.element.style.top = `${moveEvent.clientY - offsetY}px`;
        };

        const releaseDrag = () => {
            document.removeEventListener('mousemove', trackDrag);
            document.removeEventListener('mouseup', releaseDrag);
        };

        document.addEventListener('mousemove', trackDrag);
        document.addEventListener('mouseup', releaseDrag);
    }
}

// ==========================================
// CORE PLATFORM OPERATIONAL APPLICATIONS
// ==========================================
const Calculator = {
    display: document.getElementById('calc-display'),
    expression: '',

    init() {
        document.querySelectorAll('.c-btn').forEach(button => {
            button.addEventListener('click', () => this.processInput(button.textContent));
        });
    },
    processInput(char) {
        if (char === 'C') {
            this.expression = '';
            this.display.value = '0';
        } else if (char === '=') {
            try {
                if (this.expression.trim()) {
                    const evaluation = new Function(`return ${this.expression}`)();
                    this.display.value = evaluation;
                    this.expression = String(evaluation);
                }
            } catch {
                this.display.value = 'Error';
                this.expression = '';
            }
        } else {
            if (this.display.value === '0' && !isNaN(char)) this.expression = '';
            this.expression += char;
            this.display.value = this.expression;
        }
    }
};

const NotepadApp = {
    textarea: document.getElementById('notepad-input'),
    init() {
        this.textarea.addEventListener('input', () => {
            localStorage.setItem('stardance_notepad_cache', this.textarea.value);
        });
    },
    loadSavedData() {
        const saved = localStorage.getItem('stardance_notepad_cache');
        if (saved) this.textarea.value = saved;
    }
};

const BrowserApp = {
    urlInput: document.getElementById('browser-url'),
    goBtn: document.getElementById('browser-go-btn'),
    iframe: document.getElementById('browser-viewport'),

    init() {
        this.goBtn.addEventListener('click', () => this.navigate());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.navigate();
        });
        
        this.generateMockPage("Deepspace Browser Sandbox", "https://www.wikipedia.org", "#475569");
    },
    navigate() {
        let url = this.urlInput.value.trim().toLowerCase();
        if (url.includes("hackclub")) {
            this.directNavigate("https://hackclub.com");
        } else if (url.includes("stardance")) {
            this.directNavigate("https://stardance.hackclub.app");
        } else if (url.includes("wikipedia")) {
            this.directNavigate("https://www.wikipedia.org");
        } else {
            if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
            this.urlInput.value = url;
            this.iframe.removeAttribute('srcdoc');
            this.iframe.src = url;
        }
    },
    directNavigate(targetUrl) {
        OS.launchApp('browser');
        this.urlInput.value = targetUrl;
        
        if (targetUrl.includes("stardance")) {
            this.generateMockPage("âœ¨ Hack Club Stardance Portal", targetUrl, "#a855f7");
        } else if (targetUrl.includes("hackclub")) {
            this.generateMockPage("ðŸš© Hack Club Main Terminal", targetUrl, "#ec3750");
        } else if (targetUrl.includes("wikipedia")) {
            this.generateMockPage("ðŸŒ Wikipedia Space Station", targetUrl, "#3b82f6");
        }
    },
    searchWeb(query) {
        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        OS.launchApp('browser');
        this.urlInput.value = query;
        this.generateMockPage(`Search: ${query}`, targetUrl, '#22c55e');
    },
    generateMockPage(title, url, brandColor) {
        this.iframe.srcdoc = `
            <html>
            <head>
                <style>
                    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 85vh; margin: 0; background: #020617; color: #94a3b8; text-align: center; }
                    .card { background: #0f172a; padding: 30px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-top: 5px solid ${brandColor}; max-width: 380px; border-left: 1px solid rgba(255,255,255,0.05); border-right: 1px solid rgba(255,255,255,0.05); }
                    h2 { margin-top: 0; color: #fff; font-size: 19px; }
                    p { font-size: 13px; line-height: 1.6; color: #94a3b8; }
                    a { display: inline-block; margin-top: 18px; padding: 10px 24px; background: ${brandColor}; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px ${brandColor}40; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>${title}</h2>
                    <p>WebOS has bypassed cross-origin security walls by staging this clean sandbox window wrapper.</p>
                    <a href="${url}" target="_blank">Launch App Link â†—</a>
                </div>
            </body>
            </html>
        `;
    }
};

const SettingsApp = {
    init() {
        document.querySelectorAll('.theme-opt').forEach(opt => {
            opt.addEventListener('click', () => {
                const selectedGradient = opt.getAttribute('data-color');
                document.documentElement.style.setProperty('--desktop-bg', selectedGradient);
            });
        });
    }
};

const StartMenu = {
    menu: document.getElementById('start-menu'),
    trigger: document.getElementById('start-trigger'),

    init() {
        this.trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        document.getElementById('action-power').addEventListener('click', () => {
            if (confirm("Shutdown standard WebOS execution environment?")) {
                document.body.innerHTML = "<div style='color:#a855f7; background:#020617; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:15px; letter-spacing:1px; font-weight:500;'>CORE SYSTEM REBOOT: Environment cleanly unmounted.</div>";
            }
        });
    },
    toggle() { this.menu.classList.toggle('visible'); },
    close() { this.menu.classList.remove('visible'); }
};

const SystemClock = {
    element: document.getElementById('os-clock'),
    run() {
        const tick = () => {
            const time = new Date();
            let h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            m = m < 10 ? '0' + m : m;
            s = s < 10 ? '0' + s : s;
            this.element.textContent = `${h}:${m}:${s} ${ampm}`;
        };
        tick(); setInterval(tick, 1000);
    }
};

// Start OS Kernel
document.addEventListener('DOMContentLoaded', () => {
    OS.init();
    Calculator.init();
    NotepadApp.init();
    SettingsApp.init();
    StartMenu.init();
});