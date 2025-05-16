import { createClient } from '@supabase/supabase-js';
import { SAMPLE_MACHINE_TASKS } from './sampleData';

// Supabase URL ve API anahtarı
const supabaseUrl = 'https://lvyuwgonmtbqlftwamlc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI';

// Backend API URL - Backend'in çalışacağı port
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

// Supabase bağlantısını test et
console.log('Supabase bağlantısı kuruluyor:', supabaseUrl);
if (!supabaseKey) {
  console.error('Supabase anahtarı tanımlanmamış! Varsayılan değer kullanılacak.');
}

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// İş emirlerini getir
export const getWorkOrders = async () => {
  console.log('İş emirleri getiriliyor...');
  
  try {
    // Supabase'e bağlan
    const { data, error } = await supabase
      .from('workorders')
      .select('*');
    
    if (error) {
      console.error('İş emirleri getirilirken Supabase hatası:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('Supabase workorders tablosunda veri bulunamadı');
      throw new Error('İş emirleri bulunamadı');
    }
    
    console.log(`${data.length} adet iş emri getirildi:`, data);
    return data;
  } catch (err) {
    console.error('İş emirleri getirilirken beklenmeyen hata:', err);
    throw err;
  }
};

// Makine görevlerini getir - Backend API üzerinden
export const getMachineTasks = async () => {
  console.log('Makine görevleri Backend API üzerinden getiriliyor...');
  
  try {
    // Backend API'ye bağlan
    const response = await fetch(`${backendUrl}/tasks`);
    
    if (!response.ok) {
      console.error(`API hatası: ${response.status} ${response.statusText}`);
      console.log('Backend bağlantısı başarısız. Örnek veri kullanılıyor...');
      console.log(`${SAMPLE_MACHINE_TASKS.length} adet örnek görev yüklendi`);
      
      // Konsola örnek verilerdeki benzersiz makine listesini yazdır
      const uniqueMachines = {};
      SAMPLE_MACHINE_TASKS.forEach(task => {
        uniqueMachines[task.machine_name] = true;
      });
      console.log('Örnek verilerdeki makineler:', Object.keys(uniqueMachines));
      
      return SAMPLE_MACHINE_TASKS;
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn('API yanıtında veri bulunamadı, örnek veri kullanılıyor...');
      return SAMPLE_MACHINE_TASKS;
    }
    
    console.log(`${data.length} adet makine görevi getirildi`);
    return data;
  } catch (err) {
    console.error('Makine görevleri getirilirken beklenmeyen hata:', err);
    console.log('Hata nedeniyle örnek veri kullanılıyor...');
    return SAMPLE_MACHINE_TASKS;
  }
};

// İş emri numarasına göre görevleri getir
export const getTasksByOrderCode = async (orderCode) => {
  console.log(`"${orderCode}" iş emrine ait görevler getiriliyor...`);
  
  if (!orderCode) {
    console.error('İş emri kodu boş!');
    throw new Error('İş emri kodu belirtilmedi');
  }
  
  try {
    // Backend API'ye bağlan
    const response = await fetch(`${backendUrl}/highlight?order_code=${encodeURIComponent(orderCode)}`);
    
    if (!response.ok) {
      // 404 hatasını özel olarak ele al
      if (response.status === 404) {
        console.warn(`"${orderCode}" iş emri bulunamadı`);
        throw new Error(`"${orderCode}" iş emri bulunamadı`);
      }
      
      console.error(`API hatası: ${response.status} ${response.statusText}`);
      throw new Error(`API hatası: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.warn(`API yanıtında "${orderCode}" için veri bulunamadı`);
      throw new Error(`"${orderCode}" iş emri için görev bulunamadı`);
    }
    
    console.log(`${data.length} adet görev getirildi:`, data);
    return data;
  } catch (err) {
    console.error('Görevler getirilirken beklenmeyen hata:', err);
    throw err;
  }
}; 