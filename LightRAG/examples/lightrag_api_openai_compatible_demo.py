from fastapi import FastAPI, HTTPException, File, UploadFile
from contextlib import asynccontextmanager
from pydantic import BaseModel
import os
from lightrag import LightRAG, QueryParam
from lightrag.llm.openai import openai_complete_if_cache, openai_embed
from lightrag.utils import EmbeddingFunc
import numpy as np
from typing import Optional
import asyncio
import nest_asyncio
from lightrag.kg.shared_storage import initialize_pipeline_status

import subprocess
from fastapi.responses import HTMLResponse, PlainTextResponse, FileResponse
import requests
from bs4 import BeautifulSoup
import yfinance as yf
from datetime import datetime

from fastapi.middleware.cors import CORSMiddleware

# Apply nest_asyncio to solve event loop issues
nest_asyncio.apply()

DEFAULT_RAG_DIR = "./dickens"

# Configure working directory
WORKING_DIR = os.environ.get("RAG_DIR", f"{DEFAULT_RAG_DIR}")
print(f"WORKING_DIR: {WORKING_DIR}")
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-4o-mini")
print(f"LLM_MODEL: {LLM_MODEL}")
EMBEDDING_MODEL = os.environ.get("EMBEDDING_MODEL", "text-embedding-3-small")
print(f"EMBEDDING_MODEL: {EMBEDDING_MODEL}")
EMBEDDING_MAX_TOKEN_SIZE = int(os.environ.get("EMBEDDING_MAX_TOKEN_SIZE", 8192))
print(f"EMBEDDING_MAX_TOKEN_SIZE: {EMBEDDING_MAX_TOKEN_SIZE}")
BASE_URL = os.environ.get("BASE_URL", "https://api.openai.com/v1")
print(f"BASE_URL: {BASE_URL}")
PI_KEY = os.getenv("OPENAI_API_KEY")
print(f"API_KEY: {API_KEY}")

if not os.path.exists(WORKING_DIR):
    os.mkdir(WORKING_DIR)


# LLM model function


async def llm_model_func(
    prompt, system_prompt=None, history_messages=[], keyword_extraction=False, **kwargs
) -> str:
    return await openai_complete_if_cache(
        model=LLM_MODEL,
        prompt=prompt,
        system_prompt=system_prompt,
        history_messages=history_messages,
        base_url=BASE_URL,
        api_key=API_KEY,
        **kwargs,
    )


# Embedding function


async def embedding_func(texts: list[str]) -> np.ndarray:
    return await openai_embed(
        texts=texts,
        model=EMBEDDING_MODEL,
        base_url=BASE_URL,
        api_key=API_KEY,
    )


async def get_embedding_dim():
    test_text = ["This is a test sentence."]
    embedding = await embedding_func(test_text)
    embedding_dim = embedding.shape[1]
    print(f"{embedding_dim=}")
    return embedding_dim


# Initialize RAG instance
async def init():
    embedding_dimension = await get_embedding_dim()

    rag = LightRAG(
        working_dir=WORKING_DIR,
        llm_model_func=llm_model_func,
        embedding_func=EmbeddingFunc(
            embedding_dim=embedding_dimension,
            max_token_size=EMBEDDING_MAX_TOKEN_SIZE,
            func=embedding_func,
        ),
    )

    await rag.initialize_storages()
    await initialize_pipeline_status()
    #Delete cache or maybe you can keep it
    await rag.aclear_cache()

    return rag



@asynccontextmanager
async def lifespan(app: FastAPI):
    global rag
    rag = await init()
    print("done!")
    yield


app = FastAPI(
    title="LightRAG API", description="API for RAG operations", lifespan=lifespan
)

# Add CORS middleware here (after app definition)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-react-AWS-frontend-url.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models


class QueryRequest(BaseModel):
    query: str
    mode: str = "hybrid"
    only_need_context: bool = False


class InsertRequest(BaseModel):
    text: str


class Response(BaseModel):
    status: str
    data: Optional[str] = None
    message: Optional[str] = None


class ScrapeRequest(BaseModel):
    ticker: str
    news_count: int = 10


