import deepl
import credentials

def translate_text(text, source_lang="auto", target_lang="FR"):
    auth_key = credentials.API_KEY_DEEPL
    translator = deepl.DeepLClient(auth_key)

    # Vérifier si la langue cible est valide
    available_languages = translator.get_target_languages()
    available_codes = [lang.code for lang in available_languages]

    if target_lang not in available_codes:
        target_lang = "FR"

    try:
        if source_lang == "auto":
            result = translator.translate_text(text, target_lang=target_lang)
        else:
            result = translator.translate_text(text, source_lang=source_lang, target_lang=target_lang)

        return result.text
    except Exception as e:
        # En cas d'erreur, renvoyer le texte original
        return text

def get_languages():
    auth_key = credentials.API_KEY_DEEPL
    translator = deepl.DeepLClient(auth_key)

    # Récupérer et formater les langues sources et cibles
    source_languages = translator.get_source_languages()
    target_languages = translator.get_target_languages()

    # Formater les résultats en incluant le code et le nom
    source_langs = [{'code': lang.code, 'name': lang.name} for lang in source_languages]
    target_langs = [{'code': lang.code, 'name': lang.name} for lang in target_languages]

    return {
        'source_languages': source_langs,
        'target_languages': target_langs
    }

if __name__ == "__main__":
    text_to_translate = "Hello, world!"
    translated_text = translate_text(text_to_translate)
    print(translated_text)  # "Bonjour, le monde !"
