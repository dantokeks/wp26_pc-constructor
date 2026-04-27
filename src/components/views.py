from fastapi import APIRouter
from .repository import cpu_data, gpu_data

router = APIRouter(prefix="/components")

@router.get("/cpu")
async def get_cpu():
    return cpu_data

@router.get("/gpu")
async def get_gpu():
    return gpu_data

