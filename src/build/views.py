from fastapi import APIRouter
from .compatibility import cpu_to_cooler, cpu_to_motherboard, motherboard_to_ram, psu_to_everything
from src.components.services import find_by_name, find_by_gpu_chipset
from src.components import repository

route = APIRouter(prefix="/build", tags=["build"])

@route.get("/compatible_cpu_cooler")
def compatible_cpu_cooler(cpu: str, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):
    cpu_dict = find_by_name(repository.cpu_data, cpu)
    if cpu_dict == "Not found":
        return {"error": "CPU not found"}
    if isinstance(cpu_dict, list):
        cpu_dict = cpu_dict[0]
    return cpu_to_cooler(cpu_dict)

@route.get("/compatible_cpu_motherboard")
def compatible_cpu_motherboard(cpu: str, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):
    cpu_dict = find_by_name(repository.cpu_data, cpu)
    if cpu_dict == "Not found":
        return {"error": "CPU not found"}
    if isinstance(cpu_dict, list):
        cpu_dict = cpu_dict[0]
    return cpu_to_motherboard(cpu_dict)

@route.get("/compatible_motherboard_ram")
def compatible_motherboard_ram(motherboard: str, 
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):
    motherboard_dict = find_by_name(repository.motherboard_data, motherboard)
    if motherboard_dict == "Not found":
        return {"error": "Motherboard not found"}
    if isinstance(motherboard_dict, list):
        motherboard_dict = motherboard_dict[0]
    return motherboard_to_ram(motherboard_dict)

@route.get("/compatible_psu_to_everything")
def compatible_psu_to_everything(cpu: str, gpu: str,
    limit: int = 10, 
    offset: int = 0, 
    sort_by_price: bool = False):
    cpu_dict = find_by_name(repository.cpu_data, cpu)
    gpu_dict = find_by_gpu_chipset(repository.gpu_data, gpu)
    if cpu_dict == "Not found" or gpu_dict == "Not found":
        return {"error": "One or both components not found"}
    if isinstance(cpu_dict, list):
        cpu_dict = cpu_dict[0]
    if isinstance(gpu_dict, list):
        gpu_dict = gpu_dict[0]
    return psu_to_everything(cpu_dict, gpu_dict)
