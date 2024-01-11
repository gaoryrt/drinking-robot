from BingImageCreator import ImageGen
import pathlib
import textwrap
import pendulum
import google.generativeai as genai
import os
import sys
os.environ["http_proxy"] = "http://127.0.0.1:7890"
os.environ["https_proxy"] = "http://127.0.0.1:7890"

# Used to securely store your API key
# from google.colab import userdata

# from IPython.display import display
# from IPython.display import Markdown
GEMINI_KEY = "AIzaSyBJCn5dp2-OoUi9nWJhjXlq3Tlu5OMGQm4"
genai.configure(api_key=GEMINI_KEY)
model = genai.GenerativeModel('gemini-pro')
DEFAULT_SENTENCE = "落霞与孤鹜齐飞，秋水共长天一色"
# def to_markdown(text):
#   text = text.replace('•', '  *')
#   return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))
# todo 生成图片并且保存在 时间和OUT
def make_pic_and_save(sentence, bing_cookie):
    # for bing image when dall-e3 open drop this function
    if (!sentence)
        sentence = DEFAULT_SENTENCE
    i = ImageGen(bing_cookie)
    prompt = f"revise `{sentence}` to a DALL-E prompt"    
    completion = model.generate_content(prompt)
    sentence = completion.choices[0].message.content.encode("utf8").decode()
    print(f"revies: {sentence}")
    images = i.get_images(sentence)
    date_str = pendulum.now().to_date_string()
    new_path = os.path.join("OUT_DIR", date_str)
    if not os.path.exists(new_path):
        os.mkdir(new_path)
    i.save_images(images, new_path)
    # index = random.randint(0, len(images) - 1)
    # image_url_for_issue = f"https://github.com/yihong0618/2023/blob/main/OUT_DIR/{date_str}/{index}.jpeg?raw=true"
    return images

def main():
    #todo1 get input
    #