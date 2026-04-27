import uvicorn
from fastapi import FastAPI
from src.components.views import router as components_router


app = FastAPI(
    title="PC-Constructor",
    description="PC-Constructor, a tool to help users build their own custom PCs by providing compatibility checks and component recommendations.",
    version="1.0.0",
)

app.include_router(components_router)