from google import genai
from django.conf import settings

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def ask_gemini_stream(question):
    stream = client.models.generate_content_stream(
        model="gemini-3.8-flash",
        contents=question,
    )

    for chunk in stream:
        if chunk.text:
            yield chunk.text