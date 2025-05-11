import { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import { getMachineTasks, getWorkOrders } from '../services/supabase';
import moment from 'moment';
import 'moment/locale/tr';

// Türkçe yerelleştirme
moment.locale('tr');

// Tarih kontrolü için yardımcı fonksiyon
const safeDateConversion = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Önce moment ile deneyelim
    const momentDate = moment(dateStr);
    if (momentDate.isValid()) {
      return momentDate.toDate();
    }
    
    // Moment başarısız olursa doğrudan Date ile deneyelim
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error(`Geçersiz tarih: ${dateStr}`);
      // Fallback olarak şimdiki zamanı dön
      return new Date();
    }
    return date;
  } catch (error) {
    console.error(`Tarih dönüşüm hatası: ${dateStr}`, error);
    return new Date(); // Hata durumunda şimdiki zamanı dön
  }
};

// Tarih formatla - örnekteki gibi formatlama
const formatDate = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// Kısa tarih formatı - örnekteki gibi
const formatShortDate = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm');
};

// Gantt Chart için veri formatı oluşturma
const formatDataForGantt = (machineTasks, highlightedOrderCode = null) => {
  console.log('formatDataForGantt başlatıldı:', machineTasks?.length, 'görev');
  
  // Header satırı
  const data = [
    [
      { type: 'string', label: 'Machine' },
      { type: 'string', label: 'Task ID' },
      { type: 'date', label: 'Start Date' },
      { type: 'date', label: 'End Date' },
      { type: 'number', label: 'Duration' },
      { type: 'number', label: 'Percent Complete' },
      { type: 'string', label: 'Dependencies' },
      { type: 'string', label: 'Resource' }, // Renk kontrolü için
      { type: 'string', role: 'tooltip', p: { html: true } }, // HTML tooltip
    ],
  ];

  // Veri yoksa sadece header'ı döndür
  if (!machineTasks || !machineTasks.length) {
    console.warn('Gantt Chart için veri bulunamadı');
    return data;
  }

  // İş emrini vurgulamak için renkler belirle - fotoğraftaki gibi
  const colors = {
    highlighted: '#FFFF00', // Vurgulanan (sarı)
    normal: '#4285F4',      // Normal (mavi)
    inProgress: '#FF9900',  // İşlem devam ediyor (turuncu)
  };

  // Makine görevi verilerini ekle
  machineTasks.forEach((task, index) => {
    if (!task) return; // Task null/undefined kontrolü
    
    // Gerekli alanlar var mı kontrol et
    if (!task.machine_name) {
      console.warn(`#${index} ID'li görevde makine adı yok`, task);
      return;
    }
    
    // Tarihleri güvenli şekilde dönüştür
    const startTime = safeDateConversion(task.start_time);
    const endTime = safeDateConversion(task.end_time);
    
    if (!startTime || !endTime) {
      console.warn(`#${index} ID'li görevde geçersiz tarihler`, task);
      return;
    }
    
    // İş emrinin durumuna göre renk belirle
    const isHighlighted = task.work_order_id === highlightedOrderCode;
    const isInProgress = new Date() >= startTime && new Date() <= endTime;
    
    let barColor;
    if (isHighlighted) {
      barColor = colors.highlighted;
    } else if (isInProgress) {
      barColor = colors.inProgress;
    } else {
      barColor = colors.normal;
    }
    
    // Task ID'nin benzersiz olması için index ekle
    const taskId = `${task.machine_name}_${index}`;
    
    // HTML tooltip içeriği - fotoğraftaki gibi
    const tooltipHtml = `
      <div style="padding: 10px; background: #333; color: white; border-radius: 5px; font-size: 12px; max-width: 300px;">
        <div style="margin-bottom: 5px; font-weight: bold; color: #fff; border-bottom: 1px solid #555; padding-bottom: 5px;">
          Machine: ${task.machine_name}
        </div>
        <div style="margin: 4px 0"><strong>Start:</strong> ${formatDate(startTime)}</div>
        <div style="margin: 4px 0"><strong>End:</strong> ${formatDate(endTime)}</div>
        <div style="margin: 4px 0"><strong>Work Order:</strong> ${task.work_order_id || 'N/A'}</div>
        ${task.customer ? `<div style="margin: 4px 0"><strong>Customer:</strong> ${task.customer}</div>` : ''}
      </div>
    `;
    
    data.push([
      task.machine_name || 'Bilinmeyen Makine',  // Makine adı
      taskId,                                    // Task ID (benzersiz)
      startTime,                                 // Başlangıç zamanı
      endTime,                                   // Bitiş zamanı
      null,                                      // Süre (otomatik hesaplanacak)
      100,                                       // Tamamlanma yüzdesi
      null,                                      // Bağımlılıklar
      barColor,                                  // Renk
      tooltipHtml,                               // Tooltip
    ]);
  });

  console.log('formatDataForGantt tamamlandı:', data.length, 'satır');
  return data;
};

