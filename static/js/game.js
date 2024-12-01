class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        this.score = 0;
        this.ammo = 25;
        this.level = 1;
        this.paused = false;
        this.boars = [];
        this.rabbits = [];
        this.baseBoarSpeed = 2;
        this.baseBoarSpawnRate = 0.02;
        this.rabbitSpeed = 3;
        this.rabbitSpawnRate = 0.01;
        this.gameLoop = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Initialiser l'audio
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isPlayingSound = false;
        this.lastSoundTime = 0;
        
        // Charger les images des sangliers
        this.boarImages = [
            { src: '/static/assets/SanglierjeuVert.png', width: 135, height: 81, type: 'normal' },
            { src: '/static/assets/SanglierjeuVert.png', width: 180, height: 108, type: 'large' },
            { src: '/static/assets/SanglierjeuVert.png', width: 90, height: 54, type: 'small' }
        ];
        
        // Charger les images des lapins
        this.rabbitImages = [
            '/static/assets/fraidzy3vert.png',
            '/static/assets/fraidzy4vert.png',
            '/static/assets/fraidzy6vert.png'
        ];
        
        // Charger le son du lapin
        fetch('/static/assets/SONOREFREDZY.wav')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.rabbitSound = audioBuffer;
            })
            .catch(error => console.error('Erreur lors du chargement du son:', error));
        
        // Initialiser les paramètres
        this.initSettings();
        
        // Gestionnaires d'événements
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', (e) => {
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
    }
    
    update() {
        if (!this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.updateBoars();
        this.updateRabbits();
        this.drawBoars();
        this.drawRabbits();
        this.drawCrosshair();
        this.checkRabbitHover();
        
        if (!this.paused) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }

    drawCrosshair() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX - rect.left;
        const mouseY = this.lastMouseY - rect.top;
        
        // Animation du viseur (pulsation)
        const time = Date.now() * 0.001; // Conversion en secondes
        const scale = 1 + Math.sin(time * 2) * 0.1; // Pulsation entre 0.9 et 1.1
        
        // Effet de traînée
        this.ctx.save();
        this.ctx.globalAlpha = 0.3;
        for (let i = 1; i <= 3; i++) {
            const trailScale = scale * (1 - i * 0.1);
            this.drawCrosshairElement(mouseX, mouseY, trailScale, this.settings.crosshairColor || 'red');
        }
        this.ctx.restore();
        
        // Viseur principal
        this.drawCrosshairElement(mouseX, mouseY, scale, this.settings.crosshairColor || 'red', true);
        
        // Point central avec animation inverse
        this.ctx.beginPath();
        this.ctx.fillStyle = this.settings.crosshairColor || 'red';
        this.ctx.arc(mouseX, mouseY, 2 / scale, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCrosshairElement(x, y, scale, color, withOutline = false) {
        const lineLength = 25 * scale;
        
        if (withOutline) {
            // Contour noir
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 4;
            
            this.ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
            this.ctx.moveTo(x - lineLength, y);
            this.ctx.lineTo(x + lineLength, y);
            this.ctx.moveTo(x, y - lineLength);
            this.ctx.lineTo(x, y + lineLength);
            
            this.ctx.stroke();
        }
        
        // Viseur coloré
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        this.ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
        this.ctx.moveTo(x - lineLength, y);
        this.ctx.lineTo(x + lineLength, y);
        this.ctx.moveTo(x, y - lineLength);
        this.ctx.lineTo(x, y + lineLength);
        
        this.ctx.stroke();
    }

    async playRabbitSound() {
        if (!this.rabbitSound || this.isPlayingSound) return;
        
        this.isPlayingSound = true;
        const source = this.audioContext.createBufferSource();
        source.buffer = this.rabbitSound;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = (this.settings.soundVolume / 100) * 4; // Multiplier par 4 au lieu de 2 pour doubler le volume
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
        
        // Attendre 5 secondes avant de permettre une nouvelle lecture
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.isPlayingSound = false;
    }

    checkRabbitHover() {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = this.lastMouseX - rect.left;
        const mouseY = this.lastMouseY - rect.top;
        
        // Vérifier le temps écoulé depuis la dernière lecture
        const currentTime = Date.now();
        if (this.lastSoundTime && currentTime - this.lastSoundTime < 15000) {
            return;
        }
        
        for (const rabbit of this.rabbits) {
            const isHovered = mouseX >= rabbit.x && 
                            mouseX <= rabbit.x + rabbit.width &&
                            mouseY >= rabbit.y && 
                            mouseY <= rabbit.y + rabbit.height;
            
            if (isHovered && !this.isPlayingSound) {
                this.lastSoundTime = currentTime;
                this.playRabbitSound();
                break;
            }
        }
    }

    spawnRabbit() {
        const randomImgSrc = this.rabbitImages[Math.floor(Math.random() * this.rabbitImages.length)];
        const img = new Image();
        img.src = randomImgSrc;
        
        // Attendre que l'image soit chargée
        img.onload = () => {
            const dimensions = randomImgSrc.includes('fraidzy4vert.png')
                ? { width: 98, height: 65 }
                : randomImgSrc.includes('fraidzy6vert.png')
                    ? { width: 80, height: 80 }
                    : { width: 80, height: 80 };
            
            const rabbit = {
                x: this.canvas.width,
                y: Math.random() * (this.canvas.height - dimensions.height),
                width: dimensions.width,
                height: dimensions.height,
                speed: -this.rabbitSpeed,
                points: -20,
                image: img,
                lastSoundTime: 0,
                baseY: 0,
                isHit: false
            };
            
            rabbit.baseY = rabbit.y;
            this.rabbits.push(rabbit);
        };
    }

    updateRabbits() {
        if (Math.random() < this.rabbitSpawnRate) {
            this.spawnRabbit();
        }

        this.rabbits.forEach((rabbit, index) => {
            // Mouvement horizontal
            rabbit.x += rabbit.speed;
            
            // Mouvement sinusoïdal vertical
            if (rabbit.isHit) {
                // Si touché, grands bonds sinusoïdaux
                rabbit.y = rabbit.baseY + Math.sin(rabbit.x * 0.05) * 150;
            } else {
                // Sinon, petit mouvement sinusoïdal normal
                rabbit.y = rabbit.baseY + Math.sin(rabbit.x * 0.02) * 20;
            }

            // Suppression si hors écran
            if ((rabbit.speed > 0 && rabbit.x > this.canvas.width) || 
                (rabbit.speed < 0 && rabbit.x + rabbit.width < 0)) {
                this.rabbits.splice(index, 1);
            }
        });
    }

    drawRabbits() {
        this.rabbits.forEach(rabbit => {
            // Définir les dimensions en fonction de l'image
            const dimensions = rabbit.image.src.includes('fraidzy4vert.png')
                ? { width: 98, height: 65 }
                : { width: 80, height: 80 };
            
            this.ctx.drawImage(
                rabbit.image,
                rabbit.x,
                rabbit.y,
                dimensions.width,
                dimensions.height
            );
        });
    }

    spawnBoar() {
        const randomConfig = this.boarImages[Math.floor(Math.random() * this.boarImages.length)];
        const img = new Image();
        img.src = randomConfig.src;
        
        const boar = {
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - randomConfig.height),
            width: randomConfig.width,
            height: randomConfig.height,
            speed: this.baseBoarSpeed * (1 + (this.level - 1) * 0.2),
            points: randomConfig.type === 'small' ? 15 : randomConfig.type === 'large' ? 5 : 10,
            image: img,
            type: randomConfig.type
        };
        
        this.boars.push(boar);
    }

    updateBoars() {
        if (Math.random() < this.baseBoarSpawnRate) {
            this.spawnBoar();
        }

        this.boars.forEach((boar, index) => {
            boar.x -= boar.speed;
            if (boar.x + boar.width < 0) {
                this.boars.splice(index, 1);
            }
        });
    }

    drawBoars() {
        this.boars.forEach(boar => {
            this.ctx.save();
            
            // Déplacer le point d'origine au centre de l'image
            this.ctx.translate(boar.x + boar.width / 2, boar.y + boar.height / 2);
            
            // Effet miroir horizontal
            this.ctx.scale(-1, 1);
            
            // Dessiner l'image
            this.ctx.drawImage(
                boar.image, 
                -boar.width / 2,
                -boar.height / 2,
                boar.width, 
                boar.height
            );
            
            this.ctx.restore();
        });
    }

    handleClick(event) {
        if (this.paused || this.ammo <= 0) {
            return;
        }

        this.ammo--;
        document.getElementById('ammo').textContent = this.ammo;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Jouer le son du tir
        this.playShootSound();

        // Vérifier les collisions avec les sangliers
        this.boars.forEach((boar, index) => {
            if (x >= boar.x && x <= boar.x + boar.width &&
                y >= boar.y && y <= boar.y + boar.height) {
                this.score += boar.points;
                document.getElementById('score').textContent = this.score;
                this.boars.splice(index, 1);
                
                // Vérifier si on passe au niveau suivant
                if (this.score >= this.level * 100) {
                    this.levelUp();
                }
            }
        });

        // Vérifier les collisions avec les lapins
        this.rabbits.forEach((rabbit, index) => {
            if (x >= rabbit.x && x <= rabbit.x + rabbit.width &&
                y >= rabbit.y && y <= rabbit.y + rabbit.height) {
                this.score += rabbit.points;
                document.getElementById('score').textContent = this.score;
                
                // Pour les lapins touchés
                rabbit.speed = -rabbit.speed * 1.5;
                rabbit.isHit = true;

                // Reset du comportement après 3 secondes
                setTimeout(() => {
                    if (this.rabbits.includes(rabbit)) {
                        rabbit.speed = Math.abs(rabbit.speed) / 1.5;
                        rabbit.isHit = false;
                    }
                }, 3000);
            }
        });

        // Si plus de munitions, fin de partie
        if (this.ammo <= 0) {
            this.endGame();
        }
    }

    levelUp() {
        this.level++;
        document.getElementById('level').textContent = this.level;
        this.baseBoarSpeed += 0.5;
        this.baseBoarSpawnRate += 0.005;
        
        // Ajouter 20 munitions
        this.ammo += 20;
        document.getElementById('ammo').textContent = this.ammo;
    }

    async endGame() {
        this.paused = true;
        const modal = new bootstrap.Modal(document.getElementById('saveScoreModal'));
        modal.show();
        
        document.getElementById('saveScoreButton').onclick = async () => {
            await this.saveScore(document.getElementById('playerName').value);
            modal.hide();
            this.restart();
        };
    }

    async saveScore(playerName) {
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    player_name: playerName,
                    score: this.score,
                    level: this.level
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde du score');
            }
            
            await this.updateHighScores();
        } catch (error) {
            console.error('Erreur:', error);
        }
    }

    async updateHighScores() {
        try {
            const response = await fetch('/api/scores');
            const scores = await response.json();
            
            const tbody = document.getElementById('highScoresTable');
            tbody.innerHTML = scores.map((score, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${score.player_name}</td>
                    <td>${score.score}</td>
                    <td>${score.level}</td>
                    <td>${score.date}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Erreur lors de la mise à jour des scores:', error);
        }
    }

    playShootSound() {
        // Créer les noeuds d'effets
        const masterGain = this.audioContext.createGain();
        const reverbGain = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        
        // Configurer le volume principal et la réverbération
        masterGain.gain.value = this.settings.gunSoundVolume / 100;
        reverbGain.gain.value = 0.3 * (this.settings.gunSoundVolume / 100);
        
        // Ajouter un effet de spatialisation aléatoire
        panner.pan.value = (Math.random() * 0.4) - 0.2;  // Valeur entre -0.2 et 0.2

        // Son du tir principal (très grave)
        const oscillator1 = this.audioContext.createOscillator();
        const gainNode1 = this.audioContext.createGain();
        oscillator1.type = 'sawtooth';
        oscillator1.frequency.setValueAtTime(80, this.audioContext.currentTime);
        gainNode1.gain.setValueAtTime(2.5 * (this.settings.gunBassSoundVolume / 100), this.audioContext.currentTime);
        gainNode1.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        // Son du tir secondaire (médium)
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        oscillator2.type = 'square';
        oscillator2.frequency.setValueAtTime(150, this.audioContext.currentTime);
        gainNode2.gain.setValueAtTime(1.5 * (this.settings.gunMidSoundVolume / 100), this.audioContext.currentTime);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

        // Son du tir tertiaire (aigu)
        const oscillator3 = this.audioContext.createOscillator();
        const gainNode3 = this.audioContext.createGain();
        oscillator3.type = 'triangle';
        oscillator3.frequency.setValueAtTime(300, this.audioContext.currentTime);
        gainNode3.gain.setValueAtTime(0.8 * (this.settings.gunHighSoundVolume / 100), this.audioContext.currentTime);
        gainNode3.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        // Connecter les oscillateurs au gain principal
        oscillator1.connect(gainNode1);
        oscillator2.connect(gainNode2);
        oscillator3.connect(gainNode3);
        
        // Connecter les gains des oscillateurs au master gain
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        gainNode3.connect(masterGain);
        
        // Connecter le master gain à la réverbération et au panner
        masterGain.connect(reverbGain);
        masterGain.connect(panner);
        
        // Connecter la réverbération et le panner à la destination
        reverbGain.connect(this.audioContext.destination);
        panner.connect(this.audioContext.destination);
        
        // Démarrer les oscillateurs
        oscillator1.start();
        oscillator2.start();
        oscillator3.start();
        
        // Arrêter les oscillateurs avec des délais différents
        oscillator1.stop(this.audioContext.currentTime + 0.2);
        oscillator2.stop(this.audioContext.currentTime + 0.15);
        oscillator3.stop(this.audioContext.currentTime + 0.1);

        // Effet de flash du viseur
        const color = this.settings.crosshairColor || 'red';
        const originalLineWidth = this.ctx.lineWidth;
        const originalGlobalAlpha = this.ctx.globalAlpha;

        // Flash blanc
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 4;
        this.ctx.globalAlpha = 0.8;
        this.drawCrosshairElement(this.lastMouseX - this.canvas.getBoundingClientRect().left, 
                                this.lastMouseY - this.canvas.getBoundingClientRect().top, 
                                1.5, 'white');

        // Retour à l'état normal après 100ms
        setTimeout(() => {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = originalLineWidth;
            this.ctx.globalAlpha = originalGlobalAlpha;
        }, 100);
    }

    restart() {
        this.score = 0;
        this.ammo = 25;
        this.level = 1;
        this.boars = [];
        this.rabbits = [];
        this.paused = false;
        this.baseBoarSpeed = 2;
        this.baseBoarSpawnRate = 0.02;
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('ammo').textContent = this.ammo;
        document.getElementById('level').textContent = this.level;
        
        const pauseButton = document.querySelector('button[onclick="game.togglePause()"]');
        pauseButton.classList.remove('btn-danger');
        pauseButton.classList.add('btn-warning');
        pauseButton.textContent = 'Pause';
        
        document.querySelector('.high-scores-overlay').style.display = 'none';
        
        if (!this.gameLoop) {
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }

    togglePause() {
        this.paused = !this.paused;
        const pauseButton = document.querySelector('button[onclick="game.togglePause()"]');
        const highScoresDiv = document.querySelector('.high-scores-overlay');
        
        if (this.paused) {
            // Arrêter l'animation
            if (this.gameLoop) {
                cancelAnimationFrame(this.gameLoop);
                this.gameLoop = null;
            }
            pauseButton.classList.remove('btn-warning');
            pauseButton.classList.add('btn-danger');
            pauseButton.textContent = 'En Pause';
            highScoresDiv.style.display = 'block';
            this.updateHighScores();
        } else {
            highScoresDiv.style.display = 'none';
            pauseButton.classList.remove('btn-danger');
            pauseButton.classList.add('btn-warning');
            pauseButton.textContent = 'Pause';
            
            // Redémarrer l'animation
            this.gameLoop = requestAnimationFrame(() => this.update());
        }
    }

    initSettings() {
        // Configuration par défaut
        this.settings = {
            soundVolume: 75,
            gunSoundVolume: 50,
            gunBassSoundVolume: 75,
            gunMidSoundVolume: 50,
            gunHighSoundVolume: 25,
            difficulty: 'normal',
            crosshairColor: 'red',
            ammoCount: 25
        };
        
        // Charger les paramètres sauvegardés
        const savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            this.settings = {...this.settings, ...JSON.parse(savedSettings)};
        }
        
        // Appliquer les paramètres initiaux
        this.applySettings();
    }

    saveSettings() {
        const soundVolume = document.getElementById('soundVolume').value;
        const gunSoundVolume = document.getElementById('gunSoundVolume').value;
        const gunBassSoundVolume = document.getElementById('gunBassSoundVolume').value;
        const gunMidSoundVolume = document.getElementById('gunMidSoundVolume').value;
        const gunHighSoundVolume = document.getElementById('gunHighSoundVolume').value;
        const difficulty = document.getElementById('gameDifficulty').value;
        const crosshairColor = document.getElementById('crosshairColor').value;
        const ammoCount = document.getElementById('ammoCount').value;
        
        this.settings = {
            soundVolume: parseInt(soundVolume),
            gunSoundVolume: parseInt(gunSoundVolume),
            gunBassSoundVolume: parseInt(gunBassSoundVolume),
            gunMidSoundVolume: parseInt(gunMidSoundVolume),
            gunHighSoundVolume: parseInt(gunHighSoundVolume),
            difficulty,
            crosshairColor,
            ammoCount: parseInt(ammoCount)
        };
        
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
        this.applySettings();
        
        // Fermer la modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
    }

    openSettings() {
        document.getElementById('soundVolume').value = this.settings.soundVolume;
        document.getElementById('gunSoundVolume').value = this.settings.gunSoundVolume;
        document.getElementById('gunBassSoundVolume').value = this.settings.gunBassSoundVolume;
        document.getElementById('gunMidSoundVolume').value = this.settings.gunMidSoundVolume;
        document.getElementById('gunHighSoundVolume').value = this.settings.gunHighSoundVolume;
        document.getElementById('gameDifficulty').value = this.settings.difficulty;
        document.getElementById('crosshairColor').value = this.settings.crosshairColor;
        document.getElementById('ammoCount').value = this.settings.ammoCount;
        document.getElementById('ammoValue').textContent = this.settings.ammoCount;
        
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    applySettings() {
        document.documentElement.style.setProperty('--crosshair-color', this.settings.crosshairColor);
        
        // Ajuster la difficulté
        switch(this.settings.difficulty) {
            case 'easy':
                this.baseBoarSpeed = 1.5;
                this.baseBoarSpawnRate = 0.015;
                break;
            case 'normal':
                this.baseBoarSpeed = 2;
                this.baseBoarSpawnRate = 0.02;
                break;
            case 'hard':
                this.baseBoarSpeed = 2.5;
                this.baseBoarSpawnRate = 0.025;
                break;
        }
        
        // Mettre à jour les munitions si changé
        if (this.ammo !== this.settings.ammoCount) {
            this.ammo = this.settings.ammoCount;
            document.getElementById('ammo').textContent = this.ammo;
        }
    }
}

// Initialiser le jeu
const game = new Game();
game.update();

// Mettre à jour l'affichage du nombre de munitions lors du changement
document.getElementById('ammoCount').addEventListener('input', function(e) {
    document.getElementById('ammoValue').textContent = e.target.value;
});