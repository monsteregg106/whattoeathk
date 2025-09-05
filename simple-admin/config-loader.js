// Simple Configuration Loader for Fortune Wheel
// This script loads admin-configured content into your app

class SimpleConfigLoader {
    constructor() {
        this.config = null;
        this.defaultConfig = {
            currentLanguage: "en",
            languages: {
                en: {
                    header: {
                        title: "🍽️ What to Eat Tonight?",
                        subtitle: "Let the magic decide your next delicious meal"
                    },
                    wheelSegments: [
                        { name: "Italian", icon: "🍕", color: "#FF6B9D", description: "Time for some delicious pasta, pizza, or risotto!", imageUrl: null },
                        { name: "Chinese", icon: "🥢", color: "#6BCF7F", description: "Enjoy authentic flavors from the Middle Kingdom!", imageUrl: null },
                        { name: "Mexican", icon: "🌮", color: "#FFD93D", description: "Spice up your night with vibrant Mexican cuisine!", imageUrl: null },
                        { name: "Japanese", icon: "🍣", color: "#4D7EA8", description: "Experience the art of Japanese culinary perfection!", imageUrl: null },
                        { name: "Indian", icon: "🍛", color: "#2D2A87", description: "Indulge in rich spices and aromatic curries!", imageUrl: null },
                        { name: "American", icon: "🍔", color: "#FF6B9D", description: "Classic comfort food to satisfy your cravings!", imageUrl: null }
                    ],
                    buttons: {
                        spinButton: "PRESS TO SPIN",
                        feelingLucky: "📖 Bookmark This",
                        resetWheel: "🔄 Reset Wheel"
                    },
                    popup: {
                        title: "Your Culinary Destiny Awaits!",
                        findRestaurants: "📍 Find Restaurants",
                        spinAgain: "🎯 Spin Again",
                        closeButton: "✖️ Close",
                        popularOptions: {
                            enabled: true,
                            title: "Popular Options:",
                            suggestions: [
                                "Chef's Special",
                                "House Favorite",
                                "Customer Choice",
                                "Today's Recommendation"
                            ]
                        }
                    }
                },
                zh_hk: {
                    header: {
                        title: "🍽️ 今晚食咩好？",
                        subtitle: "讓命運決定你嘅下一餐美食"
                    },
                    wheelSegments: [
                        { name: "意大利菜", icon: "🍕", color: "#FF6B9D", description: "品嚐美味嘅意粉、薄餅或者意式燴飯！", imageUrl: null },
                        { name: "中菜", icon: "🥢", color: "#6BCF7F", description: "享受正宗嘅中華美食風味！", imageUrl: null },
                        { name: "墨西哥菜", icon: "🌮", color: "#FFD93D", description: "用充滿活力嘅墨西哥菜為你嘅夜晚增添色彩！", imageUrl: null },
                        { name: "日本菜", icon: "🍣", color: "#4D7EA8", description: "體驗日本料理嘅精湛藝術！", imageUrl: null },
                        { name: "印度菜", icon: "🍛", color: "#2D2A87", description: "沉醉於豐富嘅香料同芳香嘅咖喱！", imageUrl: null },
                        { name: "美式菜", icon: "🍔", color: "#FF6B9D", description: "經典嘅comfort food滿足你嘅渴望！", imageUrl: null }
                    ],
                    buttons: {
                        spinButton: "按此轉盤",
                        feelingLucky: "📖 加入書籤",
                        resetWheel: "🔄 重設轉盤"
                    },
                    popup: {
                        title: "你嘅美食命運等緊你！",
                        findRestaurants: "📍 搵附近餐廳",
                        spinAgain: "🎯 再轉一次",
                        closeButton: "✖️ 關閉",
                        popularOptions: {
                            enabled: true,
                            title: "熱門選擇：",
                            suggestions: [
                                "主廚特薦",
                                "招牌菜式",
                                "客人推薦",
                                "今日精選"
                            ]
                        }
                    }
                }
            },
            character: {
                imagePath: "Cat.png",
                enabled: true
            }
        };
        this.isReady = false;
        this.readyCallbacks = [];
    }

