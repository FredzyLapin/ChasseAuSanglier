from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Disable cache during development
db = SQLAlchemy(app)

# Configuration du logging
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HighScore(db.Model):
    __tablename__ = 'high_scores'
    id = db.Column(db.Integer, primary_key=True)
    player_name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    level = db.Column(db.Integer, nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

@app.route('/')
def index():
    logger.info('Accès à la page d\'accueil')
    scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
    logger.info(f'Nombre de scores chargés: {len(scores)}')
    return render_template('index.html', high_scores=scores)

@app.route('/api/scores', methods=['POST'])
def save_score():
    data = request.get_json()
    new_score = HighScore(
        player_name=data['player_name'],
        score=data['score'],
        level=data['level']
    )
    db.session.add(new_score)
    db.session.commit()
    return jsonify({'success': True})

@app.route('/api/scores', methods=['GET'])
def get_scores():
    scores = HighScore.query.order_by(HighScore.score.desc()).limit(10).all()
    return jsonify([{
        'player_name': score.player_name,
        'score': score.score,
        'level': score.level,
        'date': score.date_created.strftime('%Y-%m-%d')
    } for score in scores])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=3001, debug=False)
