import os
import json
import pathlib

directory ="./"
locale_file = "./locales/en.default.json"

def search_html_files(directory, search_string):
    result = False
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if search_string in content:
                        # print(f"String '{search_string}' found in {file_path}")
                        result = True
    return result

def get_translation_keys(data, parent=None):
    translation_keys_list = []
    for key, value in data.items():
        level_1_key = key
        if type(value) is dict:
            for key, value in value.items():
                level_2_key = key
                if type(value) is dict:
                    for key, value in value.items():
                        translation_key = '{}.{}.{}'.format(level_1_key, level_2_key, key)
                        translation_keys_list.append(translation_key)
    return translation_keys_list


def search_translation_strings():
    not_found = []
    with open(locale_file) as f:
        data = json.load(f)
        translation_string_key = get_translation_keys(data)
        for each in translation_string_key:
            result = search_html_files(directory, each)
            if not result:
                not_found.append(each)

    return not_found


def remove_unused_translation_strings():
    unused_strings = search_translation_strings()
    with open(locale_file) as f:
        data = json.load(f)
        for each in unused_strings:
            translation_array = each.split('.')
            del(data[translation_array[0]][translation_array[1]][translation_array[2]])

    with open(locale_file, "w") as outfile:
        json.dump(data, outfile)

remove_unused_translation_strings()
