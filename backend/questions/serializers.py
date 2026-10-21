from rest_framework import serializers
from .models import Question


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "subject",
            "question_text",
            "difficulty",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]