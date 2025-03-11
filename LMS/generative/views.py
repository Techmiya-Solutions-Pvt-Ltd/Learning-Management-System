import json
import google.generativeai as genai
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.contrib.auth.decorators import login_required
from pymongo import MongoClient

api_key = "AIzaSyAPu6-WHl506r8YuIZjE6uHLFQIm1gORC4"
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-2.0-flash")
chat_history = []

url = 'mongodb+srv://kmnaveen777:naveen@atlas.eokhe.mongodb.net/'

client = MongoClient(url)

db = client["test_mongo"]  
collection = db["questions"]
skills_collection = db["skills"]


def get_skills(request):
    skills = list(skills_collection.find({}, {"_id": 0, "name": 1})) 
    skill_names = [skill["name"] for skill in skills]
    return JsonResponse(skill_names, safe=False)


import re
from datetime import datetime

@login_required
def store_question(request):
    if request.method == "POST":
        try:
         
            raw_data = request.body.decode("utf-8")

 
            cleaned_data = re.sub(r"\\n", "", raw_data)

            # print("hii",    request.session.teacher_id)
            question_data = json.loads(cleaned_data)

       
            collection.insert_one({
               
                "questions": question_data,
                "timestamp": datetime.utcnow().isoformat() 
            })

            return JsonResponse({"message": "Question set stored successfully!"}, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Invalid request method"}, status=405) 


@login_required(login_url="/loginteacher/")
def chat_page(request):
    """Render chat page."""
    return render(request, "chat.html")

from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  
def chat_view(request):
    print("chat_view")
    if request.method == "POST":
        prompt = request.POST.get("message")
        if prompt:
            chat_history.append({"role": "user", "parts": [prompt]})
            try:
                response = model.generate_content(chat_history)
                chat_text = response.text
                chat_history.append({"role": "model", "parts": [chat_text]})
                return JsonResponse({"response": chat_text})
            except Exception as e:
                return JsonResponse({"response": f"An error occurred: {e}"})

    return JsonResponse({"error": "Invalid request"}, status=400)


def download_chat_history(request):
    """Download chat history as JSON file."""
    
    if not chat_history:
        return JsonResponse({"error": "No chat history found"}, status=400)

    response = HttpResponse(
        json.dumps(chat_history, indent=4), content_type="application/json"
    )
    response["Content-Disposition"] = "attachment; filename=chat_history.json"
    return response
