## Canlı Demo

[Canlı Gantt Chart Uygulaması](https://gantt-task-front.vercel.app/)

---

## Projeyi Başlatma

### 1. Gerekli Bağımlılıkları Kur

Hem backend hem frontend için bağımlılıkları yükle:

```bash
cd backend
pip install -r requirements.txt

cd ../frontend
npm install
```

### 2. Backend'i Başlat

Backend dizinine geçip FastAPI sunucusunu başlat:

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 5001
```


### 3. Frontend'i Başlat

Frontend dizinine geçip Vite ile React uygulamasını başlat:

```bash
cd frontend
npm run dev
```

> Uygulama genellikle [http://localhost:5173](http://localhost:5173) adresinde açılır.

### 4. Kullanım

- Sol taraftaki arama kutusuna iş emri kodu (örn. `MFG-5`) girip "Ara"ya basarak ilgili iş emrini sarı renkte vurgulayabilirsin.
- Tüm makineler ve iş emirleri eksiksiz olarak Gantt chart üzerinde gösterilir.
- Barların üzerine gelince detaylı tooltip görünür.

---

## Ek Bilgiler

- Backend FastAPI + Supabase, frontend React + Plotly ile geliştirilmiştir.
- Canlı demo için: [https://gantt-task-front.vercel.app/](https://gantt-task-front.vercel.app/) 