    // Method to register callbacks when config is ready
    onReady(callback) {
        if (this.isReady) {
            callback();
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    // Method to notify when config is ready
    notifyReady() {
        this.isReady = true;
        this.readyCallbacks.forEach(callback => callback());
        this.readyCallbacks = [];
    }

    async loadConfig() {
        try {
            // Prefer server (most up-to-date across devices)
            try {
                const res = await fetch('/.netlify/functions/get-config', { headers: { 'Cache-Control': 'no-store' } });
                if (res.ok) {
                    const json = await res.json();
                    if (json && json.languages) {
                        this.config = json;
                        try { localStorage.setItem('fortuneWheelConfig', JSON.stringify(json)); } catch (_) {}
                        console.log('✅ Using configuration from server');
                        return this.config;
                    }
                }
            } catch (e) {
                console.log('ℹ️ Server config unavailable, trying localStorage/file');
            }

            // Prefer localStorage (fallback)
            const savedConfig = localStorage.getItem('fortuneWheelConfig');
            if (savedConfig) {
                try {
                    const parsedSaved = JSON.parse(savedConfig);
                    if (parsedSaved.languages) {
                        this.config = parsedSaved;
                        console.log('✅ Using configuration from localStorage');
                        return this.config;
                    }
                } catch (_) {}
            }

            // Try to load from JSON file next
            const configPath = window.location.pathname.includes('simple-admin') 
                ? 'config.json' 
                : 'simple-admin/config.json';
            
            console.log('🔍 Trying to load config from:', configPath);
            
            // Check if we're running from file:// protocol (local files)
            const isLocalFile = window.location.protocol === 'file:';
            if (isLocalFile) {
                console.log('⚠️ Running from local file system - CORS restrictions may apply');
            }
            
            const response = await fetch(configPath);
            if (response.ok) {
                const jsonConfig = await response.json();
                console.log('✅ Loaded configuration from JSON file');
                
                this.config = jsonConfig;
                
                return this.config;
            }

            throw new Error('Config file not found');
        } catch (error) {
            const configPath = window.location.pathname.includes('simple-admin') 
                ? 'config.json' 
                : 'simple-admin/config.json';
                
            console.log('⚠️ Could not load configuration from file. Error:', error.message);
            console.log('🔍 Debug info:', {
                currentPath: window.location.pathname,
                triedPath: configPath,
                protocol: window.location.protocol,
                hasLocalStorage: !!localStorage.getItem('fortuneWheelConfig'),
                error: error.message
            });
            
            // Check if we have a valid config in localStorage
            const savedConfig = localStorage.getItem('fortuneWheelConfig');
            if (savedConfig) {
                try {
                    const parsedSaved = JSON.parse(savedConfig);
                    if (parsedSaved.languages) {
                        this.config = parsedSaved;
                        console.log('✅ Using configuration from localStorage (file loading failed due to CORS)');
                        return this.config;
                    }
                } catch (e) {
                    console.warn('⚠️ Invalid localStorage config, using defaults');
                }
            }
            
            // If all else fails, use default config
            console.log('🔄 Using default configuration');
            this.config = this.defaultConfig;
            return this.config;
        }
    }

    getCurrentLanguageData() {
        if (!this.config || !this.config.languages) {
            return this.defaultConfig.languages.en;
        }
        
        const currentLang = this.config.currentLanguage || 'en';
        return this.config.languages[currentLang] || this.config.languages.en;
    }

    applyConfigToApp() {
        if (!this.config) {
            console.error('❌ No configuration loaded');
            return;
        }

        console.log('🎨 Applying configuration to app...');

        // Update header
        this.updateHeader();
        
        // Update buttons
        this.updateButtons();
        
        // Update popup content
        this.updatePopup();
        
        // Update wheel segments (if FortuneWheel exists)
        this.updateWheelSegments();
        
        // Update character image
        this.updateCharacterImage();
        
        // Update Cat Love image used in result popup/share
        this.updateCatLoveImage();

        console.log('✅ Configuration applied successfully');
        
        // Hide loading overlay and show app content
        this.hideLoadingOverlay();
        
        // Notify that config is ready
        this.notifyReady();
        
        // Also trigger a global event for debugging
        window.dispatchEvent(new CustomEvent('configReady'));
    }

    hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const appContainer = document.querySelector('.app-container');
        
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
        
        if (appContainer) {
            appContainer.style.opacity = '1';
            appContainer.style.transition = 'opacity 0.3s ease-in-out';
        }
        
        console.log('🎭 Loading overlay hidden, app content visible');
    }

    updateHeader() {
        const titleElement = document.querySelector('.app-title');
        const subtitleElement = document.querySelector('.app-subtitle');
        const langData = this.getCurrentLanguageData();
        
        if (titleElement && langData.header.title) {
            titleElement.textContent = langData.header.title;
        }
        
        if (subtitleElement && langData.header.subtitle) {
            subtitleElement.textContent = langData.header.subtitle;
        }
    }

    updateButtons() {
        const spinText = document.querySelector('.spin-text');
        const luckyButton = document.getElementById('feelingLucky');
        const resetButton = document.getElementById('resetWheel');
        const shareButton = document.getElementById('shareResult');
        const langData = this.getCurrentLanguageData();
        
        if (spinText && langData.buttons.spinButton) {
            spinText.textContent = langData.buttons.spinButton;
        }
        
        if (luckyButton && langData.buttons.feelingLucky) {
            luckyButton.textContent = langData.buttons.feelingLucky;
        }
        
        if (resetButton && langData.buttons.resetWheel) {
            resetButton.textContent = langData.buttons.resetWheel;
        }

        if (shareButton && langData.buttons?.shareResult) {
            shareButton.textContent = langData.buttons.shareResult;
        }

        // Update Share popup dynamic buttons if a popup is open
        const sharePopup = document.getElementById('sharePopup');
        if (sharePopup) {
            const shareBtn = sharePopup.querySelector('.share-btn.share-btn-primary');
            const downloadBtn = sharePopup.querySelector('.share-btn.download-btn');
            if (shareBtn && langData.popup?.sharePopupShare) shareBtn.textContent = langData.popup.sharePopupShare;
            if (downloadBtn && langData.popup?.sharePopupDownload) downloadBtn.textContent = langData.popup.sharePopupDownload;
        }
    }

    updatePopup() {
        const popupTitle = document.querySelector('.popup-header h2');
        const findRestaurantsBtn = document.getElementById('findRestaurants');
        const spinAgainBtn = document.getElementById('spinAgain');
        const langData = this.getCurrentLanguageData();
        
        if (popupTitle && langData.popup.title) {
            popupTitle.textContent = langData.popup.title;
        }
        
        if (findRestaurantsBtn && langData.popup.findRestaurants) {
            findRestaurantsBtn.textContent = langData.popup.findRestaurants;
        }
        
        if (spinAgainBtn && langData.popup.spinAgain) {
            spinAgainBtn.textContent = langData.popup.spinAgain;
        }
    }

    updateWheelSegments() {
        console.log('🎡 Attempting to update wheel segments...');
        
        // Wait for FortuneWheel to be available
        const updateWheel = () => {
            const langData = this.getCurrentLanguageData();
            console.log('📋 Language data:', langData);
            console.log('🎡 FortuneWheel available:', !!window.fortuneWheel);
            console.log('📊 Wheel segments in config:', langData.wheelSegments?.length || 0);
            
            if (window.fortuneWheel && langData.wheelSegments) {
                // Convert config format to FortuneWheel format
                const wheelCuisines = langData.wheelSegments.map(segment => ({
                    name: segment.name,
                    icon: segment.icon,
                    color: segment.color,
                    description: segment.description,
                    imageUrl: segment.imageUrl,
                    suggestions: [
                        `${segment.name} Special`,
                        `Classic ${segment.name}`,
                        `${segment.name} Favorite`,
                        `Traditional ${segment.name}`
                    ]
                }));

                console.log('🔄 Converting segments:', wheelCuisines);

                // Update FortuneWheel data
                window.fortuneWheel.cuisines = wheelCuisines;
                window.fortuneWheel.segments = wheelCuisines.length;
                window.fortuneWheel.segmentAngle = (Math.PI * 2) / wheelCuisines.length;
                
                // Redraw the wheel
                if (window.fortuneWheel.drawWheel) {
                    window.fortuneWheel.drawWheel();
                    console.log('✅ Successfully updated wheel with', wheelCuisines.length, 'segments');
                } else {
                    console.warn('⚠️ FortuneWheel.drawWheel method not available');
                }
                return true;
            } else {
                console.warn('⚠️ FortuneWheel not ready or no wheel segments in config');
                console.log('FortuneWheel:', window.fortuneWheel);
                console.log('Wheel segments:', langData.wheelSegments);
                return false;
            }
        };

        // Try updating immediately
        if (!updateWheel()) {
            console.log('⏳ FortuneWheel not ready, setting up retry mechanism...');
            // If FortuneWheel isn't ready, wait and try again
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds with 100ms intervals
            
            const checkInterval = setInterval(() => {
                attempts++;
                console.log(`🔄 Attempt ${attempts}/${maxAttempts} to update wheel segments...`);
                
                if (updateWheel()) {
                    console.log('✅ Wheel segments updated successfully!');
                    clearInterval(checkInterval);
                } else if (attempts >= maxAttempts) {
                    console.error('❌ Failed to update wheel segments after', maxAttempts, 'attempts');
                    clearInterval(checkInterval);
                }
            }, 100);
            
            // Stop trying after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                console.log('⏰ Wheel segment update timeout reached');
            }, 5000);
        }
    }

    updateCharacterImage() {
        const characterImg = document.querySelector('.character-image');
        if (characterImg && this.config.character && this.config.character.imagePath) {
            // Handle both file paths and data URLs
            if (this.config.character.imagePath.startsWith('data:')) {
                // Base64 data URL from admin upload
                characterImg.src = this.config.character.imagePath;
            } else {
                // Regular file path
                characterImg.src = this.config.character.imagePath;
            }
            console.log('🐱 Updated character image');
        }
    }

    // Update Cat Love image inside the result popup (use images array; fallback to legacy imagePath)
    updateCatLoveImage() {
        try {
            // Scope to result popup image only, avoid share popup images
            const catImgEl = document.querySelector('#resultPopup .chef-cat-image');
            if (!catImgEl) return;

            let src = null;
            const images = this.config?.catLove?.images;
            if (Array.isArray(images)) {
                src = images.find(x => typeof x === 'string' && x.length > 0) || null;
            }
            if (!src) {
                const legacy = this.config?.catLove?.imagePath;
                if (typeof legacy === 'string' && legacy.length > 0) src = legacy;
            }
            if (src) {
                catImgEl.src = src;
                console.log('💖 Updated Cat Love image in popup from config (array/legacy)');
            }
        } catch (e) {
            console.warn('⚠️ Could not update Cat Love image:', e?.message || e);
        }
    }

    // Language switching functionality
    switchLanguage(newLang) {
        if (!this.config) return;
        
        this.config.currentLanguage = newLang;
        
        // Save to localStorage
        localStorage.setItem('fortuneWheelConfig', JSON.stringify(this.config));
        
        // Update the UI
        this.applyConfigToApp();
        this.updateLanguageButton();
        
        console.log(`🌍 Language switched to: ${newLang}`);
    }

    updateLanguageButton() {
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            const currentLang = this.config?.currentLanguage || 'en';
            langBtn.textContent = currentLang === 'en' ? '中文' : 'English';
        }
    }

    // Method to refresh configuration (useful for admin panel)
    async refreshConfig() {
        await this.loadConfig();
        this.applyConfigToApp();
        this.updateLanguageButton();
        console.log('🔄 Configuration refreshed');
    }
    
    // Force reload configuration from localStorage (for admin changes)
    forceReloadFromStorage() {
        const savedConfig = localStorage.getItem('fortuneWheelConfig');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
                this.applyConfigToApp();
                this.updateLanguageButton();
                console.log('🔄 Force reloaded configuration from localStorage');
                return true;
            } catch (e) {
                console.error('❌ Error parsing saved config:', e);
                return false;
            }
        }
        console.log('⚠️ No saved configuration found in localStorage');
        return false;
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Simple Config Loader...');
    
    // Ensure loading overlay is visible and app content is hidden
    const loadingOverlay = document.getElementById('loadingOverlay');
    const appContainer = document.querySelector('.app-container');
    
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
    }
    
    if (appContainer) {
        appContainer.style.opacity = '0';
    }
    
    try {
        const configLoader = new SimpleConfigLoader();
        await configLoader.loadConfig();
        
        console.log('📋 Config loaded:', configLoader.config);
        
        // Apply configuration immediately without delay
        console.log('🎨 Applying configuration...');
        configLoader.applyConfigToApp();
        
        // Make it globally available for debugging
        window.configLoader = configLoader;
        
        // Set up language toggle
        const langToggle = document.getElementById('langToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                const currentLang = configLoader.config?.currentLanguage || 'en';
                const newLang = currentLang === 'en' ? 'zh_hk' : 'en';
                configLoader.switchLanguage(newLang);
            });
        }
        
        // Set up manual load button
        const manualLoadBtn = document.getElementById('manualLoadBtn');
        if (manualLoadBtn) {
            manualLoadBtn.addEventListener('click', () => {
                console.log('🔄 Manual load triggered by user');
                configLoader.forceReloadFromStorage();
                if (loadingOverlay) {
                    loadingOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 300);
                }
                if (appContainer) {
                    appContainer.style.opacity = '1';
                }
            });
        }
        
        // Show manual load button after 3 seconds if still loading
        setTimeout(() => {
            if (loadingOverlay && loadingOverlay.style.display !== 'none') {
                if (manualLoadBtn) {
                    manualLoadBtn.style.display = 'block';
                }
            }
        }, 3000);
        
        // Update language button text
        configLoader.updateLanguageButton();
        
        // Listen for storage changes (admin panel updates)
        window.addEventListener('storage', (e) => {
            if (e.key === 'fortuneWheelConfig') {
                console.log('📦 Storage changed, reloading configuration...');
                configLoader.forceReloadFromStorage();
            }
        });
        
        // Also listen for focus events (when returning from admin panel)
        window.addEventListener('focus', () => {
            console.log('👁️ Window focused, checking for config updates...');
            configLoader.forceReloadFromStorage();
        });
        
        console.log('✅ Config loader initialized successfully');
        
    } catch (error) {
        console.error('❌ Config loader failed to initialize:', error);
        console.log('🔄 Falling back to default behavior');
        
        // Even on error, hide loading and show content
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
        
        if (appContainer) {
            appContainer.style.opacity = '1';
        }
    }
});

// Developer-only hotkey: Ctrl+Alt+A opens the admin panel in a new tab
// Removed developer hotkey to open admin panel

// Admin panel button removed per request
