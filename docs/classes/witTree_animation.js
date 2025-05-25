export class WitTreeAnimator {
    constructor(treeElement) {
        this.treeElement = typeof treeElement === 'string' ? document.getElementById(treeElement) : treeElement;
        if (!this.treeElement) {
            console.error("Tree element not found");
            return;
        }
        
        this.isGlowing = false;
        this.isSpeaking = false;
        this.isSwaying = false;
        this.originalTransform = this.treeElement.style.transform || '';
        this.angle = 0;
        this.swayInterval = null;
        this.pulseInterval = null;
        this.leafCreationInterval = null;
        this.playerProximity = 0; // 0-1 value for how close player is
        this.glowIntensity = 0;
        this.faceMood = 'neutral'; // neutral, happy, thinking, speaking
        
        this.setupFaceElements();
        this.setupAnimationElements();
        this.startBaseAnimations();
        this.setupEventListeners();
    }
    
    setupFaceElements() {
        this.faceElement = document.createElement('div');
        this.faceElement.classList.add('wit-tree-face');
        
        this.leftEye = document.createElement('div');
        this.leftEye.classList.add('wit-tree-eye', 'left-eye');
        
        this.rightEye = document.createElement('div');
        this.rightEye.classList.add('wit-tree-eye', 'right-eye');
        
        this.mouth = document.createElement('div');
        this.mouth.classList.add('wit-tree-mouth');
        
        this.faceElement.appendChild(this.leftEye);
        this.faceElement.appendChild(this.rightEye);
        this.faceElement.appendChild(this.mouth);
        
        setTimeout(() => {
            const treeRect = this.treeElement.getBoundingClientRect();
            this.faceElement.style.position = 'absolute';
            this.faceElement.style.top = '40px';
            this.faceElement.style.left = '130px';
            this.faceElement.style.width = '60px';
            this.faceElement.style.height = '60px';
            this.treeElement.appendChild(this.faceElement);
        }, 100);
    }
    
    setupAnimationElements() {
        this.glowElement = document.createElement('div');
        this.glowElement.classList.add('wit-tree-glow');
       
        this.auraContainer = document.createElement('div');
        this.auraContainer.classList.add('wit-tree-aura-container');
        
        this.wisdomParticlesContainer = document.createElement('div');
        this.wisdomParticlesContainer.classList.add('wit-tree-wisdom-particles');
        
        this.shadowOverlay = document.createElement('div');
        this.shadowOverlay.classList.add('wit-tree-shadow');
        
        this.treeElement.appendChild(this.shadowOverlay);
        this.treeElement.appendChild(this.glowElement);
        this.treeElement.appendChild(this.auraContainer);
        this.treeElement.appendChild(this.wisdomParticlesContainer);
        
        this.addAnimationStyles();
    }
    
    addAnimationStyles() {
        if (document.getElementById('wit-tree-animation-styles')) {
            return;
        }
        const styleElement = document.createElement('style');
        styleElement.id = 'wit-tree-animation-styles';
        styleElement.textContent = `
            /* Wit Tree Animation Styles */
            .wit-tree {
                position: relative;
                transition: transform 0.3s ease, filter 0.5s ease;
            }
            
            .wit-tree-glow {
                position: absolute;
                top: -30px;
                left: -30px;
                right: -30px;
                bottom: -30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,190,0.6) 0%, rgba(255,255,190,0) 70%);
                opacity: 0;
                transition: opacity 0.5s ease, transform 0.5s ease;
                pointer-events: none;
                z-index: -1;
            }
            
            .wit-tree-glow.active {
                opacity: 1;
                animation: pulse 2s infinite alternate;
            }
            
            .wit-tree-aura-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: visible;
                z-index: -1;
            }
            
            .wit-tree-aura-particle {
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: rgba(255, 255, 220, 0.6);
                pointer-events: none;
            }
            
            .wit-tree-wisdom-particles {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: visible;
            }
            
            .wit-tree-wisdom-particle {
                position: absolute;
                font-size: 16px;
                color: rgba(100, 145, 70, 0.8);
                text-shadow: 0 0 5px rgba(255, 255, 220, 0.8);
                pointer-events: none;
                opacity: 0;
            }
            
            .wit-tree-shadow {
                position: absolute;
                bottom: -10px;
                left: 50%;
                transform: translateX(-50%);
                width: 80%;
                height: 20px;
                background: radial-gradient(ellipse, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0) 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: -2;
            }
            
            .wit-tree-face {
                position: absolute;
                pointer-events: none;
                z-index: 2;
                transition: transform 0.3s ease;
            }
            
            .wit-tree-eye {
                position: absolute;
                width: 14px;
                height: 14px;
                background-color: #3c280e;
                border-radius: 50%;
                border: 2px solid #59380d;
                transition: all 0.3s ease;
            }
            
            .wit-tree-eye.left-eye {
                left: 10px;
                top: 15px;
            }
            
            .wit-tree-eye.right-eye {
                right: 10px;
                top: 15px;
            }
            
            .wit-tree-mouth {
                position: absolute;
                width: 30px;
                height: 10px;
                bottom: 15px;
                left: 50%;
                transform: translateX(-50%);
                background-color: transparent;
                border-bottom: 3px solid #3c280e;
                border-radius: 0 0 100% 100%;
                transition: all 0.3s ease;
            }
            
            .wit-tree.speaking .wit-tree-mouth {
                height: 15px;
                border-radius: 50%;
                border: none;
                background-color: #3c280e;
                animation: speak 0.5s infinite alternate;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.05); opacity: 0.8; }
            }
            
            @keyframes speak {
                0% { height: 5px; width: 20px; }
                100% { height: 15px; width: 30px; }
            }
            
            @keyframes blink {
                0% { transform: scaleY(1); }
                10% { transform: scaleY(0.1); }
                20% { transform: scaleY(1); }
                100% { transform: scaleY(1); }
            }
            
            @keyframes float-up {
                0% { transform: translateY(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: translateY(-100px); opacity: 0; }
            }
            
            .falling-leaf {
                filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.2));
                z-index: 1;
            }
        `;
        
        document.head.appendChild(styleElement);
    }
    
    startBaseAnimations() {
        this.startSwaying();
        this.startEyeBlinking();
        this.startLeafCreation();
    }
    
    startSwaying() {
        this.isSwaying = true;
        this.angle = 0;
        
        const sway = () => {
            this.angle += 0.02;
            const baseSwayAmount = Math.sin(this.angle) * 3;
            const swayFactor = this.isSpeaking ? 1.2 : 1;
            const swayAmount = baseSwayAmount * swayFactor;
            
            this.treeElement.style.transform = `rotate(${swayAmount}deg)`;
            requestAnimationFrame(sway);
        };
        
        requestAnimationFrame(sway);
    }
    
    stopSwaying() {
        this.isSwaying = false;
    }
    
    startEyeBlinking() {
        const blink = () => {
            if (Math.random() > 0.7) {
                this.leftEye.style.animation = 'blink 1s';
                this.rightEye.style.animation = 'blink 1s';
                
                setTimeout(() => {
                    this.leftEye.style.animation = '';
                    this.rightEye.style.animation = '';
                }, 1000);
            }
            
            setTimeout(blink, 2000 + Math.random() * 4000);
        };
    
        setTimeout(blink, 2000);
    }
    
    startLeafCreation() {
        this.leafCreationInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                if (typeof createFallingLeaf === 'function') {
                    createFallingLeaf(this.treeElement);
                }
            }
        }, 3000);
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (event) => {
            if (!this.leftEye || !this.rightEye) return;
            
            const treeRect = this.treeElement.getBoundingClientRect();
            const treeCenterX = treeRect.left + treeRect.width / 2;
            const treeCenterY = treeRect.top + treeRect.height / 2;
            
            // Calculate direction to look (normalized -1 to 1)
            const maxLookDistance = 200;
            const xDiff = (event.clientX - treeCenterX) / maxLookDistance;
            const yDiff = (event.clientY - treeCenterY) / maxLookDistance;
            
            // Limit look range
            const lookX = Math.max(-1, Math.min(1, xDiff)) * 3;
            const lookY = Math.max(-1, Math.min(1, yDiff)) * 2;
            
            // Apply to eyes with subtle delay for natural movement
            setTimeout(() => {
                this.leftEye.style.transform = `translate(${lookX}px, ${lookY}px)`;
                this.rightEye.style.transform = `translate(${lookX}px, ${lookY}px)`;
            }, 50);
            
            // Also calculate distance for proximity effects
            const distance = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
            const proximity = Math.max(0, 1 - distance / 2);
            
            if (proximity > 0.5 && proximity > this.playerProximity) {
                // Player is getting closer, show reaction
                this.playerProximity = proximity;
                if (proximity > 0.8) {
                    this.triggerReactionToPlayerApproach();
                }
            } else {
                this.playerProximity = proximity;
            }
        });
        document.addEventListener('click', () => {
            addStorytellerStyles();
            showStorytellerDialog();
        });


    }

    activateGlowEffect() {
        if (!this.isGlowing) {
            this.glowElement.classList.add('active');
            this.isGlowing = true;
            
            // Create floating aura particles for enhanced effect
            this.createAuraParticles();
            
            // Auto-disable after 5 seconds if not manually disabled
            setTimeout(() => {
                this.deactivateGlowEffect();
            }, 5000);
        }
    }
    
    deactivateGlowEffect() {
        if (this.isGlowing) {
            this.glowElement.classList.remove('active');
            this.isGlowing = false;
        }
    }
    
    startSpeakingAnimation() {
        if (!this.isSpeaking) {
            this.treeElement.classList.add('speaking');
            this.isSpeaking = true;
            
            // Change mouth shape
            if (this.mouth) {
                this.mouth.style.height = '15px';
                this.mouth.style.borderRadius = '50%';
                this.mouth.style.border = 'none';
                this.mouth.style.backgroundColor = '#3c280e';
            }
            
            // Emit wisdom particles periodically while speaking
            this.wisdomParticlesInterval = setInterval(() => {
                this.createWisdomParticle();
            }, 800);
        }
    }
    
    stopSpeakingAnimation() {
        if (this.isSpeaking) {
            this.treeElement.classList.remove('speaking');
            this.isSpeaking = false;
            
            // Reset mouth shape
            if (this.mouth) {
                this.mouth.style.height = '10px';
                this.mouth.style.borderRadius = '0 0 100% 100%';
                this.mouth.style.borderBottom = '3px solid #3c280e';
                this.mouth.style.backgroundColor = 'transparent';
            }
            
            // Stop wisdom particles
            clearInterval(this.wisdomParticlesInterval);
        }
    }
    
    triggerReactionToPlayerApproach() {
        this.activateGlowEffect();
        
        // Subtle scale change to acknowledge player
        const currentTransform = this.treeElement.style.transform || '';
        this.treeElement.style.transform = `${currentTransform} scale(1.03)`;
        setTimeout(() => {
            this.treeElement.style.transform = currentTransform;
        }, 300);
        
        // Quick eye movement to look at player
        if (this.leftEye && this.rightEye) {
            const randomDirection = Math.random() > 0.5 ? 1 : -1;
            this.leftEye.style.transform = `translate(${randomDirection * 3}px, 0)`;
            this.rightEye.style.transform = `translate(${randomDirection * 3}px, 0)`;
            
            // And back to normal after a moment
            setTimeout(() => {
                this.leftEye.style.transform = '';
                this.rightEye.style.transform = '';
            }, 1000);
        }
        
        // Happy face briefly
        if (this.mouth) {
            this.mouth.style.borderBottom = '3px solid #3c280e';
            this.mouth.style.borderRadius = '0 0 100% 100%';
            this.mouth.style.height = '15px';
        }
    }
    
    // Helper methods for particles and effects
    
    createAuraParticles() {
        const createParticle = () => {
            if (!this.isGlowing) return;
            
            const particle = document.createElement('div');
            particle.classList.add('wit-tree-aura-particle');
            
            // Position randomly around tree
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.left = `${150 + x}px`;
            particle.style.top = `${75 + y}px`;
            
            // Random size
            const size = 3 + Math.random() * 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random color tint
            const hue = 60 + Math.random() * 40; // Yellow to slight green
            particle.style.backgroundColor = `hsla(${hue}, 100%, 80%, ${0.4 + Math.random() * 0.4})`;
            
            // Add to aura container
            this.auraContainer.appendChild(particle);
            
            // Animate and remove
            const duration = 2000 + Math.random() * 2000;
            const startOpacity = 0.1 + Math.random() * 0.5;
            
            // Animate using keyframes for better performance
            particle.animate([
                { 
                    opacity: 0,
                    transform: 'translateY(0) scale(0.5)'
                },
                {
                    opacity: startOpacity,
                    transform: 'translateY(-10px) scale(1)'
                },
                {
                    opacity: 0,
                    transform: `translateY(-${50 + Math.random() * 30}px) scale(0.5)`
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            });
            
            // Remove particle when animation completes
            setTimeout(() => {
                if (particle && particle.parentNode === this.auraContainer) {
                    this.auraContainer.removeChild(particle);
                }
            }, duration);
            
            // Continue creating particles if still glowing
            if (this.isGlowing) {
                setTimeout(createParticle, 100 + Math.random() * 200);
            }
        };
        
        // Start creating particles
        for (let i = 0; i < 3; i++) {
            setTimeout(createParticle, i * 100);
        }
    }
    
    createWisdomParticle() {
        if (!this.isSpeaking) return;
        
        const wisdomSymbols = [
            '♦', '✤', '✺', '❀', '❁', '✿', 
            '♛', '❧', '❦', '✧', '✦', '✩',
            '✵', '✮', '✴', '✯', '✭'
        ];
        
        const symbol = wisdomSymbols[Math.floor(Math.random() * wisdomSymbols.length)];
        
        const particle = document.createElement('div');
        particle.classList.add('wit-tree-wisdom-particle');
        particle.textContent = symbol;
        
        // Position near the tree's "mouth"
        const offsetX = -15 + Math.random() * 30;
        particle.style.left = `${150 + offsetX}px`;
        particle.style.top = '100px';
        
        // Random color tint
        const hue = 80 + Math.random() * 40; // Green to yellow-green
        particle.style.color = `hsla(${hue}, 70%, 50%, 0.8)`;
        
        // Add to wisdom container
        this.wisdomParticlesContainer.appendChild(particle);
        
        // Animate and remove
        particle.animate([
            { 
                opacity: 0,
                transform: 'translateY(0) scale(0.5)'
            },
            {
                opacity: 0.9,
                transform: 'translateY(-30px) scale(1)'
            },
            {
                opacity: 0,
                transform: 'translateY(-80px) scale(0.8)'
            }
        ], {
            duration: 2000,
            easing: 'ease-out'
        });
        
        // Remove particle when animation completes
        setTimeout(() => {
            if (particle && particle.parentNode === this.wisdomParticlesContainer) {
                this.wisdomParticlesContainer.removeChild(particle);
            }
        }, 2000);
    }
    
    // Clean up all animations and events
    destroy() {
        this.stopSwaying();
        clearInterval(this.leafCreationInterval);
        clearInterval(this.wisdomParticlesInterval);
    }
}

