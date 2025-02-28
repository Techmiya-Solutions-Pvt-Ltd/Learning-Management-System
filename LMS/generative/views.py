import json
import google.generativeai as genai
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

api_key = "AIzaSyAPu6-WHl506r8YuIZjE6uHLFQIm1gORC4"
genai.configure(api_key=api_key)


model = genai.GenerativeModel("gemini-2.0-flash")

chat_history = []

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