const GanttChart = ({ highlightedOrderCode }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: moment().subtract(12, 'hours').toDate(),
    end: moment().add(36, 'hours').toDate()
  });

  // Google Charts hazır olduğunda algıla
  useEffect(() => {
    if (window.googleChartsLoaded) {
      console.log('Google Charts zaten yüklenmiş, hazır!');
      setGoogleReady(true);
    } else {
      // Periyodik olarak kontrol et
      const checkInterval = setInterval(() => {
        if (window.googleChartsLoaded) {
          console.log('Google Charts hazır hale geldi!');
          setGoogleReady(true);
          clearInterval(checkInterval);
        }
      }, 500);
      
      // Uzun süre geçerse timeout
      setTimeout(() => {
        if (!window.googleChartsLoaded) {
          console.error('Google Charts yüklenemedi - timeout');
          setChartError(true);
          clearInterval(checkInterval);
        }
      }, 10000);
      
      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Veri çekme işlemi başlatılıyor...');
        setLoading(true);
        setError(null);
        setChartError(false);
        
        console.log('Makine görevleri alınıyor...');
        let tasks;
        
        try {
          console.log('getMachineTasks() çağrılıyor...');
          tasks = await getMachineTasks();
          console.log('Alınan görevler:', tasks?.length || 0, 'adet');
          
          if (!tasks || tasks.length === 0) {
            throw new Error('Hiç görev verisi dönmedi');
          }
        } catch (err) {
          console.error('Veri getirme hatası:', err);
          setError(`Supabase'den veri alınamadı: ${err.message}`);
          return;
        }
        
        // Veri formatını kontrol et
        if (!tasks || !Array.isArray(tasks)) {
          console.error('Makine görevleri array formatında değil:', typeof tasks);
          setError('Makine görevleri uygun formatta değil');
          return;
        }
        
        if (tasks.length === 0) {
          console.warn('Makine görevi bulunamadı');
          setError('Görüntülenecek makine görevi bulunamadı');
          return;
        }
        
        console.log('Gantt Chart için veriler formatlanıyor...');
        const formattedData = formatDataForGantt(tasks, highlightedOrderCode);
        console.log('Formatlanan veriler:', formattedData?.length || 0, 'satır');
        setChartData(formattedData);

        // Veri aralığını ayarla
        if (tasks.length > 1) {
          let minDate = moment(tasks[0].start_time);
          let maxDate = moment(tasks[0].end_time);

          tasks.forEach(task => {
            const startMoment = moment(task.start_time);
            const endMoment = moment(task.end_time);
            
            if (startMoment.isValid() && startMoment.isBefore(minDate)) {
              minDate = startMoment;
            }
            
            if (endMoment.isValid() && endMoment.isAfter(maxDate)) {
              maxDate = endMoment;
            }
          });

          // Biraz kenar boşluğu ekleyelim
          setDateRange({
            start: minDate.subtract(4, 'hours').toDate(), // More margin for better timeline visibility
            end: maxDate.add(4, 'hours').toDate()         // More margin for better timeline visibility
          });
        }
      } catch (err) {
        console.error('Veri işleme hatası:', err);
        setError('Veriler işlenirken bir hata oluştu: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [highlightedOrderCode]);

  if (loading) {
    return (
      <div className="gantt-container">
        <h2 className="gantt-title">
          Production Gantt Chart {highlightedOrderCode ? `(Highlighted Work Orders: ${highlightedOrderCode})` : ''}
        </h2>
        <div className="loading-spinner">
          <div className="spinner-content">
            <div className="spinner-animation"></div>
            <div>Gantt Chart Verisi Yükleniyor...</div>
            <div className="spinner-details">Supabase'den veriler alınıyor</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Veri yok ve hata varsa sonuç döndür
  if (error) {
    console.error('Hata durumu:', error);
    return <div className="error-message">Hata: {error}</div>;
  }

  // Chart verisini kontrol et
  if (!chartData || chartData.length <= 1) {
    console.warn('Görüntülenecek veri yok veya sadece header var:', chartData);
    return <div className="no-data-message">Görüntülenecek veri yok.</div>;
  }

  // Google Charts başarısız olduysa veri listesi göster
  if (chartError) {
    return (
      <div className="gantt-container">
        <h2 className="gantt-title">
          Production Gantt Chart {highlightedOrderCode ? `(Highlighted Work Orders: ${highlightedOrderCode})` : ''}
        </h2>
        
        <div className="error-message">
          <p>Google Charts bileşeni yüklenemedi. Basit liste görünümü gösteriliyor.</p>
          <p>Tarayıcınızı yenilemeyi veya farklı bir tarayıcı kullanmayı deneyebilirsiniz.</p>
        </div>
        
        <div className="time-axis-simple">
          <span>Zaman Aralığı: {formatShortDate(dateRange.start)} - {formatShortDate(dateRange.end)}</span>
        </div>
        
        <div className="machine-list">
          {chartData.slice(1).map((row, index) => {
            const isHighlighted = row[7] === '#FFFF00';
            const inProgress = new Date() >= row[2] && new Date() <= row[3];
            
            return (
              <div 
                key={index} 
                className={`machine-item ${isHighlighted ? 'highlighted' : ''} ${inProgress ? 'in-progress' : ''}`}
                style={{
                  backgroundColor: row[7] || '#4285F4',
                  borderLeft: isHighlighted ? '4px solid #FF9900' : 'none',
                  marginBottom: '8px',
                  padding: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}
              >
                <div className="machine-name" style={{fontWeight: 'bold', marginBottom: '8px'}}>{row[0]}</div>
                <div className="time-range" style={{fontSize: '0.9em'}}>
                  {row[2] && row[3] ? 
                    `${formatShortDate(row[2])} - ${formatShortDate(row[3])}` : 
                    'Zaman bilgisi yok'}
                </div>
                <div style={{marginTop: '4px', fontSize: '0.9em'}}>
                  Sipariş: {chartData[0][0] || 'Bilinmiyor'}
                </div>
                {isHighlighted && <span className="highlight-badge" style={{
                  display: 'inline-block',
                  backgroundColor: '#FF9900',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  marginTop: '8px'
                }}>Vurgulanan İş Emri</span>}
                {inProgress && <span className="progress-badge" style={{
                  display: 'inline-block',
                  backgroundColor: '#00C853',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  marginTop: '8px',
                  marginLeft: isHighlighted ? '8px' : '0'
                }}>Devam Ediyor</span>}
              </div>
            );
          })}
        </div>
        
        <div className="time-range-display">
          <span>Time Range: {formatShortDate(dateRange.start)} to {formatShortDate(dateRange.end)}</span>
        </div>
      </div>
    );
  }

  // Ekranda gösterilecek zaman aralığı metni - fotoğraftaki gibi
  const timeRangeText = `${formatShortDate(dateRange.start)} - ${formatShortDate(dateRange.end)}`;
  
  console.log('Chart verisi hazırlandı, toplam:', chartData.length, 'satır');
  console.log('İlk satır (header):', chartData[0]);
  console.log('İkinci satır (örnek veri):', chartData.length > 1 ? chartData[1] : 'Veri yok');

  // Veri ve ayarlar hazır olduğundan emin ol
  const isDataReady = chartData && chartData.length > 1 && !loading;

  return (
    <div className="gantt-container">
      <h2 className="gantt-title">
        Production Gantt Chart {highlightedOrderCode ? `(Highlighted Work Orders: ${highlightedOrderCode})` : ''}
      </h2>
      
      {/* Custom Time Axis */}
      <div className="custom-time-axis">
        <div className="time-label">Time:</div>
        <div className="time-scale">
          {/* Generate time labels dynamically */}
          {Array.from({ length: 7 }, (_, i) => {
            const timePoint = moment(dateRange.start).add(i * 6, 'hours');
            return (
              <div key={i} className="time-point">
                {timePoint.format('YYYY-MM-DD HH:mm')}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="chart-wrapper">
        {isDataReady ? (
          <div className="simple-gantt">
            <h3>Makine Görev Listesi</h3>
            <div className="machine-list">
              {chartData.slice(1).map((row, index) => {
                const isHighlighted = row[7] === '#FFFF00';
                const inProgress = new Date() >= row[2] && new Date() <= row[3];
                
                return (
                  <div 
                    key={index} 
                    className={`machine-item ${isHighlighted ? 'highlighted' : ''} ${inProgress ? 'in-progress' : ''}`}
                    style={{
                      backgroundColor: row[7] || '#4285F4',
                      borderLeft: isHighlighted ? '4px solid #FF9900' : 'none',
                      marginBottom: '12px',
                      padding: '16px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
                    }}
                  >
                    <div className="machine-name" style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '10px'}}>{row[0]}</div>
                    <div className="time-range" style={{marginBottom: '8px'}}>
                      <strong>Zaman:</strong> {row[2] && row[3] ? 
                        `${formatShortDate(row[2])} - ${formatShortDate(row[3])}` : 
                        'Zaman bilgisi yok'}
                    </div>
                    <div className="order-info" style={{marginBottom: '6px'}}>
                      <strong>İş Emri:</strong> {row[0].split('_')[0] || 'Bilinmiyor'}
                    </div>
                    {isHighlighted && <span className="highlight-badge" style={{
                      display: 'inline-block',
                      backgroundColor: '#FF9900',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginRight: '6px'
                    }}>Vurgulanan İş Emri</span>}
                    {inProgress && <span className="progress-badge" style={{
                      display: 'inline-block',
                      backgroundColor: '#00C853',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>Devam Ediyor</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="loading-spinner">
            {loading ? "Veri yükleniyor..." : "Grafik hazırlanıyor..."}
          </div>
        )}
      </div>
      
      {/* Time range display at the bottom */}
      <div className="time-range-display">
        <span>Time Range: {formatShortDate(dateRange.start)} to {formatShortDate(dateRange.end)}</span>
      </div>
    </div>
  );
};

export default GanttChart; 