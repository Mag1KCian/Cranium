import asyncio
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

class Component:
    def __init__(self, name: str, base_power: float, max_power: float):
        self.name = name
        self.base_power = base_power
        self.max_power = max_power
        self.current_power = base_power
        self.is_failed = False

    def update(self) -> Optional[Dict[str, Any]]:
        # If the component failed previously, its power draw remains at zero
        if self.is_failed:
            self.current_power = 0.0
            return None

        # Simulate realistic baseline fluctuations (+/- 5%)
        fluctuation = random.uniform(-0.05, 0.05) * self.base_power
        
        # Simulate randomized, sudden power spike events (0.5% chance per tick)
        spike = 0
        if random.random() < 0.005:
            spike = random.uniform(1.2, 2.5) * self.base_power

        self.current_power = self.base_power + fluctuation + spike

        # Safety cutoff logic: Exceeding max wattage triggers a failure and AI alert payload
        if self.current_power > self.max_power:
            alert = {
                "component": self.name,
                "power": round(self.current_power),
                "threshold": self.max_power,
                "severity": "critical",
                "message": f"System Alert: {self.name} exceeded maximum safe wattage ({self.max_power}W) and triggered safety cutoff."
            }
            self.is_failed = True
            self.current_power = 0.0
            return alert
        
        return None

class Room:
    def __init__(self, name: str, components: List[Component]):
        self.name = name
        self.components = components

    def update(self) -> tuple[float, List[Dict[str, Any]]]:
        total_power = 0.0
        alerts = []
        for comp in self.components:
            alert = comp.update()
            if alert:
                alert["room"] = self.name
                alerts.append(alert)
            total_power += comp.current_power
        return total_power, alerts

class Floor:
    def __init__(self, name: str, rooms: List[Room]):
        self.name = name
        self.rooms = rooms

    def update(self) -> tuple[float, List[Dict[str, Any]]]:
        total_power = 0.0
        alerts = []
        for room in self.rooms:
            power, room_alerts = room.update()
            total_power += power
            alerts.extend(room_alerts)
        return total_power, alerts

class Building:
    def __init__(self, name: str, floors: List[Floor]):
        self.name = name
        self.floors = floors

    def update(self) -> tuple[float, List[Dict[str, Any]]]:
        total_power = 0.0
        alerts = []
        for floor in self.floors:
            power, floor_alerts = floor.update()
            total_power += power
            alerts.extend(floor_alerts)
        return total_power, alerts

app = FastAPI(title="Project Thermal Grid Simulation API")

# Initialize the multi-story model for the UIET Academic Block
def build_uiet_academic_block() -> Building:
    floors = []
    for f in range(1, 4):  # 3 Floors
        rooms = []
        for r in range(1, 6):  # 5 Rooms per floor
            rooms.append(Room(f"Room {f}0{r}", [
                Component("HVAC Unit", base_power=2000, max_power=3800),
                Component("Lighting System", base_power=400, max_power=600),
                Component("Lab Equipment & Outlets", base_power=1500, max_power=3000)
            ]))
        floors.append(Floor(f"Floor {f}", rooms))
    return Building("UIET Academic Block", floors)

building = build_uiet_academic_block()
active_connections: List[WebSocket] = []

@app.websocket("/ws/power-data")
async def power_data_websocket(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        # Keep connection open waiting for client disconnect
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def simulation_loop():
    """Continuous time-series loop generating real-time building state."""
    while True:
        total_wattage, alerts = building.update()
        
        payload = {
            "timestamp": datetime.now().strftime("%I:%M:%S %p"),
            "total_wattage": round(total_wattage),
            "alerts": alerts
        }
        
        # Broadcast to all connected WebSocket clients
        disconnected_clients = []
        for connection in active_connections:
            try:
                await connection.send_json(payload)
            except Exception:
                disconnected_clients.append(connection)
        
        # Prune dead connections
        for d in disconnected_clients:
            if d in active_connections:
                active_connections.remove(d)
                
        # Tick every 3 seconds
        await asyncio.sleep(3)

@app.on_event("startup")
async def startup_event():
    # Mount the infinite simulation loop in the background when the server starts
    asyncio.create_task(simulation_loop())

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)