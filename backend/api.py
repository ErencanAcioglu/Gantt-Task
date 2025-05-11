from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from mangum import Mangum

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://lvyuwgonmtbqlftwamlc.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI"

# Debug info
print(f"Supabase URL: {SUPABASE_URL}")
print(f"API Key length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

@app.get("/")
async def read_root():
    return {"message": "Gantt Chart API is running"}

@app.get("/tasks")
async def get_tasks():
    """Get all machine tasks"""
    print("Getting all machine tasks...")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Missing Supabase credentials")
    
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/machinetasks?select=*",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
        )
        
        if res.status_code != 200:
            raise HTTPException(
                status_code=res.status_code, 
                detail=f"Supabase error: {res.text}"
            )
        
        data = res.json()
        print(f"Found {len(data)} machine tasks.")
        
        if not data or len(data) == 0:
            raise HTTPException(
                status_code=404,
                detail="No machine tasks found"
            )
        
        return data

@app.get("/highlight")
async def highlight(order_code: str):
    """Search for work orders by order code"""
    print(f"Searching for work order: {order_code}")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Missing Supabase credentials")
    
    async with httpx.AsyncClient() as client:
        # First try to find the work order
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/workorders?order_code=eq.{order_code}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
        )
        
        orders = res.json()
        
        if not orders or len(orders) == 0:
            # If no orders found, try to find directly in machine tasks
            task_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/machinetasks?work_order_id=eq.{order_code}",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            tasks = task_res.json()
            
            if not tasks or len(tasks) == 0:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Work order '{order_code}' not found."
                )
            
            return tasks
        
        # If orders found, get the tasks for that order
        try:
            work_order_id = orders[0]["id"]
            
            task_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/machinetasks?work_order_id=eq.{work_order_id}",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            tasks = task_res.json()
            
            if not tasks or len(tasks) == 0:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No tasks found for work order '{order_code}'."
                )
            
            return tasks
        except Exception as e:
            # Fallback: use order_code directly
            print(f"Error: {e}")
            
            task_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/machinetasks?work_order_id=eq.{order_code}",
                headers={
                    "apikey": SUPABASE_KEY, 
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            tasks = task_res.json()
            
            if not tasks or len(tasks) == 0:
                raise HTTPException(
                    status_code=404, 
                    detail=f"Work order '{order_code}' not found."
                )
            
            return tasks

# Vercel serverless handler
handler = Mangum(app) 