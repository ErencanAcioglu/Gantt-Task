import { createClient } from '@supabase/supabase-js';

// Supabase URL ve API anahtarı - make sure there's no typing error
const supabaseUrl = 'https://lvyuwgonmtbqlftwamlc.supabase.co';
// Anahtar güncellendi
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2eXV3Z29ubXRicWxmdHdhbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NjExNjUsImV4cCI6MjA2MjUzNzE2NX0.Xm5Q68KUYOrGXQqz9PjnxI9myQDktF045G_17t1v-vI';

// Backend API URL - Backend'in çalışacağı port
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Supabase bağlantısını test et
console.log('Supabase bağlantısı kuruluyor:', supabaseUrl);
if (!supabaseKey) {
  console.error('Supabase anahtarı tanımlanmamış! Varsayılan değer kullanılacak.');
}

// Supabase client'ı oluştur
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Bugün için tarih oluştur
const today = new Date();
const formatDate = (date) => {
  return date.toISOString().split('.')[0];
};

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

// Makine görevlerini getir
export const getMachineTasks = async () => {
  console.log('Makine görevleri getiriliyor...');
  
  try {
    // Doğrudan backend API'yi dene
    console.log('Backend API çağrılıyor:', `${backendUrl}/tasks`);
    const response = await fetch(`${backendUrl}/tasks`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });
    
    console.log('Backend yanıtı alındı, durum kodu:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`Backend API'den ${data?.length || 0} görev getirildi`);
      return data;
    } else {
      console.warn(`Backend API yanıt kodu: ${response.status}`);
      console.warn('Backend API mesajı:', await response.text());
    }
    
    // Backend API başarısız olursa, Supabase'e doğrudan bağlan
    console.log('Backend API yanıt vermedi, doğrudan Supabase kullanılıyor...');
    const { data, error } = await supabase
      .from('machinetasks')
      .select('*');
    
    if (error) {
      console.error('Makine görevleri getirilirken Supabase hatası:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('Supabase machinetasks tablosunda veri bulunamadı');
      throw new Error('Makine görevleri bulunamadı');
    }
    
    console.log(`${data.length} adet makine görevi getirildi:`, data);
    return data;
  } catch (err) {
    console.error('Makine görevleri getirilirken beklenmeyen hata:', err);
    throw err;
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
    // Önce backend API üzerinden dene
    console.log(`Backend API URL: ${backendUrl}/highlight?order_code=${orderCode}`);
    
    try {
      const response = await fetch(`${backendUrl}/highlight?order_code=${orderCode}`);
      
      console.log('Backend yanıtı:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Backend API'den ${data?.length || 0} görev getirildi:`, data);
        
        if (!data || data.length === 0) {
          console.warn(`Backend API'den "${orderCode}" için veri bulunamadı`);
          throw new Error(`"${orderCode}" iş emri için görev bulunamadı`);
        }
        
        return data;
      } else {
        console.warn(`Backend API hatası: ${response.status}`);
        throw new Error(`Backend API hatası: ${response.status}`);
      }
    } catch (err) {
      console.warn(`Backend API ile iletişim kurulamadı: ${err.message}`);
      
      // Doğrudan Supabase'e bağlan
      console.log('Doğrudan Supabase kullanılıyor...');
      const { data, error } = await supabase
        .from('machinetasks')
        .select('*')
        .eq('work_order_id', orderCode);
      
      if (error) {
        console.error('İş emri görevleri getirilirken Supabase hatası:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.warn(`Supabase'de "${orderCode}" için veri bulunamadı`);
        throw new Error(`"${orderCode}" iş emri için görev bulunamadı`);
      }
      
      console.log(`${data.length} adet görev getirildi:`, data);
      return data;
    }
  } catch (err) {
    console.error('Görevler getirilirken beklenmeyen hata:', err);
    throw err;
  }
}; 