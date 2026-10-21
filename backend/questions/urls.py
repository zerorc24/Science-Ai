from django.urls import path
from .views import QuestionListCreateAPIView


urlpatterns = [
    path("", QuestionListCreateAPIView.as_view(), name="question-list-create"),
]