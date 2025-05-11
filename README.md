# Gantt Chart Task Scheduler

Üretim planlama için Gantt Chart uygulaması - Supabase entegrasyonu ile.

## Deployment

### Frontend Deployment (Vercel)

1. Vercel CLI'ı yükleyin: `npm i -g vercel`
2. Frontend klasörüne gidin: `cd frontend`
3. Vercel'e deploy edin: `vercel` (ilk kez kullanıyorsanız Vercel hesabınızla giriş yapmanız istenecek)
4. Soruları takip edin, varsayılan değerleri kabul edebilirsiniz
5. Deploy sonrası size bir URL verilecek

### Backend Deployment (Vercel)

1. Backend klasörüne gidin: `cd backend`
2. Vercel'e deploy edin: `vercel` 
3. Soruları takip edin, varsayılan değerleri kabul edebilirsiniz
4. Deploy sonrası size bir URL verilecek
5. Bu URL'yi frontend/src/config.js içindeki `BACKEND_API_URL` değişkenine atayın
6. Frontend'i tekrar deploy edin

## Geliştirme

### Frontend Geliştirme

```bash
cd frontend
npm install
npm run dev
```

### Backend Geliştirme

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0
```

## Supabase Entegrasyonu

Uygulama, Supabase'deki machinetasks ve workorders tablolarını kullanır. Veriler Supabase'den çekilir ve grafik görünümünde gösterilir. 