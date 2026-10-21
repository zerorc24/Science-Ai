from django.urls import path
from .views import ask_science_ai

urlpatterns = [
    path("ask/", ask_science_ai, name="ask-science-ai"),
]