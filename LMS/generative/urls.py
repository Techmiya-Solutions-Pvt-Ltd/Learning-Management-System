from django.urls import path
from .views import chat_page, chat_view, download_chat_history, store_question, get_skills

urlpatterns = [
    path("", chat_page, name="chat_page"),
    path("chat/", chat_view, name="chat_view"),  
    path("chat/download/", download_chat_history, name="download_chat"),
    path("gen/chat/download/", download_chat_history, name="download_chat"),
    path("store_question/", store_question, name="store_question"),
    path('api/skills/', get_skills, name='get_skills'),
]
