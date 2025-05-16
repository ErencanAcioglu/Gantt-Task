#!/usr/bin/env python3
# sample_data.py - Script to populate Supabase with sample data for the Gantt chart

import sys
print(f"Python version: {sys.version}")
print(f"Python path: {sys.path}")
try:
    import httpx
    print("Successfully imported httpx")
except ImportError as e:
    print(f"Error importing httpx: {e}")
    print("Please install it with: pip install httpx")
    sys.exit(1)

import asyncio
from dotenv import load_dotenv
import os
import json
from datetime import datetime, timedelta
import uuid

# Load environment variables
load_dotenv()

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://lvyuwgonmtbqlftwamlc.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI"

# Machines based on the screenshots
MACHINES = [
    "SARDON", "RAM 2", "FINAL KALITE KONTROL", "RAM 1", "SARDON 1", 
    "KURUTMA 2", "SARDON 2", "YIKAMA", "TUP ACMA", "KURUTMA 1", 
    "BALON", "KON5", "KON3"
]

# Work orders with UUIDs - keeping track of them for later reference
WORK_ORDER_MFG5_ID = str(uuid.uuid4())
WORK_ORDER_MFG1_ID = str(uuid.uuid4())
WORK_ORDER_MFG2_ID = str(uuid.uuid4())
WORK_ORDER_MFG3_ID = str(uuid.uuid4())
WORK_ORDER_MFG4_ID = str(uuid.uuid4())
WORK_ORDER_MFG6_ID = str(uuid.uuid4())
WORK_ORDER_MFG7_ID = str(uuid.uuid4())

# Work orders - Standardized to MFG-X format to avoid confusion with machine names
WORK_ORDERS = [
    {"id": WORK_ORDER_MFG1_ID, "order_code": "MFG-1", "customer_name": "ATLAS", "quantity": 50},
    {"id": WORK_ORDER_MFG2_ID, "order_code": "MFG-2", "customer_name": "ATLAS", "quantity": 75},
    {"id": WORK_ORDER_MFG3_ID, "order_code": "MFG-3", "customer_name": "ATLAS", "quantity": 60},
    {"id": WORK_ORDER_MFG4_ID, "order_code": "MFG-4", "customer_name": "ATLAS", "quantity": 40},
    {"id": WORK_ORDER_MFG5_ID, "order_code": "MFG-5", "customer_name": "ATLAS", "quantity": 100},
    {"id": WORK_ORDER_MFG6_ID, "order_code": "MFG-6", "customer_name": "ATLAS", "quantity": 55},
    {"id": WORK_ORDER_MFG7_ID, "order_code": "MFG-7", "customer_name": "ATLAS", "quantity": 65},
]

# Base date for the tasks
BASE_DATE = datetime(2024, 12, 18, 5, 0, 0)  # 2024-12-18 05:00:00

# This function will return the correct work order ID based on the code
def get_work_order_id(code):
    if code == "MFG-1":
        return WORK_ORDER_MFG1_ID
    elif code == "MFG-2":
        return WORK_ORDER_MFG2_ID
    elif code == "MFG-3":
        return WORK_ORDER_MFG3_ID
    elif code == "MFG-4":
        return WORK_ORDER_MFG4_ID
    elif code == "MFG-5":
        return WORK_ORDER_MFG5_ID
    elif code == "MFG-6":
        return WORK_ORDER_MFG6_ID
    elif code == "MFG-7":
        return WORK_ORDER_MFG7_ID
    else:
        return WORK_ORDER_MFG5_ID  # Default

