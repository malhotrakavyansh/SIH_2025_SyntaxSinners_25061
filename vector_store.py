import chromadb
from chromadb.utils import embedding_functions

class HeritageVectorStore:
    def __init__(self, persist_directory: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="paraphrase-multilingual-MiniLM-L12-v2"
        )
        
        self.collection = self.client.get_or_create_collection(
            name="sikkim_heritage",
            embedding_function=self.embedding_function
        )

    def add_documents(self, documents: list[str], metadatas: list[dict], ids: list[str]):
        """Ingests verified text chunks into the vector store."""
        self.collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )

    def query_heritage(self, query_text: str, n_results: int = 2) -> list[dict]:
        """Performs semantic similarity search based on vector distance.

        Returns a list of {"text": ..., "source": ...} dicts so callers can
        cite where retrieved context came from.
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        documents = results['documents'][0] if results['documents'] else []
        metadatas = results['metadatas'][0] if results['metadatas'] else []
        return [
            {"text": doc, "source": meta.get("source", "unknown")}
            for doc, meta in zip(documents, metadatas)
        ]