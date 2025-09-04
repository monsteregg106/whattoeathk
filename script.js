// Fortune Wheel - What to Eat Tonight App
class FortuneWheel {
    constructor() {
        this.canvas = document.getElementById('wheelCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.spinButton = document.getElementById('spinButton');
        this.resultPopup = document.getElementById('resultPopup');
        
        // Cuisine data with Google-aligned categories
        this.cuisines = [
            {
                name: 'Italian',
                icon: '🍕',
                color: '#FF6B9D',
                suggestions: ['Pizza Margherita', 'Spaghetti Carbonara', 'Lasagna', 'Risotto'],
                description: 'Time for some delicious pasta, pizza, or risotto!'
            },
            {
                name: 'Chinese',
                icon: '🥢',
                color: '#6BCF7F',
                suggestions: ['Sweet & Sour Pork', 'Fried Rice', 'Dim Sum', 'Kung Pao Chicken'],
                description: 'Enjoy authentic flavors from the Middle Kingdom!'
            },
            {
                name: 'Mexican',
                icon: '🌮',
                color: '#FFD93D',
                suggestions: ['Tacos al Pastor', 'Burritos', 'Quesadillas', 'Nachos'],
                description: 'Spice up your night with vibrant Mexican cuisine!'
            },
            {
                name: 'Japanese',
                icon: '🍣',
                color: '#4D7EA8',
                suggestions: ['Sushi Rolls', 'Ramen', 'Tempura', 'Teriyaki Chicken'],
                description: 'Experience the art of Japanese culinary perfection!'
            },
            {
                name: 'Indian',
                icon: '🍛',
                color: '#2D2A87',
                suggestions: ['Butter Chicken', 'Biryani', 'Tikka Masala', 'Naan Bread'],
                description: 'Indulge in rich spices and aromatic curries!'
            },
            {
                name: 'American',
                icon: '🍔',
                color: '#FF6B9D',
                suggestions: ['Cheeseburger', 'BBQ Ribs', 'Mac & Cheese', 'Buffalo Wings'],
                description: 'Classic comfort food to satisfy your cravings!'
            },
            {
                name: 'Thai',
                icon: '🍜',
                color: '#6BCF7F',
                suggestions: ['Pad Thai', 'Green Curry', 'Tom Yum Soup', 'Mango Sticky Rice'],
                description: 'Balance sweet, sour, salty, and spicy in perfect harmony!'
            },
            {
                name: 'French',
                icon: '🥐',
                color: '#FFD93D',
                suggestions: ['Coq au Vin', 'Croissants', 'French Onion Soup', 'Crème Brûlée'],
                description: 'Sophisticated flavors from the culinary capital of the world!'
            }
        ];
        
        this.currentRotation = 0;
        this.isSpinning = false;
        this.wheelRadius = 172.5;
        this.segments = this.cuisines.length;
        this.segmentAngle = (Math.PI * 2) / this.segments;
        this.hoveredSegment = -1;
        this.mouseX = 0;
        this.mouseY = 0;
        this.imageCache = {}; // Cache for custom images
        
        // Don't initialize immediately - wait for config
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        this.drawWheel();
        this.bindEvents();
        this.initialized = true;
        // Character messages disabled
    }
    
    lightenColor(color, percent) {
        // Convert color to RGB and lighten it
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    getMouseSegment(mouseX, mouseY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const rect = this.canvas.getBoundingClientRect();
        
        // Get accurate canvas scaling
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        // Adjust for canvas position and scaling
        const x = (mouseX - rect.left) * scaleX - centerX;
        const y = (mouseY - rect.top) * scaleY - centerY;
        
        // Check if mouse is within wheel radius
        const distance = Math.sqrt(x * x + y * y);
        if (distance > this.wheelRadius || distance < 50) return -1;
        
        // Calculate angle with improved precision
        let angle = Math.atan2(y, x);
        
        // Normalize angle to 0-2π range
        if (angle < 0) angle += Math.PI * 2;
        
        // Adjust for current rotation - pointer points up (1.5π)
        let adjustedAngle = angle - this.currentRotation + Math.PI * 1.5;
        
        // Normalize adjusted angle
        while (adjustedAngle < 0) adjustedAngle += Math.PI * 2;
        while (adjustedAngle >= Math.PI * 2) adjustedAngle -= Math.PI * 2;
        
        // Find which segment with better precision
        const segmentIndex = Math.floor(adjustedAngle / this.segmentAngle);
        
        // Ensure valid segment index
        if (segmentIndex >= 0 && segmentIndex < this.segments) {
            return segmentIndex;
        }
        
        return -1;
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw wheel segments
        for (let i = 0; i < this.segments; i++) {
            const startAngle = i * this.segmentAngle + this.currentRotation;
            const endAngle = (i + 1) * this.segmentAngle + this.currentRotation;
            const isHovered = this.hoveredSegment === i;
            
            // No radius change to prevent overflow - only visual effects
            const segmentRadius = this.wheelRadius;
            
            // Draw segment
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, segmentRadius, startAngle, endAngle);
            this.ctx.lineTo(centerX, centerY);
            
            // Apply hover color effect
            if (isHovered) {
                this.ctx.fillStyle = this.lightenColor(this.cuisines[i].color, 25);
                this.ctx.shadowColor = this.cuisines[i].color;
                this.ctx.shadowBlur = 20;
            } else {
                this.ctx.fillStyle = this.cuisines[i].color;
                this.ctx.shadowBlur = 0;
            }
            this.ctx.fill();
            
            // Draw segment border with enhanced hover effect
            this.ctx.strokeStyle = isHovered ? '#ffffff' : '#ffffff';
            this.ctx.lineWidth = isHovered ? 3 : 1;
            if (isHovered) {
                this.ctx.shadowColor = '#ffffff';
                this.ctx.shadowBlur = 8;
            }
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw text and icon - positioned closer to center to ensure containment
            const textAngle = startAngle + this.segmentAngle / 2;
            const textRadius = segmentRadius * 0.65; // Reduced from 0.7 to 0.65 for better containment
            const textX = centerX + Math.cos(textAngle) * textRadius;
            const textY = centerY + Math.sin(textAngle) * textRadius;
            
            this.ctx.save();
            this.ctx.translate(textX, textY);
            this.ctx.rotate(textAngle + Math.PI / 2);
            
            // Draw cuisine icon with hover enlarge effect only on icons
            const iconSize = isHovered ? 56 : 52; // Icons enlarge on hover (can step over wheel)
            const textSize = 13; // Text size reduced to 13px
            
            // Check if we have a custom image or use emoji
            if (this.cuisines[i].imageUrl) {
                // Use custom image - load and cache it
                if (!this.imageCache) this.imageCache = {};
                
                if (this.imageCache[this.cuisines[i].imageUrl]) {
                    // Image is cached, draw immediately
                    const img = this.imageCache[this.cuisines[i].imageUrl];
                    this.ctx.save();
                    
                    // Match emoji positioning and effects exactly
                    // Emoji actual visual size is much larger than font size due to font rendering
                    const imgSize = isHovered ? 72 : 68; // Larger to match actual emoji visual size
                    
                    if (isHovered) {
                        // Match emoji glow effect
                        this.ctx.shadowColor = '#ffffff';
                        this.ctx.shadowBlur = 12;
                        // Draw image centered at exact emoji position (0, -8)
                        this.ctx.drawImage(img, -imgSize/2, -8-imgSize/2, imgSize, imgSize);
                        
                        // Second pass for stronger glow (like emoji)
                        this.ctx.shadowBlur = 6;
                        this.ctx.drawImage(img, -imgSize/2, -8-imgSize/2, imgSize, imgSize);
                    } else {
                        this.ctx.shadowBlur = 0;
                        // Draw image centered at exact emoji position (0, -8)
                        this.ctx.drawImage(img, -imgSize/2, -8-imgSize/2, imgSize, imgSize);
                    }
                    this.ctx.restore();
                } else {
                    // Load image and cache it
                    const img = new Image();
                    img.onload = () => {
                        this.imageCache[this.cuisines[i].imageUrl] = img;
                        // Redraw the wheel when image loads
                        this.drawWheel();
                    };
                    img.src = this.cuisines[i].imageUrl;
                    
                    // Show fallback emoji while loading
                    this.ctx.font = `${iconSize}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle'; // Consistent baseline
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText(this.cuisines[i].icon, 0, -8);
                }
            } else {
                // Use emoji icon
                this.ctx.font = `${iconSize}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle'; // Explicitly set baseline for consistency
                
                // Enhanced hover effects - enlarge and glow only for icons
                if (isHovered) {
                    // Glow effect for icon
                    this.ctx.shadowColor = '#ffffff';
                    this.ctx.shadowBlur = 12;
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText(this.cuisines[i].icon, 0, -8);
                    
                    // Second pass for stronger glow
                    this.ctx.shadowBlur = 6;
                    this.ctx.fillText(this.cuisines[i].icon, 0, -8);
                } else {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.shadowBlur = 0;
                    this.ctx.fillText(this.cuisines[i].icon, 0, -8);
                }
            }
            
            // Reset shadow for text
            this.ctx.shadowBlur = 0;
            
            // Draw cuisine name - NO hover effects, stays constant
            // Use different fonts for better Chinese character support
            const isChinese = /[\u4e00-\u9fff]/.test(this.cuisines[i].name);
            if (isChinese) {
                this.ctx.font = `bold ${textSize}px "Microsoft YaHei", "SimHei", "Arial Unicode MS", Arial`;
            } else {
                this.ctx.font = `bold ${textSize}px Inter, Arial`;
            }
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Measure text width to ensure it fits
            const textMetrics = this.ctx.measureText(this.cuisines[i].name);
            const maxWidth = segmentRadius * 0.8; // Maximum width for text
            
            if (textMetrics.width > maxWidth) {
                // Scale down font if text is too wide
                const scaleFactor = maxWidth / textMetrics.width;
                const adjustedSize = Math.max(10, textSize * scaleFactor);
                if (isChinese) {
                    this.ctx.font = `bold ${adjustedSize}px "Microsoft YaHei", "SimHei", "Arial Unicode MS", Arial`;
                } else {
                    this.ctx.font = `bold ${adjustedSize}px Inter, Arial`;
                }
            }
            
            this.ctx.fillText(this.cuisines[i].name, 0, 35);
            
            this.ctx.restore();
        }
        
        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#dddddd';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.classList.add('spinning');
        this.hoveredSegment = -1; // Clear hover state
        this.updateCharacterMessage("✨ The magic is happening! Let me see what the universe has planned...");
        this.animateCharacter('concentrating');
        
        // Trigger magic stars effect
        this.triggerMagicStars();
        
        // Generate random spin with equal probability for each segment
        const minSpins = 4;
        const maxSpins = 8;
        const baseSpins = Math.random() * (maxSpins - minSpins) + minSpins;
        
        // Randomly select which segment should be pointed to (equal probability)
        const randomSegment = Math.floor(Math.random() * this.segments);
        // Add small random offset within the segment for natural appearance
        const randomOffset = (Math.random() - 0.5) * this.segmentAngle * 0.6; // ±30% of segment width
        const targetAngle = randomSegment * this.segmentAngle + (this.segmentAngle / 2) + randomOffset;
        
        // Calculate final rotation to land on the target segment
        // Pointer points at 1.5π, so we need to account for that
        const pointerOffset = Math.PI * 1.5;
        const finalRotation = this.currentRotation + baseSpins * Math.PI * 2 + (pointerOffset - targetAngle);
        
        const startTime = performance.now();
        const duration = 3200; // 3.2 seconds for more dramatic effect
        const startRotation = this.currentRotation;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // More sophisticated easing for realistic deceleration
            let easeOut;
            if (progress < 0.7) {
                // Fast initial spin
                easeOut = progress * 1.2;
            } else {
                // Smooth deceleration
                const slowProgress = (progress - 0.7) / 0.3;
                easeOut = 0.84 + 0.16 * (1 - Math.pow(1 - slowProgress, 4));
            }
            
            this.currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure final position is set
                this.currentRotation = finalRotation;
                this.drawWheel();
                this.onSpinComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    spinToSegment(targetSegment) {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        this.spinButton.classList.add('spinning');
        this.hoveredSegment = -1; // Clear hover state
        this.updateCharacterMessage(`✨ Guiding the wheel to ${this.cuisines[targetSegment].name}...`);
        
        // Trigger magic stars effect
        this.triggerMagicStars();
        
        // Calculate precise target rotation
        const targetAngleCenter = targetSegment * this.segmentAngle + this.segmentAngle / 2;
        
        // Current rotation normalized to 0-2π
        let currentNormalized = this.currentRotation % (Math.PI * 2);
        if (currentNormalized < 0) currentNormalized += Math.PI * 2;
        
        // Target for pointer to point at segment center (pointer at 1.5π)
        let targetRotation = Math.PI * 1.5 - targetAngleCenter;
        
        // Add multiple rotations for visual effect (2-3 full rotations)
        const extraRotations = Math.PI * 2 * (2 + Math.random());
        
        // Find shortest path to target
        while (targetRotation < currentNormalized) {
            targetRotation += Math.PI * 2;
        }
        
        const finalRotation = this.currentRotation + (targetRotation - currentNormalized) + extraRotations;
        
        const startTime = performance.now();
        const duration = 1800; // 1.8 seconds for snappier feel
        const startRotation = this.currentRotation;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Improved easing function for more natural feel
            const easeOut = 1 - Math.pow(1 - progress, 4);
            
            this.currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Ensure exact final position
                this.currentRotation = finalRotation;
                this.drawWheel();
                this.onSpinComplete();
            }
        };
        
        requestAnimationFrame(animate);
    }

    onSpinComplete() {
        this.isSpinning = false;
        this.spinButton.classList.remove('spinning');
        
        // Stop magic stars effect
        this.stopMagicStars();
        
        // Calculate which segment the pointer is pointing to
        const normalizedRotation = (this.currentRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const pointerAngle = (Math.PI * 1.5 - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
        const selectedIndex = Math.floor(pointerAngle / this.segmentAngle);
        const selectedCuisine = this.cuisines[selectedIndex];
        
        // Update character message
        this.updateCharacterMessage(`🎉 The stars have spoken! ${selectedCuisine.name} cuisine awaits you!`);
        this.animateCharacter('happy');
        
        // Show result popup
        this.showResult(selectedCuisine);
    }
    
    showResult(cuisine) {
        // Update popup content
        const resultIconElement = document.getElementById('resultIcon');
        
        // Handle custom image or emoji icon in popup
        if (cuisine.imageUrl) {
            // Create image element for custom image
            resultIconElement.innerHTML = '';
            const img = document.createElement('img');
            img.src = cuisine.imageUrl;
            img.style.width = '180px';
            img.style.height = '180px';
            img.style.objectFit = 'contain';
            img.alt = cuisine.name;
            resultIconElement.appendChild(img);
        } else {
            // Use emoji icon
            resultIconElement.innerHTML = '';
            resultIconElement.textContent = cuisine.icon;
        }
        
        document.getElementById('resultCuisine').textContent = cuisine.name;
        document.getElementById('resultDescription').textContent = cuisine.description;
        
        // Select Cat Love image per spin from available images (config/localStorage)
        const chefCatImgEl = document.querySelector('.chef-cat-image');
        this.currentCatLoveDataUrl = null;
        try {
            const availableCats = this.getAvailableCatLoveImages();
            if (availableCats.length > 0) {
                const idx = Math.floor(Math.random() * availableCats.length);
                this.currentCatLoveDataUrl = availableCats[idx];
                if (chefCatImgEl) {
                    chefCatImgEl.src = this.currentCatLoveDataUrl;
                }
            }
        } catch (e) {
            console.log('⚠️ Could not select Cat Love image:', e);
        }

        // Update suggestions - use configured popular options
        const suggestionsList = document.getElementById('suggestionsList');
        const suggestionsContainer = document.querySelector('.result-suggestions');
        
        // Get popular options from the selected cuisine
        const popularOptions = cuisine.popularOptions;
        
        if (popularOptions && popularOptions.enabled && popularOptions.suggestions && popularOptions.suggestions.length > 0) {
            // Show suggestions section
            suggestionsContainer.style.display = 'block';
            
            // Update title
            const suggestionsTitle = suggestionsContainer.querySelector('h4');
            if (suggestionsTitle) {
                suggestionsTitle.textContent = popularOptions.title || 'Popular Options:';
            }
            
            // Update suggestions list
            suggestionsList.innerHTML = '';
            const suggestions = popularOptions.suggestions || [];
            suggestions.forEach(suggestion => {
                const item = document.createElement('div');
                item.className = 'suggestion-item';
                item.textContent = suggestion;
                suggestionsList.appendChild(item);
            });
        } else {
            // Hide suggestions section
            suggestionsContainer.style.display = 'none';
        }
        
        // Show popup with animation
        setTimeout(() => {
            this.resultPopup.classList.add('show');
        }, 500);
    }

    // Helper: collect available Cat Love images from config/localStorage (array-first, legacy fallback)
    getAvailableCatLoveImages() {
        const images = [];
        try {
            const cfg = window.configLoader?.config;
            if (cfg?.catLove?.images && Array.isArray(cfg.catLove.images)) {
                cfg.catLove.images.forEach(src => { if (src) images.push(src); });
            }
            // Legacy fallback
            if (images.length === 0 && cfg?.catLove?.imagePath) {
                images.push(cfg.catLove.imagePath);
            }
        } catch (_) {}
        try {
            const ls = localStorage.getItem('appConfig');
            if (ls) {
                const parsed = JSON.parse(ls);
                const lsImages = parsed?.catLove?.images;
                if (Array.isArray(lsImages)) {
                    lsImages.forEach(src => { if (src) images.push(src); });
                } else if (parsed?.catLove?.imagePath) {
                    images.push(parsed.catLove.imagePath);
                }
            }
        } catch (_) {}
        // Deduplicate while preserving order
        const seen = new Set();
        return images.filter(src => { if (seen.has(src)) return false; seen.add(src); return true; });
    }
    
    // Share result functionality
    async shareResult() {
        console.log('🚀 Share button clicked! Starting share process...');
        try {
            // Create a share-specific popup that reuses the result page structure
            const sharePopup = this.createSharePopup();
            
                    // Add share and download buttons to the popup
        const actionButtons = document.createElement('div');
        actionButtons.className = 'share-action-buttons';
        actionButtons.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 20px;
            padding: 20px;
        `;
        
        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '📥 Download';
        downloadBtn.className = 'share-btn download-btn';
        downloadBtn.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        downloadBtn.addEventListener('click', () => {
            console.log('📥 Download button clicked!');
            try {
                this.downloadShareCard(sharePopup);
            } catch (error) {
                console.error('❌ Download button error:', error);
                alert('Download failed: ' + error.message);
            }
        });
        
        // Share button
        const shareBtn = document.createElement('button');
        shareBtn.textContent = '📤 Share';
        shareBtn.className = 'share-btn share-btn-primary';
        shareBtn.style.cssText = `
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        `;
        shareBtn.addEventListener('click', () => {
            console.log('📤 Share button clicked!');
            try {
                this.shareShareCard(sharePopup);
            } catch (error) {
                console.error('❌ Share button error:', error);
                alert('Share failed: ' + error.message);
            }
        });
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.className = 'share-btn close-btn';
        closeBtn.style.cssText = `
            background: #f44336;
            color: white;
            border: none;
            padding: 12px 16px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            position: absolute;
            top: 20px;
            right: 20px;
        `;
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(sharePopup);
        });
        
        // Add buttons to popup
        actionButtons.appendChild(downloadBtn);
        actionButtons.appendChild(shareBtn);
        
        // Find the popup content element
        const popupContent = sharePopup.querySelector('.popup-content');
        if (popupContent) {
            popupContent.appendChild(actionButtons);
        } else {
            // Fallback: add directly to sharePopup
            sharePopup.appendChild(actionButtons);
        }
        
        sharePopup.appendChild(closeBtn);
        
        // Add it to the page
        document.body.appendChild(sharePopup);
        
        console.log('✅ Share popup with buttons created successfully');
            
        } catch (error) {
            console.error('❌ Error creating share image:', error);
            alert('Sorry, there was an error creating the share image. Please try again.');
        }
    }
    
    // Create a share-specific popup that reuses the result page structure
    createSharePopup() {
        console.log('🎨 Creating share popup...');
        
        // Get current result data
        const cuisineName = document.getElementById('resultCuisine').textContent;
        const cuisineDescription = document.getElementById('resultDescription').textContent;
        const resultIconElement = document.getElementById('resultIcon');
        
        // Get popup title from config
        let popupTitle = '🍽️ What to Eat Tonight?';
        try {
            if (window.configLoader && window.configLoader.config) {
                const currentLang = window.configLoader.config.currentLanguage || 'en';
                const langConfig = window.configLoader.config.languages[currentLang];
                if (langConfig && langConfig.popup && langConfig.popup.title) {
                    popupTitle = langConfig.popup.title;
                }
            }
        } catch (e) {
            console.log('⚠️ Could not get popup title from config, using default');
        }
        
        // Create the share popup with the same structure as result page
        const sharePopup = document.createElement('div');
        sharePopup.id = 'sharePopup';
        sharePopup.className = 'result-popup show share-popup';
        sharePopup.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 1;
            visibility: visible;
        `;
        
        // Create popup content with same structure as result page
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content share-popup-content';
        popupContent.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 90vw;
            max-height: 90vh;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
            overflow: hidden;
        `;
        
        // Create popup header (same as result page)
        const popupHeader = document.createElement('div');
        popupHeader.className = 'popup-header';
        
        // Add popup title
        const titleElement = document.createElement('h2');
        titleElement.textContent = popupTitle;
        titleElement.style.cssText = `
            margin: 0 0 20px 0;
            color: #333;
            font-size: 24px;
            font-weight: bold;
        `;
        popupHeader.appendChild(titleElement);
        
        // Create result cuisine display (same as result page)
        const resultCuisineDisplay = document.createElement('div');
        resultCuisineDisplay.className = 'result-cuisine-display';
        resultCuisineDisplay.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            margin-bottom: 20px;
        `;
        
        // Add chef cat character (same as result page)
        const chefCatCharacter = document.createElement('div');
        chefCatCharacter.className = 'chef-cat-character';
        chefCatCharacter.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const catImage = document.createElement('img');
        // Use the currently selected Cat Love image for this spin if available
        let catImageSrc = this.currentCatLoveDataUrl || null;
        if (!catImageSrc) {
            // Fallbacks (legacy paths)
            try {
                const existingCat = document.querySelector('.chef-cat-image');
                if (existingCat && existingCat.getAttribute('src')) {
                    catImageSrc = existingCat.getAttribute('src');
                }
            } catch (_) {}
            if (!catImageSrc) {
                catImageSrc = 'Cat love.png';
            }
        }
        catImage.src = catImageSrc;
        catImage.alt = 'Chef Cat Love';
        catImage.className = 'chef-cat-image';
        catImage.style.cssText = `
            width: 200px;
            height: 240px;
            object-fit: contain;
            border: none;
            box-shadow: none;
        `;
        chefCatCharacter.appendChild(catImage);
        
        // Add cuisine icon (same as result page)
        const cuisineIconElement = document.createElement('div');
        cuisineIconElement.id = 'shareResultIcon';
        cuisineIconElement.className = 'cuisine-icon';
        cuisineIconElement.style.cssText = `
            font-size: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0;
            width: 180px;
            height: 180px;
            min-width: 180px;
            min-height: 180px;
            max-width: 180px;
            max-height: 180px;
        `;
        
        // Copy the cuisine icon from the result page
        if (resultIconElement) {
            const imgElement = resultIconElement.querySelector('img');
            if (imgElement) {
                // It's a custom image - copy it
                const newImg = imgElement.cloneNode(true);
                newImg.style.cssText = `
                    width: 180px;
                    height: 180px;
                    object-fit: contain;
                `;
                cuisineIconElement.innerHTML = '';
                cuisineIconElement.appendChild(newImg);
            } else {
                // It's an emoji - copy the text
                cuisineIconElement.textContent = resultIconElement.textContent;
            }
        }
        
        resultCuisineDisplay.appendChild(chefCatCharacter);
        resultCuisineDisplay.appendChild(cuisineIconElement);
        popupHeader.appendChild(resultCuisineDisplay);
        
        // Create popup body (same as result page)
        const popupBody = document.createElement('div');
        popupBody.className = 'popup-body';
        
        // Add cuisine name
        const cuisineNameElement = document.createElement('h2');
        cuisineNameElement.id = 'shareCuisineName';
        cuisineNameElement.textContent = cuisineName;
        cuisineNameElement.style.cssText = `
            margin: 0 0 15px 0;
            color: #333;
            font-size: 32px;
            font-weight: bold;
        `;
        popupBody.appendChild(cuisineNameElement);
        
        // Add description
        const descriptionElement = document.createElement('p');
        descriptionElement.id = 'shareDescription';
        descriptionElement.textContent = cuisineDescription;
        descriptionElement.style.cssText = `
            margin: 0 0 20px 0;
            color: #666;
            font-size: 18px;
            line-height: 1.5;
        `;
        popupBody.appendChild(descriptionElement);
        
        // Add popular options if available (same as result page)
        const suggestionsContainer = document.querySelector('.result-suggestions');
        if (suggestionsContainer && suggestionsContainer.style.display !== 'none') {
            const suggestionsTitle = suggestionsContainer.querySelector('h4');
            const suggestionsList = document.getElementById('suggestionsList');
            
            if (suggestionsTitle && suggestionsList) {
                const shareSuggestionsContainer = document.createElement('div');
                shareSuggestionsContainer.className = 'result-suggestions';
                shareSuggestionsContainer.style.cssText = `
                    margin-top: 20px;
                    text-align: left;
                `;
                
                const shareSuggestionsTitle = document.createElement('h4');
                shareSuggestionsTitle.textContent = suggestionsTitle.textContent;
                shareSuggestionsTitle.style.cssText = `
                    margin: 0 0 10px 0;
                    color: #333;
                    font-size: 18px;
                    font-weight: bold;
                `;
                
                const shareSuggestionsList = document.createElement('div');
                shareSuggestionsList.id = 'shareSuggestionsList';
                shareSuggestionsList.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                `;
                
                // Copy suggestions
                const suggestions = Array.from(suggestionsList.querySelectorAll('.suggestion-item'));
                suggestions.forEach(suggestion => {
                    const shareSuggestion = document.createElement('div');
                    shareSuggestion.className = 'suggestion-item';
                    shareSuggestion.textContent = suggestion.textContent;
                    shareSuggestion.style.cssText = `
                        padding: 8px 12px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        color: #333;
                        font-size: 14px;
                    `;
                    shareSuggestionsList.appendChild(shareSuggestion);
                });
                
                shareSuggestionsContainer.appendChild(shareSuggestionsTitle);
                shareSuggestionsContainer.appendChild(shareSuggestionsList);
                popupBody.appendChild(shareSuggestionsContainer);
            }
        }
        
        // Assemble the popup
        popupContent.appendChild(popupHeader);
        popupContent.appendChild(popupBody);
        sharePopup.appendChild(popupContent);
        
        console.log('✅ Share popup created successfully');
        console.log('📋 Popup content:', sharePopup.innerHTML.substring(0, 200) + '...');
        console.log('🖼️ Cat image src:', catImage.src);
        console.log('🍕 Cuisine icon content:', cuisineIconElement.textContent || cuisineIconElement.innerHTML);
        return sharePopup;
    }
    
    // Download the share card
    downloadShareCard(sharePopup) {
        console.log('📥 Downloading share card...');
        
        // Try multiple methods to capture the popup as an image
        this.capturePopupAsImage(sharePopup, 'download');
    }
    
    // Share the share card
    shareShareCard(sharePopup) {
        console.log('📤 Sharing share card...');
        
        // Try multiple methods to capture the popup as an image
        this.capturePopupAsImage(sharePopup, 'share');
    }
    
    // Capture popup as image using multiple methods
    capturePopupAsImage(sharePopup, action) {
        console.log(`🖼️ Capturing popup as image for ${action}...`);
        
        // NEW APPROACH: SVG Generation
        this.createSVGImage(action);
    }
    
    // NEW APPROACH: SVG Generation
    createSVGImage(action) {
        console.log('🎨 Creating SVG image...');
        
        // Check if Cat Love image is available
        this.checkCatLoveImageAvailability();
        
        // Get current result data
        const cuisineName = document.getElementById('resultCuisine').textContent;
        const cuisineDescription = document.getElementById('resultDescription').textContent;
        const resultIconElement = document.getElementById('resultIcon');
        
        // Get popup title from config
        let popupTitle = '🍽️ What to Eat Tonight?';
        try {
            if (window.configLoader && window.configLoader.config) {
                const currentLang = window.configLoader.config.currentLanguage || 'en';
                const langConfig = window.configLoader.config.languages[currentLang];
                if (langConfig && langConfig.popup && langConfig.popup.title) {
                    popupTitle = langConfig.popup.title;
                }
            }
        } catch (e) {
            console.log('⚠️ Could not get popup title from config, using default');
        }
        
        // Get popular options
        const suggestionsList = document.getElementById('suggestionsList');
        let popularOptions = [];
        if (suggestionsList) {
            const options = suggestionsList.querySelectorAll('li');
            popularOptions = Array.from(options).map(li => li.textContent.trim());
        }
        
        // Get cuisine emoji
        let cuisineEmoji = '🍽️';
        if (resultIconElement) {
            const img = resultIconElement.querySelector('img');
            if (img && img.src) {
                // It's a custom image, we'll use a placeholder
                cuisineEmoji = '🍽️';
                console.log('🖼️ Found cuisine image, using placeholder emoji');
            } else {
                cuisineEmoji = resultIconElement.textContent.trim();
                console.log('🖼️ Using cuisine emoji:', cuisineEmoji);
            }
        }
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '352');
        svg.setAttribute('height', '465');
        svg.setAttribute('viewBox', '0 0 352 465');
        
        // Add background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '352');
        background.setAttribute('height', '465');
        background.setAttribute('fill', '#ffffff');
        background.setAttribute('rx', '20');
        background.setAttribute('ry', '20');
        svg.appendChild(background);
        
        // Removed shadow effect to keep a clean, flat card
        
        // Add main content background
        const contentBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        contentBg.setAttribute('x', '10');
        contentBg.setAttribute('y', '10');
        contentBg.setAttribute('width', '332');
        contentBg.setAttribute('height', '435');
        contentBg.setAttribute('fill', '#ffffff');
        contentBg.setAttribute('rx', '20');
        contentBg.setAttribute('ry', '20');
        svg.appendChild(contentBg);

        // Removed manga-style burst background for a cleaner card
        
        // Add title with wrapping (keep current font size)
        const titleEndY = this.addWrappedCenteredSVGText(
            svg,
            popupTitle,
            176, // center X
            54,  // first line baseline
            292, // 20px side margins inside 332px inner width
            28,  // line height for 24px font
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
            24,  // font size per request
            '700',
            '#333333'
        );
        
        // Compute side-by-side image layout similar to result page
        const contentX = 10;
        const contentY = 10;
        const contentW = 332;
        const catBaseW = 200, catBaseH = 240; // from CSS .chef-cat-image
        const cuisineBaseW = 180, cuisineBaseH = 180; // from CSS .cuisine-icon
        const imageSpacing = 0; // gap: 0 to match result-cuisine-display
        const maxImagesWidth = contentW; // fit within inner card width
        const scale = Math.min(1, (maxImagesWidth) / (catBaseW + imageSpacing + cuisineBaseW));
        const catW = Math.round(catBaseW * scale);
        const catH = Math.round(catBaseH * scale);
        const cuisineW = Math.round(cuisineBaseW * scale);
        const cuisineH = Math.round(cuisineBaseH * scale);
        const totalW = catW + imageSpacing + cuisineW;
        const imagesX = contentX + Math.round((contentW - totalW) / 2);
        const maxH = Math.max(catH, cuisineH);
        const centerY = Math.round(titleEndY + 10 + (maxH / 2)); // under wrapped title with extra spacing

        // Add Cat Love image (as base64 or placeholder)
        this.addCatLoveImage(svg, imagesX, centerY - Math.round(catH / 2), catW, catH, () => {
            // Add cuisine image or emoji next to cat image
            this.addCuisineImage(svg, cuisineEmoji, imagesX + catW + imageSpacing, centerY - Math.round(cuisineH / 2), cuisineW, cuisineH, () => {
            
            // Add cuisine name (match h3 ~32px)
            const cuisineNameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            cuisineNameText.setAttribute('x', '176');
            const afterImagesY = centerY + Math.round(maxH / 2);
            cuisineNameText.setAttribute('y', String(afterImagesY + 40));
            cuisineNameText.setAttribute('text-anchor', 'middle');
            cuisineNameText.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif');
            cuisineNameText.setAttribute('font-size', '32');
            cuisineNameText.setAttribute('font-weight', '700');
            cuisineNameText.setAttribute('fill', '#333333');
            cuisineNameText.textContent = cuisineName;
            svg.appendChild(cuisineNameText);
            
            // Add description (wrap long text)
            const descStartY = afterImagesY + 70;
            const textMaxWidth = contentW - 40; // 20px side margins
            const descEndY = this.addWrappedCenteredSVGText(
                svg,
                cuisineDescription,
                176,
                descStartY,
                textMaxWidth,
                18, // line height px
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
                14, // font size px
                '400',
                '#666666'
            );
            
            // Add popular options
            if (popularOptions.length > 0) {
                const optionsTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                optionsTitle.setAttribute('x', '176');
                const optionsTitleY = descEndY + 30;
                optionsTitle.setAttribute('y', String(optionsTitleY));
                optionsTitle.setAttribute('text-anchor', 'middle');
                optionsTitle.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif');
                optionsTitle.setAttribute('font-size', '18');
                optionsTitle.setAttribute('font-weight', 'bold');
                optionsTitle.setAttribute('fill', '#333333');
                optionsTitle.textContent = 'Popular Options:';
                svg.appendChild(optionsTitle);
                
                popularOptions.forEach((option, index) => {
                    const optionText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    optionText.setAttribute('x', '176');
                    optionText.setAttribute('y', String(optionsTitleY + 24 + (index * 22)));
                    optionText.setAttribute('text-anchor', 'middle');
                    optionText.setAttribute('font-family', 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif');
                    optionText.setAttribute('font-size', '14');
                    optionText.setAttribute('fill', '#666666');
                    optionText.textContent = `• ${option}`;
                    svg.appendChild(optionText);
                });
            }
            
            // Convert SVG to image
            this.convertSVGToImage(svg, action);
            });
        });
    }

    // Manga burst removed
    
    // Add Cat Love image to SVG
    addCatLoveImage(svg, x, y, w, h, callback) {
        console.log('🖼️ Adding Cat Love image to SVG...');
        
        const preferred = this.currentCatLoveDataUrl || null;
        const trySrc = preferred || 'Cat love.png';
        // Try multiple methods to load and convert the image
        this.loadImageAsBase64(trySrc, (dataURL) => {
            if (dataURL) {
                console.log('✅ Cat Love.png converted to base64 successfully');
                
                // Add image to SVG
                const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                imageElement.setAttribute('x', String(x));
                imageElement.setAttribute('y', String(y));
                imageElement.setAttribute('width', String(w));
                imageElement.setAttribute('height', String(h));
                // Set both modern and legacy href attributes for Safari compatibility
                imageElement.setAttribute('href', dataURL);
                imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataURL);
                svg.appendChild(imageElement);
                
                callback();
            } else {
                console.log('⚠️ Failed to convert Cat Love.png to base64, using emoji');
                this.addCatLoveEmoji(svg, x, y, w, h, callback);
            }
        });
    }
    
    // Check if Cat Love image is available in config
    checkCatLoveImageAvailability() {
        console.log('🔍 Checking Cat Love image availability...');
        
        let hasUploadedImage = false;
        
        // Check window.configLoader.config
        if (window.configLoader && window.configLoader.config && window.configLoader.config.catLove && window.configLoader.config.catLove.imagePath) {
            hasUploadedImage = true;
            console.log('✅ Cat Love image found in window.configLoader.config');
        }
        
        // Check localStorage
        if (!hasUploadedImage) {
            try {
                const storedConfig = localStorage.getItem('fortuneWheelConfig');
                if (storedConfig) {
                    const config = JSON.parse(storedConfig);
                    if (config.catLove && config.catLove.imagePath) {
                        hasUploadedImage = true;
                        console.log('✅ Cat Love image found in localStorage config');
                    }
                }
            } catch (e) {
                console.log('⚠️ Error checking localStorage:', e);
            }
        }
        
        if (!hasUploadedImage) {
            console.log('⚠️ No Cat Love image uploaded yet. Please upload via admin panel.');
            console.log('💡 To upload: Go to simple-admin/admin.html → Cat Love Image section → Choose File');
        }
        
        return hasUploadedImage;
    }
    
    // Load image as base64 using multiple methods
    loadImageAsBase64(imageSrc, callback) {
        console.log('🔄 Loading image as base64:', imageSrc);
        
        // Check if we have an uploaded Cat Love image in config
        if (imageSrc === 'Cat love.png') {
            console.log('🔍 Checking for uploaded Cat Love image...');
            console.log('🔍 window.configLoader:', window.configLoader);
            console.log('🔍 window.configLoader.config:', window.configLoader?.config);
            console.log('🔍 config.catLove:', window.configLoader?.config?.catLove);
            console.log('🔍 config.catLove.imagePath:', window.configLoader?.config?.catLove?.imagePath);
            
            // Try multiple ways to access the config
            let catLoveImage = null;
            
            // Method 1: Check window.configLoader.config
            if (window.configLoader && window.configLoader.config && window.configLoader.config.catLove && window.configLoader.config.catLove.imagePath) {
                catLoveImage = window.configLoader.config.catLove.imagePath;
                console.log('✅ Found Cat Love image in window.configLoader.config');
            }
            
            // Method 2: Check localStorage directly
            if (!catLoveImage) {
                try {
                    const storedConfig = localStorage.getItem('fortuneWheelConfig');
                    if (storedConfig) {
                        const config = JSON.parse(storedConfig);
                        if (config.catLove && config.catLove.imagePath) {
                            catLoveImage = config.catLove.imagePath;
                            console.log('✅ Found Cat Love image in localStorage config');
                        }
                    }
                } catch (e) {
                    console.log('⚠️ Error reading localStorage config:', e);
                }
            }
            
            if (catLoveImage) {
                console.log('✅ Using uploaded Cat Love image:', catLoveImage.substring(0, 50) + '...');
                callback(catLoveImage);
                return;
            } else {
                console.log('⚠️ No uploaded Cat Love image found, trying local file...');
            }
        }
        
        // Method 1: Try with crossOrigin
        this.tryLoadWithCrossOrigin(imageSrc, callback);
    }
    
    // Try loading with crossOrigin
    tryLoadWithCrossOrigin(imageSrc, callback) {
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ Image loaded successfully');
            this.convertImageToBase64(img, callback);
        };
        
        img.onerror = () => {
            console.log('⚠️ Image failed to load with crossOrigin, trying without');
            this.tryLoadWithoutCrossOrigin(imageSrc, callback);
        };
        
        // Try with crossOrigin first
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
    }
    
    // Try loading without crossOrigin
    tryLoadWithoutCrossOrigin(imageSrc, callback) {
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ Image loaded without crossOrigin');
            this.convertImageToBase64(img, callback);
        };
        
        img.onerror = () => {
            console.log('⚠️ Image failed to load without crossOrigin, trying fetch');
            this.tryLoadWithFetch(imageSrc, callback);
        };
        
        // Remove crossOrigin
        img.crossOrigin = null;
        img.src = imageSrc;
    }
    
    // Try loading with fetch
    tryLoadWithFetch(imageSrc, callback) {
        console.log('🔄 Trying to load image with fetch...');
        
        // For local files, try different approaches
        if (imageSrc.startsWith('file://')) {
            console.log('🔄 Detected local file, trying alternative methods...');
            this.tryLoadLocalFile(imageSrc, callback);
            return;
        }
        
        fetch(imageSrc)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                console.log('✅ Image loaded with fetch');
                this.convertBlobToBase64(blob, callback);
            })
            .catch(error => {
                console.log('⚠️ Fetch failed:', error.message);
                this.tryLoadLocalFile(imageSrc, callback);
            });
    }
    
    // Try loading local file with alternative methods
    tryLoadLocalFile(imageSrc, callback) {
        console.log('🔄 Trying to load local file...');
        
        // Method 1: Try to read the file directly if it's in the same directory
        const fileName = imageSrc.split('/').pop();
        console.log('🔄 Trying to load file by name:', fileName);
        
        // Create a new image and try to load it
        const img = new Image();
        
        img.onload = () => {
            console.log('✅ Local file loaded successfully');
            // Try to convert without canvas (direct approach)
            this.convertLocalImageToBase64(img, callback);
        };
        
        img.onerror = () => {
            console.log('⚠️ Local file failed to load, trying data URL approach');
            this.tryDataURLApproach(fileName, callback);
        };
        
        // Try loading with just the filename
        img.src = fileName;
    }
    
    // Try data URL approach
    tryDataURLApproach(fileName, callback) {
        console.log('🔄 Trying data URL approach...');
        
        // This is a fallback - we'll create a placeholder
        // In a real server environment, you'd read the file directly
        console.log('⚠️ Cannot read local file directly, using emoji fallback');
        callback(null);
    }
    
    // Convert local image to base64 without canvas tainting
    convertLocalImageToBase64(img, callback) {
        try {
            console.log('🔄 Converting local image to base64...');
            
            // Try to create a data URL directly from the image
            // This might work for some browsers
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Try to draw the image
            ctx.drawImage(img, 0, 0);
            
            // Try to get data URL
            const dataURL = canvas.toDataURL('image/png');
            console.log('✅ Local image converted to base64 successfully');
            callback(dataURL);
            
        } catch (e) {
            console.log('⚠️ Canvas tainted, trying alternative approach:', e.message);
            
            // Alternative: Create a simple base64 representation
            // This is a workaround for local files
            this.createImagePlaceholder(callback);
        }
    }
    
    // Create image placeholder as base64
    createImagePlaceholder(callback) {
        console.log('🔄 Creating Cat Love image placeholder...');
        
        // Create a simple Cat Love representation as SVG base64
        // This creates a cute cat face that represents the Cat Love image
        const catSVG = `
            <svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="40" r="35" fill="#FFB6C1" stroke="#FF69B4" stroke-width="2"/>
                <circle cx="30" cy="30" r="5" fill="#000"/>
                <circle cx="50" cy="30" r="5" fill="#000"/>
                <path d="M 30 45 Q 40 55 50 45" stroke="#000" stroke-width="2" fill="none"/>
                <path d="M 20 25 Q 15 20 10 25" stroke="#000" stroke-width="2" fill="none"/>
                <path d="M 60 25 Q 65 20 70 25" stroke="#000" stroke-width="2" fill="none"/>
                <text x="40" y="65" text-anchor="middle" font-size="12" fill="#FF1493">LOVE</text>
            </svg>
        `;
        
        // Convert SVG to base64
        const svgBlob = new Blob([catSVG], { type: 'image/svg+xml;charset=utf-8' });
        const reader = new FileReader();
        
        reader.onload = () => {
            console.log('✅ Cat Love placeholder created');
            callback(reader.result);
        };
        
        reader.onerror = () => {
            console.log('⚠️ Failed to create placeholder, using emoji');
            callback(null);
        };
        
        reader.readAsDataURL(svgBlob);
    }
    
    // Convert image to base64
    convertImageToBase64(img, callback) {
        try {
            console.log('🔄 Converting image to base64...');
            
            // Create a temporary canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to image size
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0);
            
            // Convert to base64
            const dataURL = canvas.toDataURL('image/png');
            console.log('✅ Image converted to base64 successfully');
            
            callback(dataURL);
        } catch (e) {
            console.log('⚠️ Failed to convert image to base64:', e.message);
            callback(null);
        }
    }
    
    // Convert blob to base64
    convertBlobToBase64(blob, callback) {
        try {
            console.log('🔄 Converting blob to base64...');
            
            const reader = new FileReader();
            reader.onload = () => {
                console.log('✅ Blob converted to base64 successfully');
                callback(reader.result);
            };
            reader.onerror = () => {
                console.log('⚠️ Failed to convert blob to base64');
                callback(null);
            };
            reader.readAsDataURL(blob);
        } catch (e) {
            console.log('⚠️ Failed to convert blob to base64:', e.message);
            callback(null);
        }
    }
    
    // Add cuisine image to SVG
    addCuisineImage(svg, cuisineEmoji, x, y, w, h, callback) {
        console.log('🖼️ Adding cuisine image to SVG...');
        
        // Check if we have a custom cuisine image
        const resultIconElement = document.getElementById('resultIcon');
        let cuisineImageSrc = null;
        
        if (resultIconElement) {
            const img = resultIconElement.querySelector('img');
            if (img && img.src) {
                cuisineImageSrc = img.src;
                console.log('🖼️ Found cuisine image:', cuisineImageSrc);
            }
        }
        
        if (cuisineImageSrc) {
            // Try to load and convert cuisine image
            this.loadImageAsBase64(cuisineImageSrc, (dataURL) => {
                if (dataURL) {
                    console.log('✅ Cuisine image converted to base64 successfully');
                    
                    // Add image to SVG
                    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image');
                    imageElement.setAttribute('x', String(x));
                    imageElement.setAttribute('y', String(y));
                    imageElement.setAttribute('width', String(w));
                    imageElement.setAttribute('height', String(h));
                    // Set both modern and legacy href attributes for Safari compatibility
                    imageElement.setAttribute('href', dataURL);
                    imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', dataURL);
                    svg.appendChild(imageElement);
                    
                    callback();
                } else {
                    console.log('⚠️ Failed to convert cuisine image to base64, using emoji');
                    this.addCuisineEmoji(svg, cuisineEmoji, x, y, w, h, callback);
                }
            });
        } else {
            // No cuisine image, use emoji
            this.addCuisineEmoji(svg, cuisineEmoji, x, y, w, h, callback);
        }
    }
    
    // Add cuisine emoji as fallback
    addCuisineEmoji(svg, cuisineEmoji, x, y, w, h, callback) {
        const cuisineEmojiText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        cuisineEmojiText.setAttribute('x', String(x + Math.floor(w/2)));
        cuisineEmojiText.setAttribute('y', String(y + Math.floor(h*0.75)));
        cuisineEmojiText.setAttribute('text-anchor', 'middle');
        cuisineEmojiText.setAttribute('font-size', String(Math.min(w, h)));
        cuisineEmojiText.setAttribute('fill', '#333333');
        cuisineEmojiText.textContent = cuisineEmoji;
        svg.appendChild(cuisineEmojiText);
        callback();
    }
    
    // Add Cat Love emoji as fallback
    addCatLoveEmoji(svg, x, y, w, h, callback) {
        const catEmoji = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        catEmoji.setAttribute('x', String(x + Math.floor(w/2)));
        catEmoji.setAttribute('y', String(y + Math.floor(h*0.75)));
        catEmoji.setAttribute('text-anchor', 'middle');
        catEmoji.setAttribute('font-size', String(Math.min(w, h)));
        catEmoji.setAttribute('fill', '#333333');
        catEmoji.textContent = '🐱';
        svg.appendChild(catEmoji);
        callback();
    }
    
    // Convert SVG to image
    convertSVGToImage(svg, action) {
        console.log('🔄 Converting SVG to image...');
        
        // Convert SVG to data URL
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // Create image from SVG
        const img = new Image();
        img.onload = () => {
            // Create canvas to convert to PNG
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 352;
            canvas.height = 465;
            
            // Draw SVG image to canvas
            ctx.drawImage(img, 0, 0, 352, 465);
            
            // Clean up
            URL.revokeObjectURL(svgUrl);
            
            console.log('✅ SVG converted to canvas successfully');
            this.handleImageCapture(canvas, action);
        };
        
        img.onerror = () => {
            console.log('⚠️ Failed to load SVG as image, using fallback');
            URL.revokeObjectURL(svgUrl);
            this.createImageFallback(action);
        };
        
        img.src = svgUrl;
    }

    // Helper: add wrapped, centered text to SVG within max width; returns last line Y
    addWrappedCenteredSVGText(svg, text, centerX, startY, maxWidth, lineHeight, fontFamily, fontSize, fontWeight, fill) {
        const words = String(text || '').split(/\s+/).filter(Boolean);
        let line = '';
        let y = startY;

        // Use offscreen canvas for width measurement (works off-DOM)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        try {
            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        } catch (e) {
            ctx.font = `${fontSize}px sans-serif`;
        }

        const getTextWidth = (t) => {
            try {
                return ctx.measureText(t).width || 0;
            } catch (e) {
                return t.length * (fontSize * 0.6);
            }
        };

        const flushLine = () => {
            const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            lineEl.setAttribute('x', String(centerX));
            lineEl.setAttribute('y', String(y));
            lineEl.setAttribute('text-anchor', 'middle');
            lineEl.setAttribute('font-family', fontFamily);
            lineEl.setAttribute('font-size', String(fontSize));
            lineEl.setAttribute('font-weight', String(fontWeight));
            lineEl.setAttribute('fill', fill);
            lineEl.textContent = line.trim();
            svg.appendChild(lineEl);
            y += lineHeight;
            line = '';
        };

        for (let i = 0; i < words.length; i++) {
            const test = line ? line + ' ' + words[i] : words[i];
            if (getTextWidth(test) <= maxWidth) {
                line = test;
            } else {
                if (line) flushLine();
                // Word longer than maxWidth: force breaks by character
                if (getTextWidth(words[i]) > maxWidth) {
                    let chunk = '';
                    for (const ch of words[i]) {
                        const next = chunk + ch;
                        if (getTextWidth(next) <= maxWidth) {
                            chunk = next;
                        } else {
                            line = chunk;
                            flushLine();
                            chunk = ch;
                        }
                    }
                    line = chunk;
                } else {
                    line = words[i];
                }
            }
        }
        if (line) flushLine();

        return y; // last Y after writing
    }
    
    // NEW APPROACH: Pure canvas drawing with real images
    createCanvasWithRealImages(action) {
        console.log('🎨 Creating canvas with real images...');
        
        // Get current result data
        const cuisineName = document.getElementById('resultCuisine').textContent;
        const cuisineDescription = document.getElementById('resultDescription').textContent;
        const resultIconElement = document.getElementById('resultIcon');
        
        // Get popup title from config
        let popupTitle = '🍽️ What to Eat Tonight?';
        try {
            if (window.configLoader && window.configLoader.config) {
                const currentLang = window.configLoader.config.currentLanguage || 'en';
                const langConfig = window.configLoader.config.languages[currentLang];
                if (langConfig && langConfig.popup && langConfig.popup.title) {
                    popupTitle = langConfig.popup.title;
                }
            }
        } catch (e) {
            console.log('⚠️ Could not get popup title from config, using default');
        }
        
        // Get popular options
        const suggestionsList = document.getElementById('suggestionsList');
        let popularOptions = [];
        if (suggestionsList) {
            const options = suggestionsList.querySelectorAll('li');
            popularOptions = Array.from(options).map(li => li.textContent.trim());
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 352;
        canvas.height = 465;
        
        // Set canvas background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add rounded corners effect (simulate with background)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
        ctx.fill();
        
        // Add shadow effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Draw main content background
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Set up text styles
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333333';
        
        // Draw title
        ctx.font = 'bold 20px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.fillText(popupTitle, canvas.width / 2, 50);
        
        // Load and draw images
        this.loadAndDrawImages(ctx, canvas, cuisineName, cuisineDescription, popularOptions, action);
    }
    
    // Load and draw the Cat Love.png and cuisine image
    loadAndDrawImages(ctx, canvas, cuisineName, cuisineDescription, popularOptions, action) {
        console.log('🖼️ Loading images for canvas...');
        
        let imagesLoaded = 0;
        const totalImages = 2;
        
        // Create image objects
        const catImage = new Image();
        const cuisineImage = new Image();
        
        // Load Cat Love.png
        catImage.onload = () => {
            console.log('✅ Cat Love.png loaded successfully');
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                this.drawCompleteCanvas(ctx, canvas, catImage, cuisineImage, cuisineName, cuisineDescription, popularOptions, action);
            }
        };
        
        catImage.onerror = () => {
            console.log('⚠️ Cat Love.png failed to load, using emoji fallback');
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                this.drawCompleteCanvas(ctx, canvas, null, cuisineImage, cuisineName, cuisineDescription, popularOptions, action);
            }
        };
        
        // Load cuisine image (get from result icon)
        const resultIconElement = document.getElementById('resultIcon');
        let cuisineImageSrc = null;
        
        if (resultIconElement) {
            // Check if it's a custom image
            const img = resultIconElement.querySelector('img');
            if (img && img.src) {
                cuisineImageSrc = img.src;
                console.log('🖼️ Found cuisine image:', cuisineImageSrc);
            } else {
                // It's an emoji, we'll draw it as text
                console.log('🖼️ Cuisine is emoji, will draw as text');
            }
        }
        
        if (cuisineImageSrc) {
            cuisineImage.onload = () => {
                console.log('✅ Cuisine image loaded successfully');
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    this.drawCompleteCanvas(ctx, canvas, catImage, cuisineImage, cuisineName, cuisineDescription, popularOptions, action);
                }
            };
            
            cuisineImage.onerror = () => {
                console.log('⚠️ Cuisine image failed to load, using emoji fallback');
                imagesLoaded++;
                if (imagesLoaded === totalImages) {
                    this.drawCompleteCanvas(ctx, canvas, catImage, null, cuisineName, cuisineDescription, popularOptions, action);
                }
            };
            
            cuisineImage.src = cuisineImageSrc;
        } else {
            // No cuisine image, just emoji
            imagesLoaded++;
            if (imagesLoaded === totalImages) {
                this.drawCompleteCanvas(ctx, canvas, catImage, null, cuisineName, cuisineDescription, popularOptions, action);
            }
        }
        
        // Start loading Cat Love.png
        catImage.src = 'Cat love.png';
    }
    
    // Draw the complete canvas with all elements
    drawCompleteCanvas(ctx, canvas, catImage, cuisineImage, cuisineName, cuisineDescription, popularOptions, action) {
        console.log('🎨 Drawing complete canvas...');
        
        // Draw images section
        const imageY = 80;
        const imageSize = 80;
        const spacing = 20;
        
        // Draw Cat Love image or emoji
        if (catImage) {
            try {
                ctx.drawImage(catImage, 50, imageY, imageSize, imageSize);
                console.log('✅ Drew Cat Love image');
            } catch (e) {
                console.log('⚠️ Failed to draw Cat Love image, using emoji');
                ctx.font = '80px Arial';
                ctx.fillText('🐱', 90, imageY + 60);
            }
        } else {
            ctx.font = '80px Arial';
            ctx.fillText('🐱', 90, imageY + 60);
        }
        
        // Draw cuisine image or emoji
        if (cuisineImage) {
            try {
                ctx.drawImage(cuisineImage, 50 + imageSize + spacing, imageY, imageSize, imageSize);
                console.log('✅ Drew cuisine image');
            } catch (e) {
                console.log('⚠️ Failed to draw cuisine image, using emoji');
                ctx.font = '80px Arial';
                ctx.fillText('🍽️', 50 + imageSize + spacing + 40, imageY + 60);
            }
        } else {
            // Draw cuisine emoji
            const resultIconElement = document.getElementById('resultIcon');
            if (resultIconElement) {
                const emoji = resultIconElement.textContent.trim();
                ctx.font = '80px Arial';
                ctx.fillText(emoji, 50 + imageSize + spacing + 40, imageY + 60);
                console.log('✅ Drew cuisine emoji:', emoji);
            }
        }
        
        // Draw cuisine name
        ctx.font = 'bold 24px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.fillText(cuisineName, canvas.width / 2, imageY + imageSize + 50);
        
        // Draw description
        ctx.font = '16px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
        ctx.fillStyle = '#666666';
        ctx.fillText(cuisineDescription, canvas.width / 2, imageY + imageSize + 80);
        
        // Draw popular options
        if (popularOptions.length > 0) {
            ctx.font = 'bold 18px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = '#333333';
            ctx.fillText('Popular Options:', canvas.width / 2, imageY + imageSize + 120);
            
            ctx.font = '14px Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
            ctx.fillStyle = '#666666';
            
            popularOptions.forEach((option, index) => {
                const y = imageY + imageSize + 150 + (index * 25);
                ctx.fillText(`• ${option}`, canvas.width / 2, y);
            });
        }
        
        // Handle the completed canvas
        this.handleImageCapture(canvas, action);
    }
    
    // NEW APPROACH: Capture the original result popup (the perfect visual)
    captureOriginalResultPopup(action) {
        console.log('🎯 NEW APPROACH: Capturing original result popup...');
        
        // Find the original result popup that's already displayed
        const originalPopup = document.getElementById('resultPopup');
        
        if (!originalPopup) {
            console.log('⚠️ Original result popup not found, falling back to manual canvas');
            this.createManualCanvas(null, action);
            return;
        }
        
        console.log('✅ Found original result popup:', originalPopup);
        console.log('🔍 Original popup classes:', originalPopup.className);
        console.log('🔍 Original popup style display:', originalPopup.style.display);
        console.log('🔍 Original popup computed display:', window.getComputedStyle(originalPopup).display);
        
        // Ensure the original popup is visible
        if (!originalPopup.classList.contains('show')) {
            console.log('⚠️ Original popup is not visible, making it visible temporarily');
            originalPopup.classList.add('show');
        }
        
        // Create a clone of the original popup
        const clonedPopup = originalPopup.cloneNode(true);
        
        // Remove any action buttons from the clone
        const actionButtons = clonedPopup.querySelector('.action-buttons');
        const shareButton = clonedPopup.querySelector('#shareResult');
        const closeButton = clonedPopup.querySelector('.close-btn');
        
        if (actionButtons) {
            actionButtons.remove();
        }
        if (shareButton) {
            shareButton.remove();
        }
        if (closeButton) {
            closeButton.remove();
        }
        
        // Style the clone to be visible and properly positioned
        clonedPopup.style.position = 'fixed';
        clonedPopup.style.top = '0px';
        clonedPopup.style.left = '0px';
        clonedPopup.style.width = '100vw';
        clonedPopup.style.height = '100vh';
        clonedPopup.style.background = 'rgba(0, 0, 0, 0.8)';
        clonedPopup.style.display = 'flex';
        clonedPopup.style.alignItems = 'center';
        clonedPopup.style.justifyContent = 'center';
        clonedPopup.style.zIndex = '10001';
        clonedPopup.style.opacity = '1';
        clonedPopup.style.visibility = 'visible';
        clonedPopup.style.margin = '0';
        clonedPopup.style.padding = '0';
        clonedPopup.style.overflow = 'hidden';
        
        // Add the clone to the page temporarily
        document.body.appendChild(clonedPopup);
        
        // Debug the clone
        console.log('🔍 Clone added to page');
        console.log('🔍 Clone classes:', clonedPopup.className);
        console.log('🔍 Clone style display:', clonedPopup.style.display);
        console.log('🔍 Clone computed display:', window.getComputedStyle(clonedPopup).display);
        console.log('🔍 Clone computed opacity:', window.getComputedStyle(clonedPopup).opacity);
        console.log('🔍 Clone computed visibility:', window.getComputedStyle(clonedPopup).visibility);
        
        // Check if clone has content
        const cloneContent = clonedPopup.querySelector('.popup-content');
        if (cloneContent) {
            console.log('✅ Clone has popup content');
            console.log('🔍 Content text:', cloneContent.textContent.substring(0, 100) + '...');
        } else {
            console.log('⚠️ Clone has no popup content');
        }
        
        // Wait for the clone to be fully rendered
        setTimeout(() => {
            if (typeof html2canvas !== 'undefined') {
                console.log('🔄 Capturing original result popup...');
                html2canvas(clonedPopup, {
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: false,
                    allowTaint: false,
                    logging: true,
                    width: 352,
                    height: 465,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    onclone: function(clonedDoc) {
                        console.log('📋 html2canvas cloned document for original popup');
                        // Replace ALL images with safe alternatives to prevent tainting
                        const images = clonedDoc.querySelectorAll('img');
                        console.log('🖼️ Found', images.length, 'images in original popup document');
                        
                        images.forEach((img, index) => {
                            console.log(`🖼️ Original Image ${index}:`, img.src, 'alt:', img.alt);
                            
                            // Replace ONLY file:// images to avoid CORS tainting
                            if (img.src && img.src.startsWith('file://')) {
                                console.log('🔄 Replacing local image in original popup:', img.src);
                                
                                // Create emoji replacement
                                const emojiSpan = clonedDoc.createElement('span');
                                emojiSpan.textContent = '🐱';
                                emojiSpan.style.fontSize = '180px';
                                emojiSpan.style.display = 'inline-block';
                                emojiSpan.style.width = '180px';
                                emojiSpan.style.height = '180px';
                                emojiSpan.style.textAlign = 'center';
                                emojiSpan.style.lineHeight = '180px';
                                emojiSpan.style.verticalAlign = 'middle';
                                
                                // Replace the image
                                img.parentNode.replaceChild(emojiSpan, img);
                                console.log('✅ Original popup image replaced with emoji');
                            }
                        });
                        
                        // Also check for any background images that might cause tainting
                        const elementsWithBg = clonedDoc.querySelectorAll('*');
                        elementsWithBg.forEach(el => {
                            const bgImage = window.getComputedStyle(el).backgroundImage;
                            if (bgImage && bgImage.includes('file://')) {
                                console.log('🔄 Removing background image from original popup:', bgImage);
                                el.style.backgroundImage = 'none';
                            }
                        });
                    }
                }).then(canvas => {
                    console.log('✅ html2canvas with original result popup successful');
                    console.log('📏 Canvas dimensions:', canvas.width, 'x', canvas.height);
                    // Remove the clone
                    document.body.removeChild(clonedPopup);
                    this.handleImageCapture(canvas, action);
                }).catch(error => {
                    console.log('⚠️ html2canvas with original result popup failed:', error.message);
                    console.log('❌ Error details:', error);
                    // Remove the clone
                    document.body.removeChild(clonedPopup);
                    
                    // Fallback: manual canvas
                    console.log('🔄 Falling back to manual canvas...');
                    this.createManualCanvas(null, action);
                });
            } else {
                // Remove the clone
                document.body.removeChild(clonedPopup);
                
                // Fallback: manual canvas
                console.log('🔄 html2canvas not available, using manual canvas...');
                this.createManualCanvas(null, action);
            }
        }, 500);
    }
    
    // Approach 4: Hide buttons during capture
    captureWithHiddenButtons(sharePopup, action) {
        console.log('🔄 Approach 4: Hiding buttons during capture...');
        
        // Add CSS to hide buttons
        const style = document.createElement('style');
        style.id = 'capture-hide-buttons';
        style.textContent = `
            .share-action-buttons,
            .share-btn,
            .close-btn {
                display: none !important;
                visibility: hidden !important;
            }
        `;
        document.head.appendChild(style);
        
        // Wait a moment for CSS to apply
        setTimeout(() => {
            if (typeof html2canvas !== 'undefined') {
                console.log('🔄 Capturing with hidden buttons...');
                html2canvas(sharePopup, {
                    backgroundColor: null,
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    width: 600,
                    height: 800,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                    windowWidth: 600,
                    windowHeight: 800
                }).then(canvas => {
                    console.log('✅ html2canvas with hidden buttons successful');
                    console.log('📏 Canvas dimensions:', canvas.width, 'x', canvas.height);
                    // Remove the CSS
                    const styleElement = document.getElementById('capture-hide-buttons');
                    if (styleElement) {
                        document.head.removeChild(styleElement);
                    }
                    this.handleImageCapture(canvas, action);
                }).catch(error => {
                    console.log('⚠️ html2canvas with hidden buttons failed:', error.message);
                    console.log('❌ Error details:', error);
                    // Remove the CSS
                    const styleElement = document.getElementById('capture-hide-buttons');
                    if (styleElement) {
                        document.head.removeChild(styleElement);
                    }
                    
                    // Fallback to Approach 1: Clone without buttons
                    console.log('🔄 Falling back to Approach 1: Clone without buttons...');
                    this.captureWithClonedPopup(sharePopup, action);
                });
            } else {
                // Remove the CSS
                const styleElement = document.getElementById('capture-hide-buttons');
                if (styleElement) {
                    document.head.removeChild(styleElement);
                }
                
                // Fallback to Approach 1
                console.log('🔄 html2canvas not available, trying Approach 1...');
                this.captureWithClonedPopup(sharePopup, action);
            }
        }, 100);
    }
    
    // Approach 1: Clone popup without buttons
    captureWithClonedPopup(sharePopup, action) {
        console.log('🔄 Approach 1: Creating clone without buttons...');
        
        // Create a deep clone of the popup
        const clonedPopup = sharePopup.cloneNode(true);
        
        // Remove buttons from the clone
        const actionButtons = clonedPopup.querySelector('.share-action-buttons');
        const closeBtn = clonedPopup.querySelector('.close-btn');
        
        if (actionButtons) {
            actionButtons.remove();
        }
        if (closeBtn) {
            closeBtn.remove();
        }
        
        // Ensure the clone has the same styling as the original
        clonedPopup.style.position = 'fixed';
        clonedPopup.style.top = '0px';
        clonedPopup.style.left = '0px';
        clonedPopup.style.width = '100vw';
        clonedPopup.style.height = '100vh';
        clonedPopup.style.background = 'rgba(0, 0, 0, 0.8)';
        clonedPopup.style.display = 'flex';
        clonedPopup.style.alignItems = 'center';
        clonedPopup.style.justifyContent = 'center';
        clonedPopup.style.zIndex = '10000';
        clonedPopup.style.opacity = '1';
        clonedPopup.style.visibility = 'visible';
        clonedPopup.style.margin = '0';
        clonedPopup.style.padding = '0';
        clonedPopup.style.overflow = 'hidden';
        
        // Add the clone to the page temporarily
        document.body.appendChild(clonedPopup);
        
        // Wait for the clone to be fully rendered
        setTimeout(() => {
            if (typeof html2canvas !== 'undefined') {
                console.log('🔄 Capturing cloned popup...');
                html2canvas(clonedPopup, {
                    backgroundColor: null,
                    scale: 1,
                    useCORS: false,
                    allowTaint: false,
                    logging: true,
                    width: 352,
                    height: 465,
                    onclone: function(clonedDoc) {
                        console.log('📋 html2canvas cloned document for clone');
                        // Replace ALL images with safe alternatives to prevent tainting
                        const images = clonedDoc.querySelectorAll('img');
                        console.log('🖼️ Found', images.length, 'images in cloned document');
                        
                        images.forEach((img, index) => {
                            console.log(`🖼️ Image ${index}:`, img.src, 'alt:', img.alt);
                            
                            // Replace ONLY file:// images to avoid CORS tainting
                            if (img.src && img.src.startsWith('file://')) {
                                console.log('🔄 Replacing local image:', img.src);
                                
                                // Create emoji replacement
                                const emojiSpan = clonedDoc.createElement('span');
                                emojiSpan.textContent = '🐱';
                                emojiSpan.style.fontSize = '180px';
                                emojiSpan.style.display = 'inline-block';
                                emojiSpan.style.width = '180px';
                                emojiSpan.style.height = '180px';
                                emojiSpan.style.textAlign = 'center';
                                emojiSpan.style.lineHeight = '180px';
                                emojiSpan.style.verticalAlign = 'middle';
                                
                                // Replace the image
                                img.parentNode.replaceChild(emojiSpan, img);
                                console.log('✅ Image replaced with emoji');
                            }
                        });
                        
                        // Also check for any background images that might cause tainting
                        const elementsWithBg = clonedDoc.querySelectorAll('*');
                        elementsWithBg.forEach(el => {
                            const bgImage = window.getComputedStyle(el).backgroundImage;
                            if (bgImage && bgImage.includes('file://')) {
                                console.log('🔄 Removing background image:', bgImage);
                                el.style.backgroundImage = 'none';
                            }
                        });
                    }
                }).then(canvas => {
                    console.log('✅ html2canvas with cloned popup successful');
                    console.log('📏 Canvas dimensions:', canvas.width, 'x', canvas.height);
                    // Remove the clone
                    document.body.removeChild(clonedPopup);
                    this.handleImageCapture(canvas, action);
                }).catch(error => {
                    console.log('⚠️ html2canvas with cloned popup failed:', error.message);
                    console.log('❌ Error details:', error);
                    // Remove the clone
                    document.body.removeChild(clonedPopup);
                    
                    // Try a different approach: capture just the popup content
                    console.log('🔄 Trying to capture popup content only...');
                    this.capturePopupContentOnly(sharePopup, action);
                });
            } else {
                // Remove the clone
                document.body.removeChild(clonedPopup);
                
                // Final fallback: manual canvas
                console.log('🔄 html2canvas not available, using manual canvas...');
                this.createManualCanvas(sharePopup, action);
            }
        }, 500); // Longer delay to ensure full rendering
    }
    
    // Try to capture just the popup content (without background overlay)
    capturePopupContentOnly(sharePopup, action) {
        console.log('🔄 Capturing popup content only...');
        
        // Find the popup content element
        const popupContent = sharePopup.querySelector('.popup-content');
        
        if (popupContent) {
            // Create a clone of just the content
            const clonedContent = popupContent.cloneNode(true);
            
            // Remove buttons from the content clone
            const actionButtons = clonedContent.querySelector('.share-action-buttons');
            if (actionButtons) {
                actionButtons.remove();
            }
            
            // Style the cloned content to be visible
            clonedContent.style.position = 'relative';
            clonedContent.style.background = 'white';
            clonedContent.style.borderRadius = '20px';
            clonedContent.style.padding = '20px';
            clonedContent.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
            clonedContent.style.maxWidth = '352px';
            clonedContent.style.width = '352px';
            clonedContent.style.minHeight = '465px';
            clonedContent.style.height = '465px';
            clonedContent.style.display = 'block';
            clonedContent.style.visibility = 'visible';
            clonedContent.style.opacity = '1';
            clonedContent.style.margin = '0';
            clonedContent.style.overflow = 'hidden';
            
            // Add to page temporarily
            document.body.appendChild(clonedContent);
            
            setTimeout(() => {
                if (typeof html2canvas !== 'undefined') {
                    console.log('🔄 Capturing popup content...');
                    html2canvas(clonedContent, {
                        backgroundColor: '#ffffff',
                        scale: 1,
                        useCORS: false,
                        allowTaint: false,
                        logging: true,
                        width: 352,
                        height: 465,
                        onclone: function(clonedDoc) {
                            console.log('📋 html2canvas cloned document for content');
                            // Replace ALL images with safe alternatives to prevent tainting
                            const images = clonedDoc.querySelectorAll('img');
                            console.log('🖼️ Found', images.length, 'images in content document');
                            
                            images.forEach((img, index) => {
                                console.log(`🖼️ Content Image ${index}:`, img.src, 'alt:', img.alt);
                                
                                // Replace ONLY file:// images to avoid CORS tainting
                                if (img.src && img.src.startsWith('file://')) {
                                    console.log('🔄 Replacing local image in content:', img.src);
                                    
                                    // Create emoji replacement
                                    const emojiSpan = clonedDoc.createElement('span');
                                    emojiSpan.textContent = '🐱';
                                    emojiSpan.style.fontSize = '180px';
                                    emojiSpan.style.display = 'inline-block';
                                    emojiSpan.style.width = '180px';
                                    emojiSpan.style.height = '180px';
                                    emojiSpan.style.textAlign = 'center';
                                    emojiSpan.style.lineHeight = '180px';
                                    emojiSpan.style.verticalAlign = 'middle';
                                    
                                    // Replace the image
                                    img.parentNode.replaceChild(emojiSpan, img);
                                    console.log('✅ Content image replaced with emoji');
                                }
                            });
                            
                            // Also check for any background images that might cause tainting
                            const elementsWithBg = clonedDoc.querySelectorAll('*');
                            elementsWithBg.forEach(el => {
                                const bgImage = window.getComputedStyle(el).backgroundImage;
                                if (bgImage && bgImage.includes('file://')) {
                                    console.log('🔄 Removing background image from content:', bgImage);
                                    el.style.backgroundImage = 'none';
                                }
                            });
                        }
                    }).then(canvas => {
                        console.log('✅ html2canvas with popup content successful');
                        console.log('📏 Canvas dimensions:', canvas.width, 'x', canvas.height);
                        // Remove the clone
                        document.body.removeChild(clonedContent);
                        this.handleImageCapture(canvas, action);
                    }).catch(error => {
                        console.log('⚠️ html2canvas with popup content failed:', error.message);
                        // Remove the clone
                        document.body.removeChild(clonedContent);
                        
                        // Final fallback: manual canvas
                        console.log('🔄 Final fallback: manual canvas...');
                        this.createManualCanvas(sharePopup, action);
                    });
                } else {
                    // Remove the clone
                    document.body.removeChild(clonedContent);
                    
                    // Final fallback: manual canvas
                    console.log('🔄 html2canvas not available, using manual canvas...');
                    this.createManualCanvas(sharePopup, action);
                }
            }, 300);
        } else {
            console.log('⚠️ Could not find popup content, using manual canvas...');
            this.createManualCanvas(sharePopup, action);
        }
    }
    
    // Handle successful image capture
    handleImageCapture(canvas, action) {
        console.log('🖼️ Handling image capture...');
        
        // Try multiple export methods
        let blob = null;
        
        // Method 1: Try toDataURL
        try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            blob = this.dataURLToBlob(dataURL);
            console.log('✅ toDataURL successful - using html2canvas result');
        } catch (error) {
            console.log('⚠️ toDataURL failed:', error.message);
        }
        
        // Method 2: Try toBlob
        if (!blob) {
            try {
                console.log('🔄 Trying toBlob...');
                canvas.toBlob((result) => {
                    if (result) {
                        console.log('✅ toBlob successful - using html2canvas result');
                        if (action === 'download') {
                            this.downloadImage(result);
                        } else if (action === 'share') {
                            this.performNativeShare(result);
                        }
                    } else {
                        console.log('⚠️ toBlob returned null');
                        this.createImageFallback(action);
                    }
                }, 'image/jpeg', 0.9);
                return; // Exit early since toBlob is async
            } catch (error) {
                console.log('⚠️ toBlob failed:', error.message);
            }
        }
        
        // Method 3: Try PNG format
        if (!blob) {
            try {
                console.log('🔄 Trying PNG format...');
                const dataURL = canvas.toDataURL('image/png');
                blob = this.dataURLToBlob(dataURL);
                console.log('✅ PNG toDataURL successful');
            } catch (error) {
                console.log('⚠️ PNG toDataURL failed:', error.message);
            }
        }
        
        // If we have a blob, use it
        if (blob) {
            console.log('✅ Image blob created successfully - using html2canvas result');
            if (action === 'download') {
                this.downloadImage(blob);
            } else if (action === 'share') {
                this.performNativeShare(blob);
            }
        } else {
            console.log('⚠️ All image export methods failed, using image fallback');
            this.createImageFallback(action);
        }
    }
    
    // Create image fallback (always returns an image, never text)
    createImageFallback(action) {
        console.log('🔄 Creating image fallback...');
        
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 800);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);
        
        // Get the current result data
        const resultCuisine = document.getElementById('resultCuisine');
        const resultDescription = document.getElementById('resultDescription');
        
        if (resultCuisine && resultDescription) {
            const cuisineName = resultCuisine.textContent;
            const description = resultDescription.textContent;
            
            // Draw popup title
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Your Result', 300, 80);
            
            // Draw cuisine name
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillText(cuisineName, 300, 200);
            
            // Draw description with text wrapping
            ctx.font = '24px Inter, sans-serif';
            const maxWidth = 500;
            const lineHeight = 30;
            const words = description.split(' ');
            let line = '';
            let y = 280;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, 300, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 300, y);
            
            // Draw emoji representations (guaranteed to work)
            ctx.font = '120px Arial';
            ctx.fillText('🐱', 200, 150); // Cat emoji
            ctx.fillText('🍽️', 400, 150); // Food emoji
        }
        
        console.log('✅ Image fallback created successfully');
        
        // This canvas should always be exportable since it has no external images
        try {
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            const blob = this.dataURLToBlob(dataURL);
            
            if (action === 'download') {
                this.downloadImage(blob);
            } else if (action === 'share') {
                this.performNativeShare(blob);
            }
        } catch (error) {
            console.error('❌ Even image fallback failed:', error);
            alert('Sorry, could not create image. Please try again.');
        }
    }
    
    // Create manual canvas as fallback
    createManualCanvas(sharePopup, action) {
        console.log('🎨 Creating manual canvas...');
        
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        
        // Draw gradient background (same as popup)
        const gradient = ctx.createLinearGradient(0, 0, 0, 800);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);
        
        // Get the current result data
        const resultCuisine = document.getElementById('resultCuisine');
        const resultDescription = document.getElementById('resultDescription');
        const resultOptions = document.getElementById('resultOptions');
        
        if (resultCuisine && resultDescription) {
            const cuisineName = resultCuisine.textContent;
            const description = resultDescription.textContent;
            const options = resultOptions ? resultOptions.textContent : 'No options available';
            
            // Draw popup title
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Your Result', 300, 80);
            
            // Try to load and draw the Cat Love image
            const catImage = new Image();
            catImage.onload = () => {
                // Draw the cat image
                ctx.drawImage(catImage, 150, 100, 200, 240);
                
                // Draw cuisine name
                ctx.font = 'bold 48px Inter, sans-serif';
                ctx.fillText(cuisineName, 300, 200);
                
                // Draw description with text wrapping
                ctx.font = '24px Inter, sans-serif';
                const maxWidth = 500;
                const lineHeight = 30;
                const words = description.split(' ');
                let line = '';
                let y = 280;
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        ctx.fillText(line, 300, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, 300, y);
                
                // Draw popular options
                if (options && options !== 'No options available') {
                    y += 60;
                    ctx.font = 'bold 20px Inter, sans-serif';
                    ctx.fillText('Popular Options:', 300, y);
                    
                    y += 40;
                    ctx.font = '18px Inter, sans-serif';
                    const optionLines = options.split('\n').filter(line => line.trim());
                    optionLines.forEach(option => {
                        ctx.fillText(option.trim(), 300, y);
                        y += 25;
                    });
                }
                
                console.log('✅ Manual canvas with Cat Love image created successfully');
                this.handleImageCapture(canvas, action);
            };
            
            catImage.onerror = () => {
                console.log('⚠️ Could not load Cat Love image, using emoji fallback');
                // Fallback to emoji if image fails to load
                ctx.font = '120px Arial';
                ctx.fillText('🐱', 200, 150); // Cat emoji
                ctx.fillText('🍽️', 400, 150); // Food emoji
                
                // Draw cuisine name
                ctx.font = 'bold 48px Inter, sans-serif';
                ctx.fillText(cuisineName, 300, 200);
                
                // Draw description with text wrapping
                ctx.font = '24px Inter, sans-serif';
                const maxWidth = 500;
                const lineHeight = 30;
                const words = description.split(' ');
                let line = '';
                let y = 280;
                
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        ctx.fillText(line, 300, y);
                        line = words[n] + ' ';
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, 300, y);
                
                // Draw popular options
                if (options && options !== 'No options available') {
                    y += 60;
                    ctx.font = 'bold 20px Inter, sans-serif';
                    ctx.fillText('Popular Options:', 300, y);
                    
                    y += 40;
                    ctx.font = '18px Inter, sans-serif';
                    const optionLines = options.split('\n').filter(line => line.trim());
                    optionLines.forEach(option => {
                        ctx.fillText(option.trim(), 300, y);
                        y += 25;
                    });
                }
                
                console.log('✅ Manual canvas with emoji fallback created successfully');
                this.handleImageCapture(canvas, action);
            };
            
            // Try to load the Cat Love image (prefer the selected per-spin image)
            const preferredCat = this.currentCatLoveDataUrl || null;
            catImage.src = preferredCat || 'Cat love.png';
        } else {
            console.log('✅ Manual canvas created successfully');
            this.handleImageCapture(canvas, action);
        }
    }
    
    // Fallback download method
    createFallbackDownload(sharePopup) {
        console.log('🔄 Using fallback download method...');
        
        // Create a simple text-based share card
        const resultCuisine = document.getElementById('resultCuisine');
        const resultDescription = document.getElementById('resultDescription');
        const resultOptions = document.getElementById('resultOptions');
        
        console.log('📋 Found elements:', {
            cuisine: resultCuisine ? resultCuisine.textContent : 'not found',
            description: resultDescription ? resultDescription.textContent : 'not found',
            options: resultOptions ? resultOptions.textContent : 'not found'
        });
        
        if (resultCuisine && resultDescription) {
            const cuisineName = resultCuisine.textContent;
            const description = resultDescription.textContent;
            const options = resultOptions ? resultOptions.textContent : 'No options available';
            
            const shareText = `🍽️ What to Eat Tonight?\n\nYour Result: ${cuisineName}\n\n${description}\n\nPopular Options:\n${options}\n\nGenerated by Fortune Food Finder! 🌟`;
            
            console.log('📝 Created share text:', shareText);
            
            // Create and download text file
            const blob = new Blob([shareText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `what-to-eat-${cuisineName.toLowerCase().replace(/\s+/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ Text file download initiated');
        } else {
            console.error('❌ Could not find required elements for fallback download');
            alert('Sorry, could not create download. Please try again.');
        }
    }
    
    // Fallback share method
    createFallbackShare(sharePopup) {
        console.log('🔄 Using fallback share method...');
        
        // Create a simple text-based share
        const resultCuisine = document.getElementById('resultCuisine');
        const resultDescription = document.getElementById('resultDescription');
        const resultOptions = document.getElementById('resultOptions');
        
        console.log('📋 Found elements for share:', {
            cuisine: resultCuisine ? resultCuisine.textContent : 'not found',
            description: resultDescription ? resultDescription.textContent : 'not found',
            options: resultOptions ? resultOptions.textContent : 'not found'
        });
        
        if (resultCuisine && resultDescription) {
            const cuisineName = resultCuisine.textContent;
            const description = resultDescription.textContent;
            const options = resultOptions ? resultOptions.textContent : 'No options available';
            
            const shareText = `🍽️ What to Eat Tonight?\n\nYour Result: ${cuisineName}\n\n${description}\n\nPopular Options:\n${options}\n\nGenerated by Fortune Food Finder! 🌟`;
            
            console.log('📝 Created share text:', shareText);
            
            // Try native share
            if (navigator.share) {
                console.log('📱 Attempting native share...');
                navigator.share({
                    title: 'What to Eat Tonight?',
                    text: shareText
                }).then(() => {
                    console.log('✅ Native share successful');
                }).catch(error => {
                    console.log('❌ Native share failed:', error);
                    // Fallback to copy to clipboard
                    this.copyToClipboard(shareText);
                });
            } else {
                console.log('📱 Native share not available, using clipboard...');
                // Fallback to copy to clipboard
                this.copyToClipboard(shareText);
            }
        } else {
            console.error('❌ Could not find required elements for fallback share');
            alert('Sorry, could not create share. Please try again.');
        }
    }
    
    // Copy text to clipboard
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Share text copied to clipboard!');
            }).catch(error => {
                console.error('Clipboard copy failed:', error);
                alert('Share text: ' + text);
            });
        } else {
            alert('Share text: ' + text);
        }
    }
    
    // Convert the popup to canvas for sharing
    convertPopupToCanvas(sharePopup) {
        console.log('🖼️ Converting popup to canvas...');
        console.log('📋 Share popup element:', sharePopup);
        console.log('🔍 html2canvas available:', typeof html2canvas !== 'undefined');
        
        // Use html2canvas if available, otherwise fallback to basic canvas
        if (typeof html2canvas !== 'undefined') {
            console.log('✅ Using html2canvas for conversion');
            console.log('⏱️ Starting html2canvas conversion...');
            
            html2canvas(sharePopup, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                allowTaint: true,
                width: 600,
                height: 800,
                logging: true, // Enable html2canvas logging
                onclone: function(clonedDoc) {
                    console.log('📋 html2canvas cloned document');
                }
            }).then(canvas => {
                console.log('✅ Canvas created successfully with html2canvas');
                console.log('📏 Canvas dimensions:', canvas.width, 'x', canvas.height);
                this.finishSharing(canvas);
                // Remove the share popup
                document.body.removeChild(sharePopup);
            }).catch(error => {
                console.error('❌ Error creating canvas with html2canvas:', error);
                console.error('❌ Error details:', error.message);
                console.error('❌ Error stack:', error.stack);
                // Fallback to basic canvas
                console.log('🔄 Falling back to basic canvas...');
                this.createBasicShareCanvas(sharePopup);
            });
        } else {
            console.log('⚠️ html2canvas not available, using basic canvas');
            this.createBasicShareCanvas(sharePopup);
        }
    }
    

    // Fallback method to create basic share canvas
    createBasicShareCanvas(sharePopup) {
        console.log('🎨 Creating basic share canvas...');
        
        // Create a canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to 3:4 ratio
        const width = 600;
        const height = 800;
        canvas.width = width;
        canvas.height = height;
        
        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Get data from the share popup
        const titleElement = sharePopup.querySelector('h2');
        const cuisineNameElement = sharePopup.querySelector('#shareCuisineName');
        const descriptionElement = sharePopup.querySelector('#shareDescription');
        
        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(titleElement ? titleElement.textContent : '🍽️ What to Eat Tonight?', width/2, 80);
        
        // Add cuisine name
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 42px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cuisineNameElement ? cuisineNameElement.textContent : 'Italian', width/2, 200);
        
        // Add description
        ctx.font = '20px Inter, Arial, sans-serif';
        ctx.fillStyle = '#666666';
        const description = descriptionElement ? descriptionElement.textContent : 'Time for some delicious pasta!';
        
        // Wrap text
        const maxWidth = width - 120;
        const words = description.split(' ');
        let line = '';
        let y = 250;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, width/2, y);
                line = words[n] + ' ';
                y += 30;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width/2, y);
        