function createFallingLeaf(treeElement) {
    const leaf = document.createElement('div');
    leaf.className = 'falling-leaf';
    
    const treeRect = treeElement.getBoundingClientRect();
    const startX = Math.random() * 80 + 20;
    
    leaf.style.position = 'absolute';
    leaf.style.left = `${startX}px`;
    leaf.style.top = '50px';
    leaf.style.width = '10px';
    leaf.style.height = '10px';
    leaf.style.backgroundColor = Math.random() > 0.5 ? '#8BC34A' : '#CDDC39';
    leaf.style.borderRadius = '50% 0 50% 50%';
    leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
    leaf.style.opacity = '0.8';
    leaf.style.zIndex = '49';
    
    treeElement.appendChild(leaf);
    
    let posY = 50;
    let posX = startX;
    let rotation = Math.random() * 360;
    let opacity = 0.8;
    
    function fall() {
        posY += 1;
        posX += Math.sin(posY / 10) * 0.5;
        rotation += 2;
        opacity -= 0.005;
        
        leaf.style.top = `${posY}px`;
        leaf.style.left = `${posX}px`;
        leaf.style.transform = `rotate(${rotation}deg)`;
        leaf.style.opacity = opacity;
        
        if (posY < 200 && opacity > 0) {
            requestAnimationFrame(fall);
        } else {
            leaf.remove();
        }
    }
    
    requestAnimationFrame(fall);
}