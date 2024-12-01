# 🎮 Wild Boar Hunt - Interactive Shooting Game v2.0.0

[Version française](README-FR.md)

An interactive web-based wild boar shooting game with a complete scoring system. The game offers an immersive experience with mobile targets (boars and rabbits) featuring distinct behaviors.

*Current version: 2.0.0 - Major gameplay and user interface improvements*

Experience an engaging hunting simulation where you must shoot wild boars while avoiding the playful rabbits. Test your accuracy and strategy in this challenging web-based game.

## 🎯 Features

- **Complete Scoring System**: Track your performance and beat high scores
- **Varied Targets**:
  - Wild boars with different sizes and speeds
  - Rabbits with jumping animations and sinusoidal movement when hit
- **Interactive Interface**:
  - Customizable crosshair with animations
  - Visual effects when shooting
  - Progressive level system
- **Advanced Audio System**:
  - Configurable gun sounds (bass, mid, treble)
  - Sound effects for rabbits
- **Configurable Settings**:
  - Sound volume (general, bass, mid, treble)
  - Game difficulty
  - Crosshair color
  - Ammunition count (20-50)

## 🚀 Installation

1. Download and extract ChasseAuSanglier.zip

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure PostgreSQL database:
```bash
# Create PostgreSQL database and configure environment variables
export DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]"
```

4. Run the application:
```bash
python app.py
```

## 🎮 How to Play

1. **Objective**: Shoot wild boars to score points while avoiding rabbits
2. **Points**:
   - Small boar: +15 points
   - Normal boar: +10 points
   - Large boar: +5 points
   - Rabbit: -20 points
3. **Progression**: Gain 20 ammunition with each level up
4. **Game Over**: The game ends when you run out of ammunition

## 🛠️ Technologies Used

- **Backend**: Python (Flask)
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Audio**: Web Audio API with Tone.js
- **Local Storage**: LocalStorage for user preferences

## 🎨 Assets

- SanglierjeuVert.png: Main boar image
- fraidzy3.png, fraidzy4.png: Rabbit images (80x80, 98x65)
- FraidzyPeur.wav: Rabbit sound effect

## 📝 License

This project is under MIT License - see the [LICENSE](LICENSE) file for details.

---
Developed with ❤️ for shooting game enthusiasts
