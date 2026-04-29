from fastapi import APIRouter
from .repository import cpu_data, gpu_data, ram_data, cpu_cooler_data
from . import services

router = APIRouter(prefix="/components", tags=["components"])

@router.get("/cpu/{name}")
async def get_cpu_by_name(name: str):
    return services.find_by_name(cpu_data, name)

@router.get("/gpu/{name}")
async def get_gpu_by_name(name: str):
    return services.find_by_gpu_chipset(gpu_data, name)

@router.get("/ram/{name}")
async def get_ram_by_name(name: str):
    return services.find_by_name(ram_data, name)

@router.get("/cpu")
async def get_cpu(
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    core_count: int = None,
    graphics: bool = None,
    sort_by_price: bool = False,
):
    return services.get_cpu(
        cpu_data,
        limit=limit,
        offset=offset,
        min_price=min_price,
        max_price=max_price,
        core_count=core_count,
        graphics=graphics,
        sort_by_price=sort_by_price,
    )

@router.get("/gpu")
async def get_gpu(
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    memory: int = None,
    sort_by_price: bool = False,
):
    return services.get_gpu(
        gpu_data,
        limit=limit,
        offset=offset,
        min_price=min_price,
        max_price=max_price,
        memory=memory,
        sort_by_price=sort_by_price,
    )


@router.get("/ram")
async def get_ram(
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    size: int = None,
    sort_by_price: bool = False,
):
    return services.get_ram(
        ram_data,
        limit=limit,
        offset=offset,
        min_price=min_price,
        max_price=max_price,
        size=size,
        sort_by_price=sort_by_price,
    )

@router.get("/cpu-cooler")
async def get_cpu_cooler(limit: int = 10, offset: int = 0):
    return cpu_cooler_data[offset : offset + limit]