import numpy as np
from typing import List, Dict

def extract_typing_features(typing_data: List[Dict]) -> Dict[str, float]:
    if not typing_data:
        return {"avg_dwell": 0.0, "avg_flight": 0.0}
    
    dwells = [event.get("dwellTime", 0) for event in typing_data if event["type"] == "keyup"]
    flights = [event.get("flightTime", 0) for event in typing_data if event["type"] == "keydown"]
    
    return {
        "avg_dwell": float(np.mean(dwells)) if dwells else 0.0,
        "avg_flight": float(np.mean(flights)) if flights else 0.0
    }

def extract_mouse_features(mouse_data: List[Dict]) -> Dict[str, float]:
    if not mouse_data:
        return {"avg_mouse_speed": 0.0, "click_count": 0.0}
    
    moves = [event for event in mouse_data if event["type"] == "move"]
    clicks = [event for event in mouse_data if event["type"] == "click"]
    
    speeds = []
    for i in range(1, len(moves)):
        dx = moves[i].get("x", 0) - moves[i-1].get("x", 0)
        dy = moves[i].get("y", 0) - moves[i-1].get("y", 0)
        dist = np.sqrt(dx**2 + dy**2)
        dt = moves[i].get("timeDiff", 1)
        if dt > 0:
            speeds.append(dist / dt)
            
    return {
        "avg_mouse_speed": float(np.mean(speeds)) if speeds else 0.0,
        "click_count": float(len(clicks))
    }

def extract_features(behavior: Dict) -> List[float]:
    """Extracts a flat list of features for the ML model."""
    typing_features = extract_typing_features(behavior.get("typing", []))
    mouse_features = extract_mouse_features(behavior.get("mouse", []))
    
    # Feature vector: [avg_dwell, avg_flight, avg_mouse_speed, click_count]
    return [
        typing_features["avg_dwell"],
        typing_features["avg_flight"],
        mouse_features["avg_mouse_speed"],
        mouse_features["click_count"]
    ]

# --- Quick Test Block ---
if __name__ == "__main__":
    dummy_data = {
        "typing": [{"type": "keyup", "dwellTime": 120}, {"type": "keydown", "flightTime": 200}],
        "mouse": [{"type": "move", "x": 10, "y": 20, "timeDiff": 50}, {"type": "move", "x": 15, "y": 25, "timeDiff": 50}]
    }
    print("Extracted Features:", extract_features(dummy_data))