        // Add emoji representations
        const catSize = 180;
        const iconSize = 160;
        const spacing = 20;
        const totalWidth = catSize + spacing + iconSize;
        
        const startX = (width - totalWidth) / 2;
        const catX = startX;
        const iconX = startX + catSize + spacing;
        const centerY = 400;
        
        // Draw Cat Love emoji
        ctx.font = `${catSize}px Arial, sans-serif`;
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.fillText('🐱', catX + catSize/2, centerY + catSize/3);
        
        // Draw Cuisine icon
        ctx.font = `${iconSize}px Arial, sans-serif`;
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';
        ctx.fillText('🍕', iconX + iconSize/2, centerY + iconSize/3);
        
        console.log('✅ Basic canvas created successfully');
        this.finishSharing(canvas);
        
        // Remove the share popup
        document.body.removeChild(sharePopup);
    }


    

    
    finishSharing(canvas) {
        console.log('🎯 Finishing sharing process...');
        
        // Try multiple methods to export the canvas
        let blob = null;
        
        // Method 1: Try toDataURL with different approach
        try {
            // Try to create a new canvas and draw the original onto it
            const newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height;
            const newCtx = newCanvas.getContext('2d');
            
            // Try to draw the original canvas onto the new one
            newCtx.drawImage(canvas, 0, 0);
            
            // Try to export the new canvas
            const dataURL = newCanvas.toDataURL('image/jpeg', 0.9);
            console.log('✅ Canvas converted to data URL successfully');
            blob = this.dataURLToBlob(dataURL);
            console.log('📦 Data URL converted to blob:', blob);
        } catch (error) {
            console.log('⚠️ Canvas redraw method failed:', error.message);
        }
        
        // Method 2: Try toBlob (different approach)
        if (!blob) {
            try {
                console.log('🔄 Trying toBlob method...');
                // Use toBlob directly (synchronous check)
                canvas.toBlob((result) => {
                    if (result) {
                        console.log('✅ Canvas converted to blob successfully:', result);
                        this.showSharePreview(result, canvas);
                        return;
                    } else {
                        console.log('⚠️ toBlob returned null, trying next method...');
                        this.tryNextExportMethod(canvas);
                    }
                }, 'image/jpeg', 0.9);
                return; // Exit early since toBlob is async
            } catch (error) {
                console.log('⚠️ toBlob failed:', error.message);
            }
        }
        
        // Method 3: Try canvas.toDataURL with different format
        if (!blob) {
            try {
                console.log('🔄 Trying PNG format...');
                const dataURL = canvas.toDataURL('image/png');
                console.log('✅ Canvas converted to PNG data URL successfully');
                blob = this.dataURLToBlob(dataURL);
                console.log('📦 PNG Data URL converted to blob:', blob);
            } catch (error) {
                console.log('⚠️ PNG toDataURL failed:', error.message);
            }
        }
        
        // If all methods failed, try canvas cloning to preserve the visual
        if (!blob) {
            console.log('⚠️ All export methods failed, trying canvas cloning...');
            this.cloneCanvasToClean(canvas);
            return;
        }
        
        // Share directly without preview
        this.performNativeShare(blob);
    }
    
    // Try next export method when toBlob fails
    tryNextExportMethod(canvas) {
        console.log('🔄 Trying PNG format...');
        try {
            const dataURL = canvas.toDataURL('image/png');
            console.log('✅ Canvas converted to PNG data URL successfully');
            const blob = this.dataURLToBlob(dataURL);
            console.log('📦 PNG Data URL converted to blob:', blob);
            this.performNativeShare(blob);
        } catch (error) {
            console.log('⚠️ PNG toDataURL failed:', error.message);
            console.log('⚠️ All export methods failed, trying canvas cloning...');
            this.cloneCanvasToClean(canvas);
        }
    }
    
    // Convert data URL to blob
    dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }
    
    // Clone tainted canvas to a clean canvas to preserve visual content
    cloneCanvasToClean(taintedCanvas) {
        console.log('🔄 Cloning tainted canvas to clean canvas...');
        
        try {
            // Create a new clean canvas with same dimensions
            const cleanCanvas = document.createElement('canvas');
            cleanCanvas.width = taintedCanvas.width;
            cleanCanvas.height = taintedCanvas.height;
            const cleanCtx = cleanCanvas.getContext('2d');
            
            // Method 1: Try to copy image data directly
            try {
                const imageData = taintedCanvas.getContext('2d').getImageData(0, 0, taintedCanvas.width, taintedCanvas.height);
                cleanCtx.putImageData(imageData, 0, 0);
                console.log('✅ Successfully copied image data to clean canvas');
                
                // Try to export the clean canvas
                const dataURL = cleanCanvas.toDataURL('image/jpeg', 0.9);
                const blob = this.dataURLToBlob(dataURL);
                console.log('✅ Clean canvas exported successfully:', blob);
                this.showSharePreview(blob, cleanCanvas);
                return;
                
            } catch (error) {
                console.log('⚠️ Direct image data copy failed:', error.message);
            }
            
            // Method 2: Try to draw the tainted canvas onto clean canvas
            try {
                cleanCtx.drawImage(taintedCanvas, 0, 0);
                console.log('✅ Successfully drew tainted canvas onto clean canvas');
                
                // Try to export the clean canvas
                const dataURL = cleanCanvas.toDataURL('image/jpeg', 0.9);
                const blob = this.dataURLToBlob(dataURL);
                console.log('✅ Clean canvas exported successfully:', blob);
                this.showSharePreview(blob, cleanCanvas);
                return;
                
            } catch (error) {
                console.log('⚠️ Canvas drawing failed:', error.message);
            }
            
            // Method 3: Try base64 conversion approach
            try {
                // Convert tainted canvas to base64 (this might work even if toDataURL fails)
                const canvasData = taintedCanvas.toDataURL('image/png');
                const img = new Image();
                img.onload = () => {
                    cleanCtx.drawImage(img, 0, 0);
                    const dataURL = cleanCanvas.toDataURL('image/jpeg', 0.9);
                    const blob = this.dataURLToBlob(dataURL);
                    console.log('✅ Base64 conversion successful:', blob);
                    this.showSharePreview(blob, cleanCanvas);
                };
                img.onerror = () => {
                    console.log('⚠️ Base64 conversion failed, falling back to emoji version');
                    this.recreateCleanCanvas(taintedCanvas);
                };
                img.src = canvasData;
                return;
                
            } catch (error) {
                console.log('⚠️ Base64 conversion failed:', error.message);
            }
            
            // If all cloning methods fail, fall back to emoji version
            console.log('⚠️ All cloning methods failed, falling back to emoji version');
            this.recreateCleanCanvas(taintedCanvas);
            
        } catch (error) {
            console.error('❌ Canvas cloning failed:', error);
            console.log('⚠️ Falling back to emoji version');
            this.recreateCleanCanvas(taintedCanvas);
        }
    }
    
    // Recreate a clean canvas without tainted images
    recreateCleanCanvas(originalCanvas) {
        console.log('🔄 Recreating clean canvas...');
        
        // Create a new clean canvas
        const cleanCanvas = document.createElement('canvas');
        cleanCanvas.width = 600;
        cleanCanvas.height = 800;
        const ctx = cleanCanvas.getContext('2d');
        
        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, 800);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);
        
        // Get the current result data
        const resultCuisine = document.getElementById('resultCuisine');
        const resultDescription = document.getElementById('resultDescription');
        const resultOptions = document.getElementById('resultOptions');
        
        if (resultCuisine && resultDescription && resultOptions) {
            const cuisineName = resultCuisine.textContent;
            const description = resultDescription.textContent;
            const options = resultOptions.textContent;
            
            // Draw popup title
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Your Result', 300, 80);
            
            // Draw cuisine name
            ctx.font = 'bold 48px Inter, sans-serif';
            ctx.fillText(cuisineName, 300, 200);
            
            // Draw description with text wrapping
            ctx.font = '24px Inter, sans-serif';
            const maxWidth = 500;
            const lineHeight = 30;
            const words = description.split(' ');
            let line = '';
            let y = 280;
            
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    ctx.fillText(line, 300, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, 300, y);
            
            // Draw popular options
            if (options) {
                y += 60;
                ctx.font = 'bold 20px Inter, sans-serif';
                ctx.fillText('Popular Options:', 300, y);
                
                y += 40;
                ctx.font = '18px Inter, sans-serif';
                const optionLines = options.split('\n').filter(line => line.trim());
                optionLines.forEach(option => {
                    ctx.fillText(option.trim(), 300, y);
                    y += 25;
                });
            }
            
            // Draw emoji representations (since we can't use images)
            ctx.font = '120px Arial';
            ctx.fillText('🐱', 200, 150); // Cat emoji
            ctx.fillText('🍽️', 400, 150); // Food emoji
        }
        
        console.log('✅ Clean canvas created successfully');
        this.finishSharing(cleanCanvas);
    }
    
    // Show preview of the share card before sharing
    showSharePreview(blob, canvas) {
        console.log('🖼️ Showing share preview...');
        
        // Create preview modal
        const previewModal = document.createElement('div');
        previewModal.className = 'share-modal share-preview-modal';
        previewModal.innerHTML = `
            <div class="share-modal-content share-preview-content">
                <div class="share-modal-body">
                    <h3>📱 Share Preview</h3>
                    <p>Here's your share card:</p>
                    <div class="share-preview-image">
                        <img id="sharePreviewImg" alt="Share Card Preview" />
                    </div>
                    <div class="share-preview-actions">
                        <button class="share-btn download" data-action="download">
                            💾 Download Image
                        </button>
                        <button class="share-btn share" data-action="share">
                            📤 Share Now
                        </button>
                        <button class="share-btn social" data-action="social">
                            🌐 Social Media
                        </button>
                    </div>
                </div>
                <button class="close-share-btn">✖️ Close</button>
            </div>
        `;
        
        document.body.appendChild(previewModal);
        console.log('✅ Share preview modal added to page');
        
        // Set the preview image
        const previewImg = previewModal.querySelector('#sharePreviewImg');
        const imageUrl = URL.createObjectURL(blob);
        previewImg.src = imageUrl;
        
        // Add event listeners for action buttons
        const actionButtons = previewModal.querySelectorAll('.share-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                console.log('🔘 Preview action clicked:', action);
                
                switch(action) {
                    case 'download':
                        this.downloadImage(blob);
                        previewModal.remove();
                        break;
                    case 'share':
                        this.performNativeShare(blob);
                        previewModal.remove();
                        break;
                    case 'social':
                        this.showShareOptions(blob);
                        previewModal.remove();
                        break;
                }
            });
        });
        
        // Add close button functionality
        const closeBtn = previewModal.querySelector('.close-share-btn');
        closeBtn.addEventListener('click', () => {
            console.log('❌ Closing share preview...');
            URL.revokeObjectURL(imageUrl); // Clean up the blob URL
            previewModal.remove();
        });
        
        // Close modal when clicking outside
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                console.log('❌ Closing share preview (outside click)...');
                URL.revokeObjectURL(imageUrl); // Clean up the blob URL
                previewModal.remove();
            }
        });
        
        // Show modal with animation
        setTimeout(() => previewModal.classList.add('show'), 10);
    }
    
    // Perform native sharing (prefer sharing image file over links)
    performNativeShare(blob) {
        console.log('📱 Performing native share (image file preferred)...');

        try {
            const file = new File([blob], 'food-result.jpg', { type: 'image/jpeg' });
            const shareData = {
                title: '🍽️ What to Eat Tonight? - Fortune Food Finder',
                text: `I got ${document.getElementById('resultCuisine').textContent} for dinner! 🎯`,
                files: [file]
            };

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                console.log('📤 Using navigator.share with files...');
                navigator.share(shareData)
                    .then(() => {
                        console.log('✅ Shared image successfully');
                    })
                    .catch((error) => {
                        console.log('❌ Error sharing image:', error);
                        // Fallback: download so user can attach manually
                        this.downloadImage(blob);
                        alert('Your browser could not share the image directly. The image was downloaded so you can attach it in the app.');
                    });
                return;
            }

            // If files are not supported, fall back to download (no link sharing)
            console.log('ℹ️ navigator.canShare with files not supported. Falling back to download.');
            this.downloadImage(blob);
            alert('Your browser cannot share images directly. The image was downloaded so you can attach it in WhatsApp/Facebook/Instagram.');
        } catch (err) {
            console.log('❌ Share setup failed, falling back to download:', err);
            this.downloadImage(blob);
            alert('Sharing is not supported here. The image was downloaded so you can attach it manually.');
        }
    }
    
    // Helper method to download image
    downloadImage(blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'food-result.jpg';
        link.click();
        console.log('💾 Download initiated');
    }
    
    showShareOptions(blob) {
        console.log('🎨 Showing share options modal...');
        // Create share options modal
        const shareModal = document.createElement('div');
        shareModal.className = 'share-modal';
        shareModal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-body">
                    <h3>Share Your Result</h3>
                    <p>Choose how you'd like to share:</p>
                    <div class="share-buttons">
                        <button class="share-btn whatsapp" data-action="whatsapp">
                            📱 WhatsApp
                        </button>
                        <button class="share-btn facebook" data-action="facebook">
                            📘 Facebook
                        </button>
                        <button class="share-btn instagram" data-action="instagram">
                            📷 Instagram
                        </button>
                        <button class="share-btn download" data-action="download">
                            💾 Download Image
                        </button>
                    </div>
                </div>
                <button class="close-share-btn">✖️ Close</button>
            </div>
        `;
        
        document.body.appendChild(shareModal);
        console.log('✅ Share modal added to page');
        
        // Add event listeners for share buttons
        const shareButtons = shareModal.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                console.log('🔘 Share button clicked:', action);
                
                switch(action) {
                    case 'whatsapp':
                        this.performNativeShare(blob);
                        break;
                    case 'facebook':
                        this.performNativeShare(blob);
                        break;
                    case 'instagram':
                        this.performNativeShare(blob);
                        break;
                    case 'download':
                        this.downloadImage(blob);
                        break;
                }
            });
        });
        
        // Add close button functionality
        const closeBtn = shareModal.querySelector('.close-share-btn');
        closeBtn.addEventListener('click', () => {
            console.log('❌ Closing share modal...');
            shareModal.remove();
        });
        
        // Close modal when clicking outside
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                console.log('❌ Closing share modal (outside click)...');
                shareModal.remove();
            }
        });
    }
    
    hideResult() {
        this.resultPopup.classList.remove('show');
    }
    
    updateCharacterMessage(message) {
        // Character messages disabled - no speech bubble
        return;
    }

    animateCharacter(emotion) {
        const characterImage = document.querySelector('.character-image');
        
        // Remove existing animation classes
        characterImage.classList.remove('character-excited', 'character-concentrating', 'character-happy');
        
        // Add new animation based on emotion
        switch(emotion) {
            case 'excited':
                characterImage.style.animation = 'characterExcited 1.5s ease-in-out';
                break;
            case 'concentrating':
                characterImage.style.animation = 'characterConcentrating 3s ease-in-out infinite';
                break;
            case 'happy':
                characterImage.style.animation = 'characterHappy 2s ease-in-out';
                break;
            default:
                characterImage.style.animation = 'characterFloat 3s ease-in-out infinite';
        }
        
        // Reset to default after animation
        setTimeout(() => {
            if(emotion !== 'concentrating') {
                characterImage.style.animation = 'characterFloat 3s ease-in-out infinite';
            }
        }, emotion === 'happy' ? 2000 : 1500);
    }
    
    triggerMagicStars() {
        const magicStars = document.querySelector('.magic-stars');
        if (magicStars) {
            magicStars.classList.add('active');
        }
    }
    
    stopMagicStars() {
        const magicStars = document.querySelector('.magic-stars');
        if (magicStars) {
            magicStars.classList.remove('active');
        }
    }

    showBookmarkInstructions() {
        // Detect platform for appropriate instructions
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        // Get current language from config
        let currentLang = 'en';
        try {
            currentLang = window.configLoader?.config?.currentLanguage || 'en';
        } catch (error) {
            // Config loader not available, use default language
        }
        const isChinese = currentLang === 'zh_hk';
        
        let title = '';
        let steps = [];
        
        if (isIOS) {
            title = isChinese ? '📱 加入iPhone/iPad主畫面' : '📱 Add to iPhone/iPad Home Screen';
            if (isChinese) {
                steps = [
                    { step: '1', content: '<strong>點擊分享按鈕</strong> <span class="share-icon">⬆️</span> 喺Safari底部' },
                    { step: '2', content: '<strong>向下滾動並點擊「加入主畫面」</strong> 📱' },
                    { step: '3', content: '<strong>點擊「加入」</strong> 建立捷徑' }
                ];
            } else {
                steps = [
                    { step: '1', content: '<strong>Tap the Share button</strong> <span class="share-icon">⬆️</span> at the bottom of Safari' },
                    { step: '2', content: '<strong>Scroll down and tap "Add to Home Screen"</strong> 📱' },
                    { step: '3', content: '<strong>Tap "Add"</strong> to create the shortcut' }
                ];
            }
        } else if (isAndroid) {
            title = isChinese ? '📱 加入Android主畫面' : '📱 Add to Android Home Screen';
            if (isChinese) {
                steps = [
                    { step: '1', content: '<strong>點擊選單 (⋮)</strong> 喺Chrome瀏覽器中' },
                    { step: '2', content: '<strong>點擊「加入主畫面」</strong> 📱' },
                    { step: '3', content: '<strong>點擊「加入」</strong> 建立捷徑' }
                ];
            } else {
                steps = [
                    { step: '1', content: '<strong>Tap the menu (⋮)</strong> in Chrome browser' },
                    { step: '2', content: '<strong>Tap "Add to Home screen"</strong> 📱' },
                    { step: '3', content: '<strong>Tap "Add"</strong> to create the shortcut' }
                ];
            }
        } else {
            title = isChinese ? '💻 將此網站加入書籤' : '💻 Bookmark This Site';
            if (isChinese) {
                steps = [
                    { step: '1', content: '<strong>按Ctrl+D</strong> (Windows) 或 <strong>Cmd+D</strong> (Mac)' },
                    { step: '2', content: '<strong>選擇書籤位置</strong> (建議放喺書籤列)' },
                    { step: '3', content: '<strong>點擊「儲存」</strong> 或按Enter' }
                ];
            } else {
                steps = [
                    { step: '1', content: '<strong>Press Ctrl+D</strong> (Windows) or <strong>Cmd+D</strong> (Mac)' },
                    { step: '2', content: '<strong>Choose bookmark location</strong> (Bookmarks Bar recommended)' },
                    { step: '3', content: '<strong>Click "Save"</strong> or press Enter' }
                ];
            }
        }
        
        this.showBookmarkPopup(title, steps, isChinese);
    }

    showBookmarkPopup(title, steps, isChinese) {
        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay bookmark-popup';
        
        // Create content step by step to avoid template literal issues
        const popupContent = document.createElement('div');
        popupContent.className = 'popup-content bookmark-content';
        
        const popupHeader = document.createElement('div');
        popupHeader.className = 'popup-header';
        popupHeader.innerHTML = '<div class="result-icon">🔖</div><h2>' + title + '</h2>';
        
        const popupBody = document.createElement('div');
        popupBody.className = 'popup-body';
        const instructionsDiv = document.createElement('div');
        instructionsDiv.className = 'bookmark-instructions';
        
        // Create instruction steps
        steps.forEach(stepData => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'instruction-step';
            
            const stepNumber = document.createElement('div');
            stepNumber.className = 'step-number';
            stepNumber.textContent = stepData.step;
            
            const stepContent = document.createElement('div');
            stepContent.className = 'step-content';
            stepContent.innerHTML = stepData.content;
            
            stepDiv.appendChild(stepNumber);
            stepDiv.appendChild(stepContent);
            instructionsDiv.appendChild(stepDiv);
        });
        
        // Add instruction note
        const noteDiv = document.createElement('div');
        noteDiv.className = 'instruction-note';
        if (isChinese) {
            noteDiv.innerHTML = '✨ 應用程式會出現喺你嘅主畫面，方便快速存取！';
            if (!navigator.userAgent.match(/iPhone|iPad|iPod|Android/)) {
                noteDiv.innerHTML = '✨ 另一種方法：點擊瀏覽器網址列中嘅星星 ⭐';
            }
        } else {
            noteDiv.innerHTML = '✨ The app will appear on your home screen for quick access!';
            if (!navigator.userAgent.match(/iPhone|iPad|iPod|Android/)) {
                noteDiv.innerHTML = '✨ Alternative: Click the star ⭐ in your browser\'s address bar';
            }
        }
        instructionsDiv.appendChild(noteDiv);
        
        popupBody.appendChild(instructionsDiv);
        
        const popupActions = document.createElement('div');
        popupActions.className = 'popup-actions';
        const closeButton = document.createElement('button');
        closeButton.className = 'popup-btn primary bookmark-close';
        closeButton.textContent = isChinese ? '✅ 明白了！' : '✅ Got It!';
        popupActions.appendChild(closeButton);
        
        popupContent.appendChild(popupHeader);
        popupContent.appendChild(popupBody);
        popupContent.appendChild(popupActions);
        overlay.appendChild(popupContent);
        
        // Add to page
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => overlay.classList.add('show'), 10);
        
        // Close functionality
        closeButton.addEventListener('click', () => {
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
        });
        
        // Close on background click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
                setTimeout(() => document.body.removeChild(overlay), 300);
            }
        });
    }
    
    bindEvents() {
        // Spin button
        this.spinButton.addEventListener('click', () => this.spin());
        
        // Popup buttons
        document.getElementById('spinAgain').addEventListener('click', () => {
            this.hideResult();
            this.updateCharacterMessage("🔮 Ready for another mystical revelation?");
        });
        
        document.getElementById('closePopup').addEventListener('click', () => {
            this.hideResult();
            this.updateCharacterMessage("😊 Hope you enjoy your meal! Come back anytime for more food wisdom!");
        });
        
        document.getElementById('findRestaurants').addEventListener('click', () => {
            const cuisine = document.getElementById('resultCuisine').textContent;
            const searchQuery = `${cuisine} restaurants near me`;
            window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank');
        });
        
        // Share button
        document.getElementById('shareResult').addEventListener('click', () => {
            this.shareResult();
        });
        
        // Action buttons
        document.getElementById('feelingLucky').addEventListener('click', () => {
            this.showBookmarkInstructions();
        });
        
        document.getElementById('resetWheel').addEventListener('click', () => {
            this.currentRotation = 0;
            this.drawWheel();
            this.updateCharacterMessage("🔮 The wheel has been reset! Ready to discover your next meal?");
        });
        
        // Close popup when clicking outside
        this.resultPopup.addEventListener('click', (e) => {
            if (e.target === this.resultPopup) {
                this.hideResult();
                this.updateCharacterMessage("😊 Come back when you're ready to let fate decide your meal!");
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.isSpinning) {
                e.preventDefault();
                this.spin();
            } else if (e.code === 'Escape' && this.resultPopup.classList.contains('show')) {
                this.hideResult();
                this.updateCharacterMessage("😊 Hope you enjoy your meal! Come back anytime for more food wisdom!");
            }
        });
        
        // Mouse hover effects with throttling for smooth performance
        let hoverAnimationFrame = null;
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isSpinning) return;
            
            if (hoverAnimationFrame) {
                cancelAnimationFrame(hoverAnimationFrame);
            }
            
            hoverAnimationFrame = requestAnimationFrame(() => {
                const newHoveredSegment = this.getMouseSegment(e.clientX, e.clientY);
                if (newHoveredSegment !== this.hoveredSegment) {
                    this.hoveredSegment = newHoveredSegment;
                    this.drawWheel();
                    
                                    // Update character message on hover
                if (this.hoveredSegment >= 0) {
                    const cuisine = this.cuisines[this.hoveredSegment];
                    this.updateCharacterMessage(`✨ ${cuisine.name} cuisine is calling to you! ${cuisine.icon}`);
                    this.animateCharacter('excited');
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.updateCharacterMessage("🔮 Hover over a cuisine to feel its magical energy!");
                    this.canvas.style.cursor = 'default';
                }
                }
            });
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            if (this.hoveredSegment !== -1) {
                this.hoveredSegment = -1;
                this.drawWheel();
                // Character messages disabled
                this.canvas.style.cursor = 'default';
            }
        });
        
        // Click on segment to select
        this.canvas.addEventListener('click', (e) => {
            if (this.isSpinning) return;
            
            const clickedSegment = this.getMouseSegment(e.clientX, e.clientY);
            if (clickedSegment >= 0) {
                // Animate to selected segment
                this.spinToSegment(clickedSegment);
            } else {
                this.spin();
            }
        });

        // Touch support for mobile
        let touchStartY = 0;
        let touchEndY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            if (Math.abs(touchStartY - touchEndY) < 50 && !this.isSpinning) {
                this.spin();
            }
        });
    }
}

// Character interaction system
class CharacterInteractions {
    constructor() {
        this.messages = {
            welcome: [
                "🔮 Welcome, hungry soul! Let me peer into your culinary future...",
                "✨ Ah, I sense great appetite in you! Shall we discover your destined meal?",
                "🌟 The food spirits are calling! Ready to uncover tonight's perfect dish?"
            ],
            spinning: [
                "✨ The magic is happening! Let me see what the universe has planned...",
                "🔮 The cosmic flavors are aligning... almost there...",
                "⭐ I'm channeling the food spirits for you... patience, dear seeker!"
            ],
            results: [
                "🎉 The stars have spoken! Your culinary destiny awaits!",
                "✨ Behold! The universe has chosen your perfect meal!",
                "🔮 My crystal ball reveals your delicious fate!"
            ],
            encouragement: [
                "🌟 Don't like that choice? The wheel of fortune is always ready to spin again!",
                "✨ Remember, every meal is a new adventure waiting to happen!",
                "🔮 Trust in the magic - sometimes the best meals are the unexpected ones!"
            ]
        };
        
        this.currentMood = 'welcome';
        this.init();
    }
    
    init() {
        // Add subtle character animations
        this.addCharacterAnimations();
        
        // Character messages disabled - no initial message
        // this.showRandomMessage('welcome');
    }
    
    addCharacterAnimations() {
        const characterImage = document.querySelector('.character-image');
        
        if (!characterImage) {
            console.warn('⚠️ Character image not found, skipping character animations');
            return;
        }
        
        // Add hover effect
        characterImage.addEventListener('mouseenter', () => {
            characterImage.style.transform = 'scale(1.05)';
            // Character messages disabled
            // this.showRandomMessage('encouragement');
        });
        
        characterImage.addEventListener('mouseleave', () => {
            characterImage.style.transform = 'scale(1)';
        });
        
        // Random character interactions - reduced frequency to prevent errors
        setInterval(() => {
            if (Math.random() < 0.05) { // Reduced from 0.1 to 0.05 (5% chance)
                this.randomCharacterAction();
            }
        }, 15000); // Increased from 10 to 15 seconds
    }
    
    showRandomMessage(type) {
        // Character messages disabled - return early
        return;
        
        const messages = this.messages[type] || this.messages.welcome;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const messageElement = document.getElementById('character-message');
        if (!messageElement) {
            console.warn('⚠️ Character message element not found, skipping message display');
            return;
        }
        
        messageElement.textContent = randomMessage;
        
        // Add subtle animation
        messageElement.style.opacity = '0.7';
        setTimeout(() => {
            messageElement.style.opacity = '1';
        }, 200);
    }
    
    randomCharacterAction() {
        const characterImage = document.querySelector('.character-image');
        
        if (!characterImage) {
            console.warn('⚠️ Character image not found, skipping random action');
            return;
        }
        
        // Random blink or subtle bounce
        if (Math.random() < 0.3) {
            // Trigger extra blink
            this.triggerCatBlink();
        } else {
            // Subtle bounce animation
            characterImage.style.animation = 'none';
            setTimeout(() => {
                characterImage.style.animation = 'characterFloat 3s ease-in-out infinite';
            }, 50);
        }
        
        // Character messages disabled
        // if (Math.random() < 0.5) {
        //     this.showRandomMessage('encouragement');
        // }
    }

    triggerCatBlink() {
        const characterWrapper = document.querySelector('.character-wrapper');
        if (!characterWrapper) {
            console.warn('⚠️ Character wrapper not found, skipping blink animation');
            return;
        }
        
        characterWrapper.style.setProperty('--blink-trigger', '1');
        
        setTimeout(() => {
            characterWrapper.style.setProperty('--blink-trigger', '0');
        }, 200);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 FortuneWheel initializing...');
    
    // Initialize fortune wheel (but don't draw yet)
    const fortuneWheel = new FortuneWheel();
    
    // Make it globally accessible for config loader
    window.fortuneWheel = fortuneWheel;
    
    // Initialize character interactions
    const characterInteractions = new CharacterInteractions();
    
    // Function to show the app
    const showAppWhenReady = () => {
        console.log('🎯 showAppWhenReady called');
        // Initialize the wheel now that config is loaded
        fortuneWheel.init();
        
        // Hide loading overlay and show app
        const loadingOverlay = document.getElementById('loadingOverlay');
        const appContainer = document.querySelector('.app-container');
        
        if (loadingOverlay && appContainer) {
            loadingOverlay.classList.add('hidden');
            appContainer.classList.add('loaded');
            console.log('✅ Loading overlay hidden, app container shown');
        } else {
            console.warn('⚠️ Loading overlay or app container not found');
        }
        
        console.log('🎉 App is now ready and visible!');
    };
    
    // Function to show app with fallback timing
    const showAppWithFallback = () => {
        console.log('⏰ Fallback timer triggered');
        // Wait a bit more for config loader to be ready
        setTimeout(() => {
            if (window.configLoader && window.configLoader.isReady) {
                console.log('✅ Config loader ready in fallback, showing app');
                showAppWhenReady();
            } else {
                // If still not ready, show app anyway
                console.log('⚠️ Config loader not ready in fallback, showing app with defaults');
                showAppWhenReady();
            }
        }, 500);
    };
    
    // Function to show manual load button
    const showManualLoadButton = () => {
        const manualBtn = document.getElementById('manualLoadBtn');
        if (manualBtn) {
            manualBtn.style.display = 'block';
            manualBtn.addEventListener('click', () => {
                console.log('🔄 Manual load triggered');
                showAppWhenReady();
            });
        }
    };
    
    // Function to wait for config loader
    const waitForConfigLoader = () => {
        return new Promise((resolve) => {
            const checkConfigLoader = () => {
                if (window.configLoader) {
                    console.log('✅ Config loader found, resolving promise');
                    resolve(window.configLoader);
                } else {
                    console.log('⏳ Config loader not found, checking again in 100ms...');
                    setTimeout(checkConfigLoader, 100);
                }
            };
            checkConfigLoader();
        });
    };
    
    // Main initialization logic
    const initializeApp = async () => {
        try {
            console.log('🔄 Starting app initialization...');
            
            // Wait for config loader to be available
            const configLoader = await waitForConfigLoader();
            console.log('📋 Config loader available:', configLoader);
            
            // Check if config is already ready
            if (configLoader.isReady) {
                console.log('✅ Config already ready, showing app immediately');
                showAppWhenReady();
            } else {
                console.log('⏳ Config not ready, waiting for onReady callback...');
                // Wait for config to be ready
                configLoader.onReady(() => {
                    console.log('🎉 Config ready callback received!');
                    showAppWhenReady();
                });
                
                // Set fallback timeout
                setTimeout(showAppWithFallback, 3000);
                // Show manual button after 5 seconds
                setTimeout(showManualLoadButton, 5000);
            }
            
        } catch (error) {
            console.error('❌ Error during app initialization:', error);
            // Fallback: show app anyway
            setTimeout(showAppWhenReady, 1000);
        }
    };
    
    // Start initialization
    initializeApp();
    
    // Add global event listener for config ready
    window.addEventListener('configReady', () => {
        console.log('🎉 Global config ready event received!');
        if (!window.fortuneWheel.initialized) {
            showAppWhenReady();
        }
    });
    
    // PWA-like features
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker registration failed, but app still works
        });
    }
    
    // Add app to home screen prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        deferredPrompt = e;
        // Could show install banner here if desired
    });
    
    // Analytics-like event tracking (placeholder)
    const trackEvent = (action, category = 'Fortune Wheel') => {
        console.log(`Event: ${category} - ${action}`);
        // In production, this would send to analytics service
    };
    
    // Track user interactions
    document.getElementById('spinButton').addEventListener('click', () => {
        trackEvent('Wheel Spin');
    });
    
    document.getElementById('findRestaurants').addEventListener('click', () => {
        trackEvent('Find Restaurants');
    });
    
    // Add some fun Easter eggs
    let konamiCode = [];
    const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.keyCode);
        konamiCode = konamiCode.slice(-konamiSequence.length);
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            // Konami code activated - show in console instead of DOM
            console.log("🎉 Konami code activated! You've unlocked the secret of the mystical food oracle!");
            
            // Could add special effects here
            // For now, just show a console message
            const specialMessage = "🎉 Konami code activated! You've unlocked the secret of the mystical food oracle!";
            console.log(specialMessage);
            
            // Optional: Show a temporary notification on the page
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 25px;
                border-radius: 25px;
                font-weight: bold;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                animation: slideDown 0.5s ease-out;
            `;
            notification.textContent = specialMessage;
            document.body.appendChild(notification);
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        }
    });
    
    console.log('🍽️ Fortune Food Finder loaded successfully!');
    console.log('💡 Tip: Press spacebar to spin the wheel, ESC to close popups');
    console.log('🎮 Easter egg: Try the Konami code for a surprise!');
});
