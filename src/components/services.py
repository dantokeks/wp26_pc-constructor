from typing import List, Dict, Any, Optional

def find_by_name(data: List[Dict[str, Any]], name: str) -> Optional[Dict[str, Any]]:
    #Search for an item by name (case-insensitive, partial match). Returns list of matches or "Not found" if not found.
    name = name.lower()
    result = [item for item in data if name in item.get("name", "").lower()]
    if len(result) == 1:
        return result[0]
    return result if result else "Not found"

def find_by_gpu_chipset(data: List[Dict[str, Any]], chipset: str) -> Optional[Dict[str, Any]]:
    #Search for an item by GPU chipset (case-insensitive, partial match). Returns list of matches or "Not found" if not found.
    chipset = chipset.lower()
    result = [item for item in data if chipset in item.get("chipset", "").lower()]
    if len(result) == 1:
        return result[0]
    return result if result else "Not found"

def filter_data(
    data: List[Dict[str, Any]],
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by_price: bool = False,
    limit: int = 50,
    offset: int = 0,
    **filters,
) -> Dict[str, Any]:
    #pagination, filtering, sorting
    result = data
    # Price filtering (None values are ignored)
    if min_price is not None or max_price is not None:
        result = [
            item for item in result
            if item.get("price") is not None
            and (min_price is None or item["price"] >= min_price)
            and (max_price is None or item["price"] <= max_price)
        ]
    # Attribute filtering (None values are ignored)
    for key, value in filters.items():
        if value is not None:
            # : graphics is a special case where True means has integrated graphics and False means doesn't have integrated graphics
            if key == "graphics":
                if value is True:  # has integrated graphics
                    result = [item for item in result if item.get(key) is not None]
                elif value is False:  # no integrated graphics
                    result = [item for item in result if item.get(key) is None]
            else:
                result = [item for item in result if item.get(key) == value]
    total = len(result)
    # Sorting by price (None values at the end)
    if sort_by_price:
        result = sorted(result, key=lambda x: (x.get("price") is None, x.get("price")))
    # Pagination
    result = result[offset : offset + limit]
    # Price normalization (without mutation)
    result = [
        {**item, "price": int(item["price"]) if item.get("price") is not None else None}
        for item in result
    ] 
    return {"items": result, "total": total, "limit": limit, "offset": offset}



def get_cpu(
    cpu_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    core_count: Optional[int] = None,
    graphics: Optional[bool] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get CPU with filtering and pagination. Special handling for graphics: true/false means has/doesn't have integrated graphics.
    filters = {}
    if core_count is not None:
        filters["core_count"] = core_count
    if graphics is not None:
        filters["graphics"] = graphics
    
    return filter_data(
        cpu_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
        **filters,
    )


def get_gpu(
    gpu_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    memory: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get GPU with filtering and pagination.
    return filter_data(
        gpu_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
        memory=memory,
    )


def get_ram(
    ram_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    size: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get RAM with filtering and pagination.
    return filter_data(
        ram_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
        size=size,
    )

def get_cpu_cooler(
    cpu_cooler_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get CPU cooler with filtering and pagination.
    return filter_data(
        cpu_cooler_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
    )

def get_motherboard(
    motherboard_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get Motherboard with filtering and pagination.
    return filter_data(
        motherboard_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
    )

def get_power_supply(
    power_supply_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get Power Supply with filtering and pagination.
    return filter_data(
        power_supply_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
    )

def get_storage(
    storage_data: List[Dict[str, Any]],
    limit: int = 50,
    offset: int = 0,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    size: Optional[int] = None,
    sort_by_price: bool = False,
) -> Dict[str, Any]:
    #Get Storage with filtering and pagination.
    return filter_data(
        storage_data,
        min_price=min_price,
        max_price=max_price,
        sort_by_price=sort_by_price,
        limit=limit,
        offset=offset,
        size=size,
    )

