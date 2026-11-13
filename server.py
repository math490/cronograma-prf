"""Servidor LOCAL de desenvolvimento; não é necessário no GitHub Pages.
O SQLite do aplicativo roda no navegador via sql.js, também no GitHub Pages.
"""
from pathlib import Path
from flask import Flask, send_from_directory

ROOT = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)

@app.route('/')
def index():
    return send_from_directory(ROOT, 'index.html')

@app.route('/<path:filename>')
def static_file(filename):
    return send_from_directory(ROOT, filename)

if __name__ == '__main__':
    print('PRF Study: http://127.0.0.1:8000')
    app.run(host='127.0.0.1', port=8000, debug=False)
