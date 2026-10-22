from google import genai
from django.conf import settings
import time

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def ask_gemini(question):
    max_attempts = 3

    for attempt in range(max_attempts):
        try:
            response = client.models.generate_content(
                model="gemini-3.8-flash",
                contents=question,
            )

            return response.text

        except Exception:
            if attempt == max_attempts - 1:
                raise

            time.sleep(2 ** attempt)
