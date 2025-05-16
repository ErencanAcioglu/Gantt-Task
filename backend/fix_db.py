#!/usr/bin/env python3
# fix_db.py - Script to fix the database structure for the Gantt chart

import asyncio
from dotenv import load_dotenv
import os
import httpx
from datetime import datetime, timedelta

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

# Work orders to create
WORK_ORDERS = [
    "MFG-1", "MFG-2", "MFG-3", "MFG-4", "MFG-5", 
    "MFG-6", "MFG-7", "MFG-8", "MFG-9", "MFG-10",
    "MFG-11", "MFG-12", "MFG-13", "MFG-14"
]

# Base date for the tasks
BASE_DATE = datetime(2024, 12, 18, 5, 0, 0)  # 2024-12-18 05:00:00

async def fix_database():
    """Fix the database by reloading with clean data structure."""
    print("Starting database fix...")
    
    async with httpx.AsyncClient() as client:
        print("Cleaning up and preparing fresh data...")
        
        # First, delete all existing machine tasks
        delete_tasks_res = await client.delete(
            f"{SUPABASE_URL}/rest/v1/machinetasks?id=not.is.null",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "return=minimal"
            }
        )
        
        if delete_tasks_res.status_code not in [200, 204]:
            print(f"Error deleting tasks: {delete_tasks_res.text}")
            return
        
        print("Successfully deleted all machine tasks.")
        
        # Delete all work orders to start fresh
        delete_work_orders_res = await client.delete(
            f"{SUPABASE_URL}/rest/v1/workorders?id=not.is.null",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Prefer": "return=minimal"
            }
        )
        
        if delete_work_orders_res.status_code not in [200, 204]:
            print(f"Error deleting work orders: {delete_work_orders_res.text}")
            return
        
        print("Successfully deleted all work orders.")
        
        # Create work orders first
        work_order_ids = {}
        for code in WORK_ORDERS:
            work_order_data = {
                "order_code": code,
                "customer_name": "ATLAS",
                "quantity": 100
            }
            
            wo_res = await client.post(
                f"{SUPABASE_URL}/rest/v1/workorders",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                },
                json=work_order_data
            )
            
            if wo_res.status_code != 201:
                print(f"Error creating work order {code}: {wo_res.text}")
                continue
            
            # Store the ID for reference when creating tasks
            work_order_ids[code] = wo_res.json()[0]["id"]
            print(f"Created work order {code} with ID {work_order_ids[code]}")
        
        print(f"Created {len(work_order_ids)} work orders")
        
        # Create machine tasks with correct structure
        tasks_created = 0
        
        # For each machine, create several tasks with different work orders
        for machine_idx, machine_name in enumerate(MACHINES):
            # Only use the first few work orders for each machine to avoid clutter
            for wo_idx, work_order_code in enumerate(WORK_ORDERS[:4]):
                # Skip if work order wasn't created successfully
                if work_order_code not in work_order_ids:
                    continue
                
                # Compute a staggered schedule
                hours_offset = (machine_idx * 2 + wo_idx) % 36  # Spread tasks over 36 hours
                
                task_data = {
                    "machine_name": machine_name,  # Ensure this is a proper machine name string
                    "work_order_id": work_order_ids[work_order_code],  # Use the actual work order ID
                    "start_time": (BASE_DATE + timedelta(hours=hours_offset)).strftime("%Y-%m-%d %H:%M:%S"),
                    "end_time": (BASE_DATE + timedelta(hours=hours_offset + 2)).strftime("%Y-%m-%d %H:%M:%S")
                }
                
                task_res = await client.post(
                    f"{SUPABASE_URL}/rest/v1/machinetasks",
                    headers={
                        "apikey": SUPABASE_KEY,
                        "Authorization": f"Bearer {SUPABASE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "return=representation"
                    },
                    json=task_data
                )
                
                if task_res.status_code != 201:
                    print(f"Error creating task: {task_res.text}")
                else:
                    tasks_created += 1
                    print(f"Created task #{tasks_created}: {machine_name} - {work_order_code}")
        
        print(f"Database fix completed. Created {tasks_created} machine tasks with correct structure.")
        
        # Verify the fix by checking a few records
        tasks_res = await client.get(
            f"{SUPABASE_URL}/rest/v1/machinetasks?select=*&limit=5",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
        )
        
        if tasks_res.status_code != 200:
            print(f"Error checking tasks: {tasks_res.text}")
            return
        
        sample_tasks = tasks_res.json()
        print("\nVerification - Sample tasks from database:")
        for idx, task in enumerate(sample_tasks):
            print(f"Task #{idx+1}: machine_name={task.get('machine_name')}, work_order_id={task.get('work_order_id')}")

async def main():
    """Main function to fix the database."""
    print("Starting database fix process...")
    await fix_database()
    print("Database fix process completed.")

if __name__ == "__main__":
    asyncio.run(main()) 