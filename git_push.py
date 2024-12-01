import os
import subprocess
from pathlib import Path

def run_git_command(command):
    try:
        # Vérifier si le token est disponible
        token = os.environ.get('GITHUB_TOKEN')
        if not token:
            raise ValueError("Token GitHub non trouvé dans les variables d'environnement")
        
        # Nettoyer le token si nécessaire
        token = token.strip()
        
        # Configuration de l'environnement Git
        git_env = {
            **os.environ,
            'GIT_TERMINAL_PROMPT': '0',
            'GIT_ASKPASS': 'echo',
        }
        
        # Remplacer l'URL HTTPS par une URL avec token pour les commandes qui nécessitent une authentification
        if command.startswith('git remote add origin'):
            repo_url = command.split('"')[1]
            if repo_url.startswith('https://'):
                command = f'git remote add origin "https://x-access-token:{token}@github.com/FredzyLapin/ChasseAuSanglier.git"'
        elif command.startswith('git push'):
            command = command.replace('origin', f'https://x-access-token:{token}@github.com/FredzyLapin/ChasseAuSanglier.git')
        
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True,
            env=git_env
        )
        print(f"Command executed successfully: {command}")
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {command}")
        print(f"Error output: {e.stderr}")
        return False, e.stderr

def setup_git():
    commands = [
        'git config --global user.name "FredzyLapin"',
        'git config --global user.email "noreply@github.com"',
        'rm -rf .git',
        'git init',
        'git add .',
        '''git commit -m "Version 2.0.0 : ChasseAuSanglier - Jeu de tir au sanglier avec interface web interactive

Features:
- Interface web interactive avec système de score
- Cibles mobiles (sangliers et lapins)
- Système audio avancé avec effets sonores
- Paramètres configurables (volume, difficulté, viseur)
- Système de progression avec munitions bonus
- Haute qualité graphique et sonore
- Installation facile et documentation complète"''',
        'git remote add origin "https://github.com/FredzyLapin/ChasseAuSanglier.git"',
        'git branch -M main',
        'git push -u origin main --force'
    ]

    for cmd in commands:
        success, output = run_git_command(cmd)
        if not success:
            print(f"Erreur lors de l'exécution de la commande Git : {output}")
            return False
    return True

if __name__ == "__main__":
    if setup_git():
        print("Projet poussé avec succès vers GitHub!")
    else:
        print("Erreur lors de la mise en place du dépôt Git")
