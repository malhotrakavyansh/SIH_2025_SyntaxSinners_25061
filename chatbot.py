import logging
from google import genai
from google.genai import types
from vector_store import HeritageVectorStore

logger = logging.getLogger(__name__)

class BodhiChatbot:
    def __init__(self, api_key: str):
        self.client = genai.Client(api_key=api_key)
        self.vdb = HeritageVectorStore()

        self.system_prompt = (
            "You are Bodhi, a knowledgeable and friendly tourism guide for Sikkim, India. "
            "You are an expert on Sikkim's monasteries, culture, tourism, and travel information.\n"
            "- Be warm and welcoming, using occasional Nepali greetings like 'Namaste'.\n"
            "- Use the provided context to answer questions accurately.\n"
        )
        
        # Config 1: Exclusively for Live Internet Searches
        self.live_config = types.GenerateContentConfig(
            system_instruction=self.system_prompt,
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
        
        # Config 2: Exclusively for Local Database Answers
        self.local_config = types.GenerateContentConfig(
            system_instruction=self.system_prompt
        )

        self.sessions: dict[str, list[str]] = {}

    def classify_query(self, query: str) -> str:
        """Invisible routing step: Decides whether to use ChromaDB or Google Search."""
        routing_prompt = (
            f"Classify the following query into exactly one of these two categories:\n"
            f"1. 'LIVE': If it asks for real-time data, current weather, active travel conditions, or current events.\n"
            f"2. 'LOCAL': If it asks for historical facts, culture, architecture, or general information.\n\n"
            f"Query: {query}\n\n"
            f"Reply with ONLY the word LIVE or LOCAL."
        )
        try:
            resp = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=routing_prompt
            )
            return "LIVE" if "LIVE" in resp.text.upper() else "LOCAL"
        except Exception:
            logger.exception("classify_query failed; defaulting to LOCAL routing")
            return "LOCAL"

    @staticmethod
    def _extract_grounding_sources(resp) -> list[str]:
        """Pulls web citation titles/URIs out of a Google Search-grounded response."""
        sources = []
        try:
            for candidate in getattr(resp, "candidates", None) or []:
                grounding_metadata = getattr(candidate, "grounding_metadata", None)
                if not grounding_metadata:
                    continue
                for chunk in getattr(grounding_metadata, "grounding_chunks", None) or []:
                    web = getattr(chunk, "web", None)
                    if web and getattr(web, "uri", None):
                        sources.append(getattr(web, "title", None) or web.uri)
        except Exception:
            logger.exception("Failed to extract grounding sources")
        return sources

    def generate_response(self, user_query: str, session_id: str) -> dict:
        route = self.classify_query(user_query)
        history = self.sessions.setdefault(session_id, [])
        history_text = "\n".join(history[-4:])

        if route == "LIVE":
            print("\n[Bodhi is routing to Google Grounded Search]")
            final_prompt = f"Previous Conversation:\n{history_text}\n\nCurrent User Query: {user_query}"
            config_to_use = self.live_config

        else:
            print("\n[Bodhi is routing to local ChromaDB]")
            local_docs = self.vdb.query_heritage(user_query)
            context = " ".join(d["text"] for d in local_docs) if local_docs else "No specific local data found."
            final_prompt = (
                f"Previous Conversation:\n{history_text}\n\n"
                f"Local Database Context:\n{context}\n\n"
                f"Current User Query: {user_query}"
            )
            config_to_use = self.local_config

        try:
            resp = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=final_prompt,
                config=config_to_use
            )

            history.extend([f"User: {user_query}", f"Bodhi: {resp.text}"])

            if route == "LIVE":
                sources = self._extract_grounding_sources(resp)
            else:
                sources = sorted({d["source"] for d in local_docs}) if local_docs else []

            return {"reply": resp.text, "sources": sources}

        except Exception as e:
            logger.exception("generate_response failed for route=%s", route)
            return {"reply": f"Error generating response: {e}", "sources": []}