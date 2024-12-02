# 🎮 Chasse au Sanglier - Jeu de Tir Interactif v2.0.0

Un jeu de tir au sanglier avec interface web interactive intégrant un système de score complet. Le jeu propose une expérience immersive avec des cibles mobiles (sangliers et lapins) aux comportements distincts.

*Version actuelle : 2.0.0 - Améliorations majeures du gameplay et de l'interface utilisateur*

## 🎯 Fonctionnalités

- **Système de Score Complet**: Suivez vos performances et battez vos records
- **Cibles Variées**:
  - Sangliers avec différentes tailles et vitesses
  - Lapins avec animation de saut et mouvement sinusoïdal quand touchés
- **Interface Interactive**:
  - Viseur personnalisable avec animations
  - Effets visuels lors des tirs
  - Système de niveaux progressifs
- **Système Audio Avancé**:
  - Sons du fusil configurables (basses, mediums, aigus)
  - Effets sonores pour les lapins
- **Paramètres Configurables**:
  - Volume sonore (général, basses, mediums, aigus)
  - Niveau de difficulté
  - Couleur du viseur
  - Nombre de munitions (20-50)

## 🚀 Installation

1. Télécharger et extraire ChasseAuSanglier.zip

2. Installer les dépendances :
```bash
pip install .
```

3. Configurer la base de données PostgreSQL :
```bash
# Créer une base de données PostgreSQL et configurer les variables d'environnement
export DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DB_NAME]"
```

4. Lancer l'application :
```bash
python app.py
```

## 🎮 Comment Jouer

1. **Objectif**: Tirez sur les sangliers pour marquer des points tout en évitant les lapins
2. **Points**:
   - Petit sanglier: +15 points
   - Sanglier normal: +10 points
   - Grand sanglier: +5 points
   - Lapin: -20 points
3. **Progression**: Gagnez 20 munitions à chaque passage de niveau
4. **Fin de partie**: La partie se termine quand vous n'avez plus de munitions

## 🛠️ Technologies Utilisées

- **Backend**: Python (Flask)
- **Base de données**: PostgreSQL
- **Frontend**: HTML5, CSS3, JavaScript
- **Audio**: Web Audio API avec Tone.js
- **Stockage Local**: LocalStorage pour les préférences utilisateur

## 🎨 Assets

- SanglierjeuVert.png : Image principale des sangliers
- fraidzy3vert.png, fraidzy4vert.png, fraidzy6vert.png : Images des lapins
- SONOREFREDZY.wav : Son des lapins

## 📝 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
Développé avec ❤️ pour les amateurs de jeux de tir
