import json
from pathlib import Path

# Read the file
file_path = Path(__file__).parent.parent / "data" / "cpu.json"
with open(file_path, "r") as f:
    cpu_data = json.load(f)


file_path = Path(__file__).parent.parent / "data" / "video-card.json"
with open(file_path, "r") as f:
    gpu_data = json.load(f)