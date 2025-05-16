# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

load_dotenv()

app = FastAPI()

# CORS: Tüm bağlantılara izin ver (geliştirme ortamı için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tüm kökenlere izin ver
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Doğru URL ve anahtar
SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://lvyuwgonmtbqlftwamlc.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_API_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI"

# Print the Supabase URL and credentials at startup for debugging
print(f"Starting with Supabase URL: {SUPABASE_URL}")
print(f"API Key length: {len(SUPABASE_KEY) if SUPABASE_KEY else 0}")

# Vercel için lambda handler
async def handler(request, context):
    return await app(request, context)

@app.get("/")
async def root():
    return {"message": "Gantt Chart API çalışıyor"}

@app.get("/tasks")
async def get_tasks():
    """Tüm makine görevlerini getir - workorders ile birleştirilmiş"""
    print("Tüm makine görevleri getiriliyor...")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase bilgileri eksik")
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Önce workorders tablosunu çekelim
            work_orders_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/workorders?select=*",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            
            if work_orders_res.status_code != 200:
                raise HTTPException(
                    status_code=work_orders_res.status_code, 
                    detail=f"Supabase workorders hatası: {work_orders_res.text}"
                )
            
            work_orders = work_orders_res.json()
            print(f"Found {len(work_orders)} work orders")
            
            # 2. Makine görevlerini çekelim
            machine_tasks_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/machinetasks?select=*",
                headers={
                    "apikey": SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}"
                }
            )
            
            if machine_tasks_res.status_code != 200:
                raise HTTPException(
                    status_code=machine_tasks_res.status_code, 
                    detail=f"Supabase machinetasks hatası: {machine_tasks_res.text}"
                )
            
            machine_tasks = machine_tasks_res.json()
            print(f"Found {len(machine_tasks)} machine tasks")
            
            # 3. İş emirleri için bir sözlük oluşturalım
            work_orders_dict = {wo["id"]: wo for wo in work_orders}
            
            # 4. Her makine görevine iş emri bilgilerini ekleyelim
            enriched_tasks = []
            for task in machine_tasks:
                work_order_id = task.get("work_order_id")
                work_order = work_orders_dict.get(work_order_id, {})
                
                # Zenginleştirilmiş görev verisini oluştur
                enriched_task = {
                    **task,
                    "order_code": work_order.get("order_code", "Bilinmeyen"),
                    "customer_name": work_order.get("customer_name", "ATLAS")
                }
                
                # Debug info
                print(f"Enriched task: machine_name={enriched_task.get('machine_name')}, order_code={enriched_task.get('order_code')}")
                
                enriched_tasks.append(enriched_task)
            
            # Makine adına göre sırala - Bu Y ekseni görünümünü iyileştirecek
            enriched_tasks = sorted(enriched_tasks, key=lambda x: x.get("machine_name", ""))
            
            print(f"{len(enriched_tasks)} adet makine görevi bulundu.")
            
            # Check a couple of records for debugging
            if enriched_tasks and len(enriched_tasks) > 0:
                print(f"Sample task: {enriched_tasks[0]}")
            
            if not enriched_tasks or len(enriched_tasks) == 0:
                raise HTTPException(
                    status_code=404,
                    detail="Makine görevi bulunamadı"
                )
            
            return JSONResponse(content=enriched_tasks)
            
        except Exception as e:
            print(f"Veri çekme hatası: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Veri çekme hatası: {str(e)}"
            )

@app.get("/highlight")
async def highlight(order_code: str):
    print(f"İş emri aranıyor: {order_code}")
    print(f"Supabase URL: {SUPABASE_URL}")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase bilgileri eksik")
    
    async with httpx.AsyncClient() as client:
        # 1. İş emrini bul - küçük harflerle tablo isimlerini deniyoruz
        res = await client.get(
            f"{SUPABASE_URL}/rest/v1/workorders?order_code=eq.{order_code}",
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}"
            }
        )
        
        orders = res.json()
        print(f"Supabase yanıtı: {orders}")
        
        if not orders or len(orders) == 0:
            # Eğer orders boşsa, veri tabanında kayıt olmayabilir
            # Doğrudan machinetasks'ten order_code'a göre veri çekelim
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
                    detail=f"'{order_code}' numaralı iş emri bulunamadı."
                )
            
            return tasks
            
        # Normal akış - orders[0]["id"] bulunduysa
        try:
            if not orders or len(orders) == 0:
                raise KeyError("orders is empty")
                
            work_order_id = orders[0]["id"]
            
            # 2. İlgili görevleri getir
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
                    detail=f"'{order_code}' numaralı iş emri için görev bulunamadı."
                )
            
            # Ekstra bilgileri ekle
            enriched_tasks = [{
                **task,
                "order_code": order_code,
                "customer_name": orders[0].get("customer_name", "ATLAS")
            } for task in tasks]
            
            return enriched_tasks
        except (KeyError, IndexError) as e:
            # Eğer id bulunamadıysa, doğrudan order_code ile arayalım
            print(f"Hata: {e}, orders: {orders}")
            
            # orders içinde id yerine order_code kullanmayı deneyelim
            try:
                if orders and len(orders) > 0 and "order_code" in orders[0]:
                    task_res = await client.get(
                        f"{SUPABASE_URL}/rest/v1/machinetasks?work_order_id=eq.{orders[0]['order_code']}",
                        headers={
                            "apikey": SUPABASE_KEY,
                            "Authorization": f"Bearer {SUPABASE_KEY}"
                        }
                    )
                    tasks = task_res.json()
                    
                    if not tasks or len(tasks) == 0:
                        raise HTTPException(
                            status_code=404, 
                            detail=f"'{order_code}' numaralı iş emri için görev bulunamadı."
                        )
                    
                    return tasks
            except (KeyError, IndexError):
                pass
            
            # Son çare: doğrudan order_code'u kullanmayı deneyelim
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
                    detail=f"'{order_code}' numaralı iş emri bulunamadı."
                )
            
            return tasks

@app.get("/api/gantt-data")
async def gantt_data():
    return await get_tasks()
