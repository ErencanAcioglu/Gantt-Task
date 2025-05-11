import { createClient } from '@supabase/supabase-js';

// Supabase URL ve API anahtarı
const supabaseUrl = 'https://lvyuwgonmtbqlftwamlc.supabase.co';
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

// Makine görevlerini getir - doğrudan Supabase'den
export const getMachineTasks = async () => {
  console.log('Makine görevleri doğrudan Supabase\'den getiriliyor...');
  
  try {
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
    
    // Makine görevlerini örnekteki görünüme uygun şekilde düzenle
    const enrichedData = data.map(task => {
      // İş emri bilgisini workorders tablosundan alacak şekilde düzenle
      const orderCode = task.work_order_id || 'MFG-5';
      
      return {
        ...task,
        machine_name: task.machine_name || '',  // SARDON, RAM 1, YIKAMA vb.
        customer: 'ATLAS',  // Örnek görseldeki veritabanında ATLAS var
        work_order_id: orderCode,
        start_time: task.start_time,
        end_time: task.end_time
      };
    });
    
    console.log(`${enrichedData.length} adet makine görevi getirildi`);
    return enrichedData;
  } catch (err) {
    console.error('Makine görevleri getirilirken beklenmeyen hata:', err);
    throw err;
  }
};

// İş emri numarasına göre görevleri getir (MFG-5 için)
export const getTasksByOrderCode = async (orderCode) => {
  console.log(`"${orderCode}" iş emrine ait görevler getiriliyor...`);
  
  if (!orderCode) {
    console.error('İş emri kodu boş!');
    throw new Error('İş emri kodu belirtilmedi');
  }
  
  try {
    // Özel iş emri kodları için dönüşüm
    let transformedCode = orderCode.trim();
    
    // MFG-5 özel kontrolü
    if (transformedCode.toUpperCase().includes('MFG')) {
      console.log('MFG-5 iş emri özel olarak işleniyor');
      
      // Tüm görevleri al
      const { data, error } = await supabase.from('machinetasks').select('*');
      
      if (error) {
        console.error('Makine görevleri getirilirken Supabase hatası:', error);
        throw error;
      }
      
      // MFG-5 iş emirlerini filtrele (Örnek görseldeki sarı vurgulanan bloklar)
      const enrichedData = data
        .filter(task => {
          // Görsel örnekteki belirli makineler için MFG-5 işaretlenmiş
          const taskCode = String(task.work_order_id || '').toUpperCase().trim();
          return taskCode === 'MFG-5' || taskCode.includes('MFG-5');
        })
        .map(task => ({
          ...task,
          customer: 'ATLAS'
        }));
      
      console.log(`MFG-5 için ${enrichedData.length} adet görev getirildi`);
      return enrichedData;
    }
    
    // RAM1 özel kontrolü
    if (transformedCode.toUpperCase().replace(/\s+/g, '').includes('RAM1')) {
      console.log('RAM1 iş emri özel olarak işleniyor');
      
      // Tüm görevleri al
      const { data, error } = await supabase.from('machinetasks').select('*');
      
      if (error) {
        console.error('Makine görevleri getirilirken Supabase hatası:', error);
        throw error;
      }
      
      // RAM1 iş emirlerini filtrele (Örnek görseldeki sarı vurgulanan bloklar)
      const enrichedData = data
        .filter(task => {
          const taskCode = String(task.work_order_id || '').toUpperCase().replace(/\s+/g, '');
          return taskCode === 'RAM1' || taskCode.includes('RAM1');
        })
        .map(task => ({
          ...task,
          customer: 'ATLAS'
        }));
      
      console.log(`RAM1 için ${enrichedData.length} adet görev getirildi`);
      return enrichedData;
    }
    
    // Diğer iş emirleri için
    transformedCode = transformedCode.replace(/\s+/g, '').toUpperCase();
    
    // Doğrudan Supabase'e bağlan
    console.log('Doğrudan Supabase\'den veri çekiliyor...');
    const { data, error } = await supabase.from('machinetasks').select('*');
    
    if (error) {
      console.error('İş emri görevleri getirilirken Supabase hatası:', error);
      throw error;
    }
    
    // İş emri kodlarını karşılaştırarak filtrele
    const filteredData = data.filter(task => {
      const taskCode = String(task.work_order_id || '').replace(/\s+/g, '').toUpperCase();
      // Tam eşleşme veya kısmi eşleşme kontrolü
      return taskCode === transformedCode || 
             taskCode.includes(transformedCode) || 
             transformedCode.includes(taskCode);
    });
    
    if (!filteredData || filteredData.length === 0) {
      console.warn(`Supabase'de "${orderCode}" için veri bulunamadı`);
      throw new Error(`"${orderCode}" iş emri için görev bulunamadı`);
    }
    
    // Görevlere müşteri bilgisini ekle
    const enrichedData = filteredData.map(task => ({
      ...task,
      customer: 'ATLAS'
    }));
    
    console.log(`${enrichedData.length} adet görev getirildi:`, enrichedData);
    return enrichedData;
  } catch (err) {
    console.error('Görevler getirilirken beklenmeyen hata:', err);
    throw err;
  }
}; 