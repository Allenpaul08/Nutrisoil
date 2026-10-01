import sys
import os
from flask import Flask
from flask_cors import CORS

# Ensure project root directory is in Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.ml_api import ml_blueprint

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(ml_blueprint, url_prefix='/api')
    return app

app = create_app()

if __name__ == '__main__':
    print("==================================================")
    print(" NUTRISOIL FLASK ML API GATEWAY RUNNING ON 5000")
    print("==================================================")
    print("  * GET  http://localhost:5000/api/health")
    print("  * POST http://localhost:5000/api/ml/crop")
    print("  * POST http://localhost:5000/api/ml/fertilizer")
    print("  * POST http://localhost:5000/api/ml/analyze")
    print("==================================================")
    app.run(host='0.0.0.0', port=5000, debug=False)
