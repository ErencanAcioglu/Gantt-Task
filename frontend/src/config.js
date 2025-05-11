// Genel yapılandırma ayarları

// Supabase
export const SUPABASE_URL = 'https://lvyuwgonmtbqlftwamlc.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI';

// Backend API URL - Ortama göre değişir
const isProduction = import.meta.env.PROD; // Vite production modunu kontrol eder
export const BACKEND_API_URL = isProduction 
  ? 'https://gantt-task-backend.vercel.app' // Production backend URL (henüz mevcut değil)
  : 'http://localhost:8000'; // Development backend URL

// Uygulama ayarları
export const APP_SETTINGS = {
  defaultTimeRange: 72, // saat
  refreshInterval: 60000, // ms (1 dakika)
  dateFormat: 'DD.MM.YYYY HH:mm', // Tarih formatı
  highlightColor: '#FFFF00', // Vurgulama rengi
  defaultColor: '#4285F4', // Varsayılan renk
}; 