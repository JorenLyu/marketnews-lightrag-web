import os
import asyncio
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import gpt_4o_mini_complete, openai_embed, deepseek_complete
from lightrag.kg.shared_storage import initialize_pipeline_status

WORKING_DIR = "./dickens"

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)


async def initialize_rag():
    rag = LightRAG(
        working_dir=WORKING_DIR,
        embedding_func=openai_embed,
        # llm_model_func=deepseek_complete,
        llm_model_func=gpt_4o_mini_complete
    )

    # Make sure you've set the OPENAI_API_KEY environment variable
    if os.environ.get("OPENAI_API_KEY") is None:
        raise ValueError("Please set the OPENAI_API_KEY environment variable")
        
    await rag.initialize_storages()
    await initialize_pipeline_status()
    await rag.aclear_cache()

    return rag


def main():
    # Initialize RAG instance
    rag = asyncio.run(initialize_rag())

    with open("./book.txt", "r", encoding="utf-8") as f:
        rag.insert(f.read())

    # Perform hybrid search
    print(
        rag.query(
            "AMD and NVDA who is better?", param=QueryParam(mode="hybrid")
        )
    )


if __name__ == "__main__":
    main()
