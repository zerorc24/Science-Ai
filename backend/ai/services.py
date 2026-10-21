from google import genai
from django.conf import settings
import time

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def ask_gemini_stream(question):
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            stream = client.models.generate_content_stream(
                model="gemini-3.8-flash",
                contents=question,
            )

            for chunk in stream:
                if chunk.text:
                    yield chunk.text

            return

        except Exception as e:
            if attempt == max_attempts - 1:
                raise

            time.sleep(2 ** attempt)