# Sample machine tasks that match the screenshot
# Note: work_order_id is now a placeholder string that will be replaced with actual UUID
MACHINE_TASKS = [
    # SARDON - Ek iş emirleri
    {"machine_name": "SARDON", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "SARDON", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "SARDON", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "SARDON", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "SARDON", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    {"machine_name": "SARDON", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=24), "end_time": BASE_DATE + timedelta(hours=26)},
    
    # RAM 2
    {"machine_name": "RAM 2", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=3), "end_time": BASE_DATE + timedelta(hours=5)},
    {"machine_name": "RAM 2", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=5), "end_time": BASE_DATE + timedelta(hours=7)},
    {"machine_name": "RAM 2", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=7), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "RAM 2", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=14), "end_time": BASE_DATE + timedelta(hours=16)},
    {"machine_name": "RAM 2", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=18), "end_time": BASE_DATE + timedelta(hours=22)},
    {"machine_name": "RAM 2", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=24), "end_time": BASE_DATE + timedelta(hours=28)},
    
    # FINAL KALITE KONTROL
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=2), "end_time": BASE_DATE + timedelta(hours=4)},
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=6), "end_time": BASE_DATE + timedelta(hours=8)},
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=40)},
    {"machine_name": "FINAL KALITE KONTROL", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=10), "end_time": BASE_DATE + timedelta(hours=12)},
    
    # RAM 1
    {"machine_name": "RAM 1", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "RAM 1", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=1), "end_time": BASE_DATE + timedelta(hours=4)},
    {"machine_name": "RAM 1", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "RAM 1", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=6), "end_time": BASE_DATE + timedelta(hours=20)},
    {"machine_name": "RAM 1", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=10), "end_time": BASE_DATE + timedelta(hours=12)},
    {"machine_name": "RAM 1", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=14), "end_time": BASE_DATE + timedelta(hours=16)},
    
    # SARDON 1
    {"machine_name": "SARDON 1", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "SARDON 1", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=3), "end_time": BASE_DATE + timedelta(hours=5)},
    {"machine_name": "SARDON 1", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=5), "end_time": BASE_DATE + timedelta(hours=7)},
    {"machine_name": "SARDON 1", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=7), "end_time": BASE_DATE + timedelta(hours=9)},
    {"machine_name": "SARDON 1", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=10), "end_time": BASE_DATE + timedelta(hours=12)},
    {"machine_name": "SARDON 1", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=14), "end_time": BASE_DATE + timedelta(hours=16)},
    
    # KURUTMA 2
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=1), "end_time": BASE_DATE + timedelta(hours=7)},
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "KURUTMA 2", "work_order_id": "MFG-7", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    
    # SARDON 2
    {"machine_name": "SARDON 2", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=3)},
    {"machine_name": "SARDON 2", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=5), "end_time": BASE_DATE + timedelta(hours=13)},
    {"machine_name": "SARDON 2", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=13), "end_time": BASE_DATE + timedelta(hours=15)},
    {"machine_name": "SARDON 2", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "SARDON 2", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    {"machine_name": "SARDON 2", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=22), "end_time": BASE_DATE + timedelta(hours=24)},
    
    # YIKAMA
    {"machine_name": "YIKAMA", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "YIKAMA", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=2), "end_time": BASE_DATE + timedelta(hours=7)},
    {"machine_name": "YIKAMA", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "YIKAMA", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "YIKAMA", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "YIKAMA", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    
    # TUP ACMA
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=1)},
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=1), "end_time": BASE_DATE + timedelta(hours=3)},
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=3), "end_time": BASE_DATE + timedelta(hours=5)},
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=5), "end_time": BASE_DATE + timedelta(hours=7)},
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=7), "end_time": BASE_DATE + timedelta(hours=9)},
    {"machine_name": "TUP ACMA", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=9), "end_time": BASE_DATE + timedelta(hours=11)},
    
    # KURUTMA 1
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=2)},
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "KURUTMA 1", "work_order_id": "MFG-7", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    
    # BALON
    {"machine_name": "BALON", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=2)},
    {"machine_name": "BALON", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "BALON", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "BALON", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "BALON", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "BALON", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=20), "end_time": BASE_DATE + timedelta(hours=22)},
    
    # KON5
    {"machine_name": "KON5", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE, "end_time": BASE_DATE + timedelta(hours=2)},
    {"machine_name": "KON5", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=4), "end_time": BASE_DATE + timedelta(hours=6)},
    {"machine_name": "KON5", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=8), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "KON5", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=12), "end_time": BASE_DATE + timedelta(hours=14)},
    {"machine_name": "KON5", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=16), "end_time": BASE_DATE + timedelta(hours=18)},
    {"machine_name": "KON5", "work_order_id": "MFG-6", 
     "start_time": BASE_DATE + timedelta(hours=18), "end_time": BASE_DATE + timedelta(hours=20)},
    
    # KON3 (with the tooltip from the screenshot)
    {"machine_name": "KON3", "work_order_id": "MFG-5", 
     "start_time": BASE_DATE + timedelta(hours=4.97), "end_time": BASE_DATE + timedelta(hours=5.47)},
    {"machine_name": "KON3", "work_order_id": "MFG-3", 
     "start_time": BASE_DATE + timedelta(hours=2), "end_time": BASE_DATE + timedelta(hours=10)},
    {"machine_name": "KON3", "work_order_id": "MFG-1", 
     "start_time": BASE_DATE + timedelta(hours=10), "end_time": BASE_DATE + timedelta(hours=12)},
    {"machine_name": "KON3", "work_order_id": "MFG-2", 
     "start_time": BASE_DATE + timedelta(hours=14), "end_time": BASE_DATE + timedelta(hours=16)},
    {"machine_name": "KON3", "work_order_id": "MFG-4", 
     "start_time": BASE_DATE + timedelta(hours=18), "end_time": BASE_DATE + timedelta(hours=20)},
    {"machine_name": "KON3", "work_order_id": "MFG-7", 
     "start_time": BASE_DATE + timedelta(hours=22), "end_time": BASE_DATE + timedelta(hours=24)},
]

