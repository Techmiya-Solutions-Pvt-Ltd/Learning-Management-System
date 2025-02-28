# import os
# from google import genai
# from google.genai import types

# def generate(prompt):
#     # genai.configure(api_key=os.environ.get("GIMINI_API")) 
#     genai.configure(api_key="AIzaSyAPu6-WHl506r8YuIZjE6uHLFQIm1gORC4") 
#     model = genai.GenerativeModel('gemini-pro') 
#     contents = [
#         types.Content(
#             role="user",
#             parts=[
#                 types.Part.from_text(
#                     text=prompt
#                 ),
#             ],
#         ),
#     ]

#     generate_content_config = types.GenerateContentConfig(
#         temperature=1,
#         top_p=0.95,
#         top_k=40,
#         max_output_tokens=8192,
#         response_mime_type="text/plain",
#     )

#     for chunk in model.generate_content(
#         contents=contents,
#         generation_config=generate_content_config,
#         stream=True
#     ).stream:
#         print(chunk.text, end="")

# prompt = "Write a short poem."
# generate(prompt)




# from google import genai

# client = genai.Client(api_key="AIzaSyAPu6-WHl506r8YuIZjE6uHLFQIm1gORC4")
# response = client.models.generate_content(
#     model="gemini-2.0-flash", contents="Explain how AI works"
# )
# print(response.text)




import google.generativeai as genai


api_key = "AIzaSyAPu6-WHl506r8YuIZjE6uHLFQIm1gORC4"
genai.configure(api_key=api_key)


model = genai.GenerativeModel("gemini-2.0-flash")

chat_history = []

def generate_response(prompt):
    chat_history.append({"role": "user", "parts": [prompt] })
    
    
    try:
        response = model.generate_content(chat_history)
        chat_history.append({"role": "model", "parts": [response.text]}) 
        return response.text
    except Exception as e:
        return f"An error occurred: {e}"

while True:
    prompt = input("Enter a prompt: ")
    if prompt.lower() == "exit":
        break
    else:
        response = generate_response(prompt)
        print(response)
