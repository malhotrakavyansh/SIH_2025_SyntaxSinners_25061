import os
from vector_store import HeritageVectorStore

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def chunk_text(text: str) -> list[str]:
    """Split a document into paragraph-level chunks for retrieval."""
    return [p.strip() for p in text.split("\n\n") if p.strip()]


def load_documents() -> tuple[list[str], list[dict], list[str]]:
    documents, metadatas, ids = [], [], []
    for filename in sorted(os.listdir(DATA_DIR)):
        if not filename.endswith(".txt"):
            continue
        source = filename.removesuffix(".txt")
        with open(os.path.join(DATA_DIR, filename), encoding="utf-8") as f:
            text = f.read()
        for i, chunk in enumerate(chunk_text(text)):
            documents.append(chunk)
            metadatas.append({"source": source})
            ids.append(f"{source}-{i}")
    return documents, metadatas, ids


def main():
    vdb = HeritageVectorStore()
    existing = vdb.collection.count()
    if existing:
        print(f"Collection already has {existing} documents. Clearing before re-ingesting.")
        vdb.client.delete_collection("sikkim_heritage")
        vdb = HeritageVectorStore()

    documents, metadatas, ids = load_documents()
    vdb.add_documents(documents, metadatas, ids)
    print(f"Ingested {len(documents)} chunks from {len(set(m['source'] for m in metadatas))} documents.")


if __name__ == "__main__":
    main()
