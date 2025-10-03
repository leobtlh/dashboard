import deepl
import credentials

def translate_document(input_path, output_path, source_lang="auto", target_lang="FR"):
    auth_key = credentials.API_KEY_DEEPL
    translator = deepl.DeepLClient(auth_key)

    # Vérifier si la langue cible est valide
    available_languages = translator.get_target_languages()
    available_codes = [lang.code for lang in available_languages]

    if target_lang not in available_codes:
        target_lang = "FR"


    try:
        if source_lang == "auto":
            translator.translate_document_from_filepath(input_path, output_path, target_lang=target_lang)
        else:
            translator.translate_document_from_filepath(input_path, output_path, source_lang=source_lang, target_lang=target_lang)
        print("Traduction du document réussie.")
    except deepl.DocumentTranslationException as error:
        print(f"Erreur après téléchargement : {error}")
        raise error  # pour que application.py capture l'erreur
    except deepl.DeepLException as error:
        print(f"Erreur DeepL : {error}")
        raise error
