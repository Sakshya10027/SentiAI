import numpy as np
from typing import List, Dict

def extract_typing_features(typing_data: List[Dict]) -> Dict[str, float]:
    if not typing_data:
        # If no typing data but user logged in, it's likely a copy-paste
        return {"avg_dwell": 0.0, "avg_flight": 0.0, "min_flight": 0.0, "is_paste": 1.0, "event_count": 0.0}
    
    dwells = [event.get("dwellTime", 0) for event in typing_data if event["type"] == "keyup"]
    flights = [event.get("flightTime", 0) for event in typing_data if event["type"] == "keydown" and event.get("flightTime", 0) > 0]
    pastes = [event for event in typing_data if event["type"] == "paste"]
    
    # Heuristic for copy-paste detection: 
    # 1. Explicit paste events
    # 2. Very few events for a login attempt
    is_paste = 1.0 if pastes or len(typing_data) < 4 else 0.0
    
    return {
        "avg_dwell": float(np.mean(dwells)) if dwells else 0.0,
        "avg_flight": float(np.mean(flights)) if flights else 0.0,
        "min_flight": float(np.min(flights)) if flights else 0.0,
        "is_paste": is_paste,
        "event_count": float(len(typing_data))
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

def extract_features(behavior: Dict) -> Dict[str, float]:
    """Extracts a dictionary of features for the risk engine."""
    typing_features = extract_typing_features(behavior.get("typing", []))
    mouse_features = extract_mouse_features(behavior.get("mouse", []))
    
    return {
        **typing_features,
        **mouse_features
    }

# --- Quick Test Block ---
if __name__ == "__main__":
    dummy_data = {
        "typing": [{"type": "keyup", "dwellTime": 120}, {"type": "keydown", "flightTime": 200}],
        "mouse": [{"type": "move", "x": 10, "y": 20, "timeDiff": 50}, {"type": "move", "x": 15, "y": 25, "timeDiff": 50}]
    }
    print("Extracted Features:", extract_features(dummy_data))