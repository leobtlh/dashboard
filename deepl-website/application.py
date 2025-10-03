from flask import Flask, request, jsonify, render_template, g, redirect, url_for, send_file, send_from_directory, session
from werkzeug.utils import safe_join, secure_filename
from flask_babel import Babel, gettext
from translate import translate_text, get_languages
from translate_document import translate_document
from improve_text import improve_text
from config import Config
import deepl
import os
import time
import credentials

app = Flask(__name__)
# app.config['SECRET_KEY'] = os.urandom(24)
app.config['SECRET_KEY'] = credentials.SECRET_KEY
UPLOAD_FOLDER = '/tmp/translated_files'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'pptx', 'txt'}


def get_locale():
    # Vérifier si on a forcé une langue dans l’URL
    language = request.args.get('lang')
    if language:
        session['lang'] = language
        return language

    # Si déjà définie en session, la reprendre
    if 'lang' in session:
        return session['lang']

    # Sinon fallback sur la langue du navigateur
    return request.accept_languages.best_match(app.config['LANGUAGES'])


# Détection de langue du navigateur
def parse_accept_header(accept_header):
    accepts = []
    for line in accept_header.replace(' ','').split(','):
        values = line.split(';q=')
        if len(values) > 1:
            try:
                prio = float(values[1])
            except (ValueError, TypeError):
                prio = 0.0
        else:
            prio = 1.0
        accepts.append((values[0], prio))

    accepts.sort(key=lambda l_s: l_s[1], reverse=True)
    accept_headers = [l[0] for l in accepts]

    return accept_headers


app.config['BABEL_TRANSLATION_DIRECTORIES'] = 'translations'

babel = Babel(app, locale_selector=get_locale)
app.config.from_object(Config)

@app.route('/')
def index():
    # Récupérer l'en-tête Accept-Language de la requête
    accept_header = request.headers.get('Accept-Language', '')
    if accept_header:
        # Analyser l'en-tête pour obtenir les langues préférées
        languages = parse_accept_header(accept_header)

    return render_template('index.html', _=gettext)


@app.route('/menu.html')
def menu():
    # Récupérer l'en-tête Accept-Language de la requête
    accept_header = request.headers.get('Accept-Language', '')
    if accept_header:
        # Analyser l'en-tête pour obtenir les langues préférées
        languages = parse_accept_header(accept_header)

    return render_template('menu.html', _=gettext)

@app.route('/documents/')
def documents_index():
    # Récupérer l'en-tête Accept-Language de la requête
    accept_header = request.headers.get('Accept-Language', '')
    if accept_header:
        # Analyser l'en-tête pour obtenir les langues préférées
        languages = parse_accept_header(accept_header)

    return render_template('documents/index.html', _=gettext)

@app.route('/amelioration/')
def amelioration_index():
    # Récupérer l'en-tête Accept-Language de la requête
    accept_header = request.headers.get('Accept-Language', '')
    if accept_header:
        # Analyser l'en-tête pour obtenir les langues préférées
        languages = parse_accept_header(accept_header)

    return render_template('amelioration/index.html', _=gettext)

# liste via api
@app.route('/available-languages')
def available_languages():
    try:
        langs = get_languages()
        return jsonify(langs)
    except Exception as e:
        print(f"Erreur lors de la récupération des langues: {str(e)}")
        # Fournir une réponse de secours en cas d'erreur
        return jsonify ({
            'source_languages': [
                {'code': 'auto', 'name': 'Détection automatique'},
                {'code': 'FR', 'name': 'Français'},
                {'code': 'EN', 'name': 'Anglais'},
                {'code': 'DE', 'name': 'Allemand'},
                {'code': 'ES', 'name': 'Espagnol'},
                {'code': 'IT', 'name': 'Italien'}
            ],
            'target_languages': [
                {'code': 'FR', 'name': 'Français'},
                {'code': 'EN-US', 'name': 'Anglais (US)'},
                {'code': 'EN-GB', 'name': 'Anglais (GB)'},
                {'code': 'DE', 'name': 'Allemand'},
                {'code': 'ES', 'name': 'Espagnol'},
                {'code': 'IT', 'name': 'Italien'}
            ]
        })

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get('text', '')

    # Vérifier les en-têtes de langue du navigateur
    accept_header = request.headers.get('Accept-Language', '')

    languages = parse_accept_header(accept_header)
    browser_lang = languages[0].upper() if languages else 'FR'

    # Source et cible explicitement fournies dans la requête?
    source_lang = data.get('source_lang', 'auto')
    target_lang_provided = 'target_lang' in data and data['target_lang']

    if target_lang_provided:
        target_lang = data['target_lang']
    else:
        target_lang = browser_lang

    if not text.strip():
        return jsonify({'translated_text': ''})

    # Appel à la fonction de traduction
    translated_text = translate_text(text, source_lang, target_lang)

    return jsonify({'translated_text': translated_text})


@app.route('/download/<filename>')
def download_file(filename):
    directory = os.path.join(app.root_path, 'downloads')
    return send_from_directory(directory, filename, as_attachment=True)


@app.route('/translate-document', methods=['POST'])
def translate_document_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        ext = filename.rsplit('.', 1)[1].lower()
        output_filename = filename.rsplit('.', 1)[0] + f'_translated.{ext}'
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], output_filename)

        try:
            source_lang = request.form.get('source_lang', 'auto')
            target_lang = request.form.get('target_lang', 'FR')

            if source_lang == target_lang:
                return jsonify({'error': 'La langue source et la langue cible ne peuvent pas être identiques.'}), 400

            translate_document(file_path, output_path, source_lang, target_lang)

            # Fournir le chemin relatif au client
            return jsonify({
                'translated_file_path': f'/download-temp/{output_filename}'
            }), 200
        except deepl.DocumentTranslationException as e:
            if "Source and target language are equal" in str(e):
                return jsonify({'error': 'La langue source et la langue cible ne peuvent pas être identiques.'}), 400
            return jsonify({'error': 'Erreur de traduction du document.'}), 500
        except Exception as e:
            print(f"[ERROR] Exception pendant la traduction : {str(e)}")
            return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'File type not allowed'}), 400


@app.route('/download-temp/<filename>')
def download_temp(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)


@app.route('/improve-text', methods=['POST'])
def improve_text_route():
    data = request.json
    text = data.get('text', '')

    # Vérifier les en-têtes de langue du navigateur
    accept_header = request.headers.get('Accept-Language', '')

    languages = parse_accept_header(accept_header)
    browser_lang = languages[0].upper() if languages else 'FR'

    target_lang_provided = 'target_lang' in data and data['target_lang']
    style = data.get('style', 'default')

    if target_lang_provided:
        target_lang = data['target_lang']
    else:
        target_lang = browser_lang


    if not text.strip():
        return jsonify({'error': 'Le texte à améliorer ne peut pas être vide.'}), 400

    try:
        improved_text = improve_text(text, target_lang, style)
        return jsonify({'improved_text': improved_text})
    except ValueError as e:
        return jsonify({'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


@app.route('/set_locale/<lang_code>')
def set_locale(lang_code):
    return redirect(url_for('index', lang=lang_code))

if __name__ == '__main__':
    app.run(debug=True)

