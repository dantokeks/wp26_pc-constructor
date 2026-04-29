from src.components import repository


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
