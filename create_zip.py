import os
import zipfile
import glob

def should_exclude(path):
    exclude_patterns = [
        '__pycache__',
        '.env',
        '.git',
        '.replit',
        'replit.nix',
        '.breakpoints',
        '*.pyc',
        'poetry.lock'
    ]
    
    for pattern in exclude_patterns:
        if pattern in path:
            return True
        if pattern.endswith('*'):
            base_pattern = pattern[:-1]
            if path.startswith(base_pattern):
                return True
    return False

def create_project_zip(output_filename='ChasseAuSanglier.zip'):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Ajouter les fichiers Python
        for py_file in glob.glob('*.py'):
            if not should_exclude(py_file):
                zipf.write(py_file)
        
        # Ajouter les fichiers statiques
        for root, _, files in os.walk('static'):
            for file in files:
                file_path = os.path.join(root, file)
                if not should_exclude(file_path):
                    zipf.write(file_path)
        
        # Ajouter les templates
        for root, _, files in os.walk('templates'):
            for file in files:
                file_path = os.path.join(root, file)
                if not should_exclude(file_path):
                    zipf.write(file_path)
        
        # Ajouter les fichiers essentiels
        essential_files = ['README.md', 'requirements.txt', 'LICENSE']
        for file in essential_files:
            if os.path.exists(file):
                zipf.write(file)

if __name__ == '__main__':
    create_project_zip()
    print("Archive ZIP créée avec succès !")
