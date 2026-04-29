from fastapi import APIRouter
from .compatibility import cpu_to_cooler
from src.components.services import find_by_name
from src.components import repository

route = APIRouter(prefix="/build", tags=["build"])

@route.get("/compatible_cpu_cooler")
def compatible_cpu_cooler(cpu: str):
    cpu_dict = find_by_name(repository.cpu_data, cpu)
    if cpu_dict == "Not found":
        return {"error": "CPU not found"}
    if isinstance(cpu_dict, list):
        cpu_dict = cpu_dict[0]
    return cpu_to_cooler(cpu_dict)