import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.components.views import router as components_router
from src.build.views import route as build_router


app = FastAPI(
    title="PC-Constructor",
    description="PC-Constructor, a tool to help users build their own custom PCs by providing compatibility checks and component recommendations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(components_router)
app.include_router(build_router)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
