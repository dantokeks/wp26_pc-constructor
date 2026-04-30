from src.components import repository
from src.build.relations import cpu_socket_map

# Find cooler for CPU____________________________________________________________________________________

def cooler_score(cooler):
    if cooler["size"] is None or cooler["rpm"] is None:
        return None
    rpm = 0
    if isinstance(cooler["rpm"], list):
        rpm = max(cooler["rpm"])
    elif isinstance(cooler["rpm"], int):
        rpm = cooler["rpm"]
    size_score = cooler["size"] / 120  # 120 → 1, 360 → 3
    rpm_score = rpm / 1000  # 1750 → 1.75
    return size_score * rpm_score * 50


def cpu_to_cooler(cpu_data: dict):
    tdp = cpu_data.get("tdp")
    result = []
    for c in repository.cpu_cooler_data:
        n = cooler_score(c)
        if n == None:
            continue
        if n >= tdp:
            result.append(c)
    return result

# Find cooler for CPU___________________________________________________________________________________


#Find motherboard for CPU____________________________________________________________________________________
def cpu_to_motherboard(cpu_data: dict):
    socket = cpu_socket_map.get(cpu_data["microarchitecture"])
    if socket is None:
        return {"error": "Unsupported CPU architecture"}
    result = []
    for m in repository.motherboard_data:
        if m["socket"] == socket:
            result.append(m)
    return result
#Find motherboard for CPU_____________________________________________________________________________________

#Find RAM for motherboard__________________________________________________________________________

def _memory_type_to_number(memory_type):
    if isinstance(memory_type, int):
        return memory_type
    if isinstance(memory_type, str) and memory_type.upper().startswith("DDR"):
        try:
            return int(memory_type[3:])
        except ValueError:
            return None
    return None

def motherboard_to_ram(motherboard_data: dict):
    memory_type = _memory_type_to_number(motherboard_data.get("memory_type"))
    max_memory = motherboard_data.get("max_memory")
    memory_slots = motherboard_data.get("memory_slots")

    if memory_type is None:
        return {"error": "Unsupported motherboard memory type"}

    result = []
    for r in repository.ram_data:
        speed = r.get("speed")
        speed = speed[0] if isinstance(speed, list) else speed
        modules = r.get("modules")

        if not speed or not modules:
            continue

        ram_type = speed
        module_count = modules[0]
        total_capacity = modules[0] * modules[1]

        if ram_type != memory_type:
            continue
        if memory_slots is not None and module_count > memory_slots:
            continue
        if max_memory is not None and total_capacity > max_memory:
            continue

        result.append(r)
    return result

#Find RAM for motherboard_________________________________________________________
#CASE AND PSU

#FInd PSU for everything____________________________________________________________________________________    
#Required_Watt = (CPU + GPU + 75) × 1.25

def psu_to_everything(cpu_data: dict, gpu_data: dict): 
    cpu_tdp = cpu_data.get("tdp", 0)
    gpu_tdp = gpu_data.get("tdp", 0)
    required_watt = (cpu_tdp + gpu_tdp + 75) * 1.25

    result = []
    for p in repository.power_supply_data:
        wattage = p.get("wattage")
        if wattage is not None and wattage >= required_watt:
            result.append(p)
    return result