# Helper functions from scrape.py
def scrape_yahoo_articles(links):
    articles = []
    headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"}
    
    for link in links:
        response = requests.get(link, headers=headers)
        if response.status_code != 200:
            print(f"Failed to fetch {link}")
            continue
        
        soup = BeautifulSoup(response.content, 'html.parser')
        title_tag = soup.find('div', class_='cover-title yf-1rjrr1')
        title = title_tag.get_text(strip=True) if title_tag else 'No title found'
        
        content = []
        # Correctly select elements using CSS selectors to match multiple classes
        elements = soup.select('h2.header-scroll.yf-gn6wdt, p.yf-1090901, span.article-footer.yf-10hzt8r')
        for element in elements:
            # Break loop if footer is encountered
            if element.name == 'span' and 'article-footer' in element.get('class', []) and 'yf-10hzt8r' in element.get('class', []):
                break
            # Handle headers and paragraphs
            if element.name == 'h2':
                content.append(f"\n{element.get_text(strip=True)}\n")
            elif element.name == 'p':
                content.append(f"{element.get_text(strip=True)}\n")
        
        articles.append({"title": title, "content": "".join(content)})
    
    return articles


# API routes


@app.post("/query", response_model=Response)
async def query_endpoint(request: QueryRequest):
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: rag.query(
                request.query,
                param=QueryParam(
                    mode=request.mode, only_need_context=request.only_need_context
                ),
            ),
        )
        return Response(status="success", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/insert", response_model=Response)
async def insert_endpoint(request: InsertRequest):
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(request.text))
        return Response(status="success", message="Text inserted successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/insert_file", response_model=Response)
async def insert_file(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        # Read file content
        try:
            content = file_content.decode("utf-8")
        except UnicodeDecodeError:
            # If UTF-8 decoding fails, try other encodings
            content = file_content.decode("gbk")
        # Insert file content
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: rag.insert(content))

        return Response(
            status="success",
            message=f"File content from {file.filename} inserted successfully",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/generate_graph")
async def generate_graph():
    try:
        # Find the graph_visual_with_html.py script
        script_path = os.path.join(os.path.dirname(__file__), "graph_visual_with_html.py")

        # Execute the script (it will generate the HTML file)
        subprocess.run(["python", script_path], check=True)

        return {"status": "success", "message": "Graph generated as knowledge_graph.html"}
    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Graph generation failed: {str(e)}")


@app.get("/show_graph", response_class=HTMLResponse)
async def show_graph():
    file_path = os.path.join("/app", "knowledge_graph.html")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cannot read HTML file: {str(e)}")


@app.post("/scrape_news", response_class=PlainTextResponse)
async def scrape_news(request: ScrapeRequest):
    try:
        # Get news for the ticker
        news = yf.Search(request.ticker, news_count=request.news_count).news
        
        # Convert dates
        dates = [
            datetime.fromtimestamp(item['providerPublishTime']).strftime('%Y-%m-%d %H:%M:%S')
            for item in news
        ]
        
        # Get links
        links = [item["link"] for item in news]
        
        # Scrape articles
        scraped_articles = scrape_yahoo_articles(links)
        
        # Format output
        output = ""
        for i, article in enumerate(scraped_articles):
            output += f"Published Time: {dates[i]}\n"
            output += f"Title: {article['title']}\n"
            output += f"Content: {article['content']}\n"
            output += "-" * 100 + "\n"
        
        # Write to file for potential later use
        file_path = os.path.join(WORKING_DIR, "scraped_news.txt")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(output)
            
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"News scraping failed: {str(e)}")


@app.get("/download_graph")
async def download_graph():
    """Serve the knowledge graph HTML for download"""
    # Path to the HTML file
    html_path = os.path.join("/app", "knowledge_graph.html")
    
    if not os.path.exists(html_path):
        raise HTTPException(status_code=404, detail="Graph file not found")
    
    # Return the file with Content-Disposition header for download
    return FileResponse(
        path=html_path,
        filename="knowledge_graph.html",
        media_type="text/html",
        headers={"Content-Disposition": "attachment; filename=knowledge_graph.html"}
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8020)

# Usage example
# To run the server, use the following command in your terminal:
# python lightrag_api_openai_compatible_demo.py

# Example requests:
# 1. Query:
# curl -X POST "http://127.0.0.1:8020/query" -H "Content-Type: application/json" -d '{"query": "your query here", "mode": "hybrid"}'

# 2. Insert text:
# curl -X POST "http://127.0.0.1:8020/insert" -H "Content-Type: application/json" -d '{"text": "your text here"}'

# 3. Insert file:
# curl -X POST "http://127.0.0.1:8020/insert_file" -H "Content-Type: multipart/form-data" -F "file=@path/to/your/file.txt"

# 4. Health check:
# curl -X GET "http://127.0.0.1:8020/health"