async def insert_work_orders():
    """Insert work orders into Supabase."""
    async with httpx.AsyncClient() as client:
        print("Inserting work orders...")
        
        # First, delete all existing records
        await client.delete(
            f"{SUPABASE_URL}/rest/v1/workorders?",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "return=minimal"
            }
        )
        
        # Insert new work orders
        for order in WORK_ORDERS:
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/workorders",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=order
            )
            
            if response.status_code != 201:
                print(f"Error inserting order {order['order_code']}: {response.text}")
            else:
                print(f"Added work order: {order['order_code']} with ID: {order['id']}")

async def insert_machine_tasks():
    """Insert machine tasks into Supabase."""
    async with httpx.AsyncClient() as client:
        print("Inserting machine tasks...")
        
        # First, delete all existing records
        await client.delete(
            f"{SUPABASE_URL}/rest/v1/machinetasks?",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "return=minimal"
            }
        )
        
        # Insert new machine tasks
        for i, task in enumerate(MACHINE_TASKS, start=1):
            # Convert the work_order_id string to the actual UUID
            work_order_id = get_work_order_id(task["work_order_id"])
            
            # Format dates properly for API
            start_time_str = task["start_time"].strftime("%Y-%m-%d %H:%M:%S")
            end_time_str = task["end_time"].strftime("%Y-%m-%d %H:%M:%S")
            
            task_data = {
                "machine_name": task["machine_name"],
                "work_order_id": work_order_id,
                "start_time": start_time_str,
                "end_time": end_time_str
            }
            
            response = await client.post(
                f"{SUPABASE_URL}/rest/v1/machinetasks",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=task_data
            )
            
            if response.status_code != 201:
                print(f"Error inserting task {i}/{len(MACHINE_TASKS)}: {response.text}")
            else:
                print(f"Added task {i}/{len(MACHINE_TASKS)}: {task['machine_name']} - {task['work_order_id']}")

async def main():
    """Main function to populate the Supabase database."""
    print("Starting data insertion...")
    
    await insert_work_orders()
    await insert_machine_tasks()
    
    print("Data insertion completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())
