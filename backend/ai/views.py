import json

from django.http import JsonResponse, StreamingHttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt

from .services import ask_gemini_stream


@csrf_exempt
@require_POST
def ask_science_ai(request):
    try:
        data = json.loads(request.body)

        question = data.get("question")

        if not question:
            return JsonResponse(
                {"error": "Question is required"},
                status=400
            )

        def generate():
            try:
                for chunk in ask_gemini_stream(question):
                    print("GEMINI CHUNK:", repr(chunk))
                    yield chunk

            except Exception as e:
                print("GEMINI STREAM ERROR:", repr(e))

                yield (
                    f"\n\n[ERROR] {str(e)}"
                )

        response = StreamingHttpResponse(
            generate(),
            content_type="text/plain; charset=utf-8",
        )

        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"

        return response

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        print("REQUEST ERROR:", repr(e))

        return JsonResponse(
            {"error": str(e)},
            status=500
        )