from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Question
from .serializers import QuestionSerializer


class QuestionListCreateAPIView(generics.ListCreateAPIView):
    queryset = Question.objects.all().order_by("-created_at")
    serializer_class = QuestionSerializer