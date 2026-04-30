import json
from pathlib import Path

# Read the file
file_path = Path(__file__).parent.parent / "data" / "cpu.json"
with open(file_path, "r", encoding="utf-8") as f:
    cpu_data = json.load(f)


file_path = Path(__file__).parent.parent / "data" / "video-card.json"
with open(file_path, "r", encoding="utf-8") as f:
    gpu_data = json.load(f)

file_path = Path(__file__).parent.parent / "data" / "memory.json"
with open(file_path, "r", encoding="utf-8") as f:
    ram_data = json.load(f)

file_path = Path(__file__).parent.parent / "data" / "cpu-cooler.json"
with open(file_path, "r", encoding="utf-8") as f:
    cpu_cooler_data = json.load(f)

file_path = Path(__file__).parent.parent / "data" / "motherboard.json"
with open(file_path, "r", encoding="utf-8") as f:
    motherboard_data = json.load(f)

file_path = Path(__file__).parent.parent / "data" / "power-supply.json"
with open(file_path, "r", encoding="utf-8") as f:
    power_supply_data = json.load(f)

file_path = Path(__file__).parent.parent / "data" / "external_hard_drive.json"
with open(file_path, "r", encoding="utf-8") as f:
    storage_data = json.load(f)
