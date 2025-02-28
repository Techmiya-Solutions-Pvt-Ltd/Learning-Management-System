from django.urls import path
from .views import chat_page, chat_view, download_chat_history

urlpatterns = [
    path("", chat_page, name="chat_page"),
    path("chat/", chat_view, name="chat_view"),  
    path("chat/download/", download_chat_history, name="download_chat"),
    path("gen/chat/download/", download_chat_history, name="download_chat"),
]
