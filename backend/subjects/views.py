from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import Subject
from .serializers import SubjectSerializer


class SubjectListAPIView(generics.ListAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer