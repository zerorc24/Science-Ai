from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/subjects/", include("subjects.urls")),
    path("api/questions/", include("questions.urls")),
    path("api/ai/", include("ai.urls")),
]