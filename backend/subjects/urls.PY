from django.urls import path
from .views import SubjectListAPIView


urlpatterns = [
    path("", SubjectListAPIView.as_view(), name="subject-list"),
]