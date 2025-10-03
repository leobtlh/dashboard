import deepl
import credentials

def improve_text(text, target_lang="FR", style="default"):
    auth_key = credentials.API_KEY_DEEPL
    translator = deepl.DeepLClient(auth_key)

    # Vérifier si la langue cible est valide
    available_languages = translator.get_target_languages()
    available_codes = [lang.code for lang in available_languages]

    if target_lang not in available_codes:
        target_lang = "FR"

    try:
        result = translator.rephrase_text(text, target_lang=target_lang, style=style)
        return result.text
    except Exception as e:
        print(f"Erreur lors de l'amélioration': {str(e)}")
        return text
