import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .services import ask_gemini


@csrf_exempt
@require_POST
def ask_science_ai(request):
    try:
        data = json.loads(request.body)

        question = data.get("question", "").strip()

        if not question:
            return JsonResponse(
                {"error": "Question is required."},
                status=400
            )

        answer = ask_gemini(question)

        return JsonResponse({
            "question": question,
            "answer": answer,
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON request."},
            status=400
        )

    except Exception as e:
        print(f"AI ERROR: {e}")

        return JsonResponse(
            {"error": "AI service temporarily unavailable."},
            status=500
        )
