from fastapi import APIRouter
from .repository import storage_data, cpu_data, gpu_data, ram_data, cpu_cooler_data, motherboard_data, power_supply_data
from . import services
from typing import Literal

router = APIRouter(prefix="/components", tags=["components"])

@router.get("/cpu")
async def get_cpu(
    name : str = None,
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    core_count: int = None,
    graphics: bool = None,
    sort_by_price: bool = False
):
    if name:
        data = services.find_by_name(cpu_data, name)
    return services.get_cpu(
        data if name else cpu_data,
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
    name : str = None,
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    memory: int = None,
    sort_by_price: bool = False,
):
    if name:
        data = services.find_by_gpu_chipset(gpu_data, name)
    return services.get_gpu(
        data if name else gpu_data,
        limit=limit,
        offset=offset,
        min_price=min_price,
        max_price=max_price,
        memory=memory,
        sort_by_price=sort_by_price,
    )


@router.get("/ram")
async def get_ram(
    name : str = None,
    limit: int = 10,
    offset: int = 0,
    min_price: int = None,
    max_price: int = None,
    size: int = None,
    sort_by_price: bool = False,
):
    if name:
        data = services.find_by_name(ram_data, name)
    return services.get_ram(
        data if name else
        ram_data,
        limit=limit,
        offset=offset,
        min_price=min_price,
        max_price=max_price,
        size=size,
        sort_by_price=sort_by_price,
    )

@router.get("/cpu-cooler")
async def get_cpu_cooler(
    min_price: int = None, 
    max_price: int = None, 
    limit: int = 10, 
    offset: int = 0,
    sort_by_price: bool = False):

    return services.get_cpu_cooler(
        cpu_cooler_data,
        min_price=min_price,
        max_price=max_price,
        limit=limit,
        offset=offset,
        sort_by_price=sort_by_price
    )

@router.get("/motherboard")
async def get_motherboard(
    min_price: int = None, 
    max_price: int = None, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):

    return services.get_motherboard(
        motherboard_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset
    )

@router.get("/power-supply")
async def get_power_supply(
    min_price: int = None, 
    max_price: int = None, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):

    return services.get_power_supply(
        power_supply_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset
    )

@router.get("/storage(SSD/HDD)")
async def get_storage(
    min_price: int = None, 
    max_price: int = None, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):

    return services.get_storage(
        storage_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset
    )