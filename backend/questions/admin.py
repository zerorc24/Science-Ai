from django.contrib import admin

# Register your models here
from django.contrib import admin
from .models import Question


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("question_text", "subject", "difficulty", "created_at")
    list_filter = ("subject", "difficulty")
    search_fields = ("question_text",)