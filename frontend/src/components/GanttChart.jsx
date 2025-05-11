import { useState, useEffect } from 'react';
import { getMachineTasks } from '../services/supabase';
import moment from 'moment';
import 'moment/locale/tr';
import ChartFrame from './ChartFrame';

// Türkçe yerelleştirme
moment.locale('tr');

// Tarih kontrolü için yardımcı fonksiyon
const safeDateConversion = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    const momentDate = moment(dateStr);
    if (momentDate.isValid()) {
      return momentDate.toDate();
    }
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error(`Geçersiz tarih: ${dateStr}`);
      return new Date();
    }
    return date;
  } catch (error) {
    console.error(`Tarih dönüşüm hatası: ${dateStr}`, error);
    return new Date();
  }
};

// Tarih formatla
const formatDate = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

// Kısa tarih formatı
const formatShortDate = (date) => {
  if (!date) return '';
  return moment(date).format('YYYY-MM-DD HH:mm');
};

// Gantt Chart için veri formatı oluşturma
const formatDataForGantt = (machineTasks, highlightedOrderCode = null) => {
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

  if (!machineTasks || !machineTasks.length) {
    return data;
  }

  // Renk ayarları
  const colors = {
    highlighted: '#FFFF00', // Daha parlak sarı renk
    normal: '#4285F4',      // Normal (mavi)
    inProgress: '#FF9900',  // İşlem devam ediyor (turuncu)
  };

  // Makine görevi verilerini ekle
  machineTasks.forEach((task, index) => {
    if (!task) return;
    if (!task.machine_name) return;
    
    // Tarihleri güvenli şekilde dönüştür
    const startTime = safeDateConversion(task.start_time);
    const endTime = safeDateConversion(task.end_time);
    
    if (!startTime || !endTime) return;
    
    // İş emrinin durumuna göre renk belirle
    const normalizeForComparison = (code) => {
      if (!code) return '';
      // Boşlukları kaldır, büyük harfe çevir
      return String(code).replace(/\s+/g, '').toUpperCase();
    };
    
    // Doğrudan MFG-5 kontrolü yapalım
    const taskWorkOrderNormalized = normalizeForComparison(task.work_order_id);
    const highlightedOrderCodeNormalized = normalizeForComparison(highlightedOrderCode);
    
    // Direkt karşılaştırma yapalım
    let isHighlighted = false;
    
    // Eğer MFG-5 aranıyorsa - örnek görselde bu var
    if (highlightedOrderCodeNormalized === 'MFG-5' && 
        (taskWorkOrderNormalized === 'MFG-5' || taskWorkOrderNormalized.includes('MFG-5'))) {
      isHighlighted = true;
      console.log(`MFG-5 özel eşleşme: ${task.work_order_id}`);
    }
    // Eğer RAM1 ya da RAM 1 aranıyorsa
    else if (highlightedOrderCodeNormalized === 'RAM1' && 
        (taskWorkOrderNormalized === 'RAM1' || taskWorkOrderNormalized.includes('RAM1'))) {
      isHighlighted = true;
      console.log(`RAM1 özel eşleşme: ${task.work_order_id}`);
    }
    // Diğer durumlarda normal eşleşme kontrolü
    else if (highlightedOrderCode && 
       (taskWorkOrderNormalized === highlightedOrderCodeNormalized ||
        taskWorkOrderNormalized.includes(highlightedOrderCodeNormalized) ||
        highlightedOrderCodeNormalized.includes(taskWorkOrderNormalized))) {
      isHighlighted = true;
      console.log(`Eşleşme: ${task.work_order_id} - ${highlightedOrderCode}`);
    }
    
    // İş devam ediyor mu kontrolü
    const isInProgress = new Date() >= startTime && new Date() <= endTime;
    
    // Renk seçimi
    let barColor = colors.normal;
    if (isHighlighted) {
      barColor = colors.highlighted; // Sarı renk
      console.log(`İş emri vurgulandı: ${task.work_order_id} (${highlightedOrderCode}) - Renk: ${barColor}`);
    } else if (isInProgress) {
      barColor = colors.inProgress;
    }
    
    // Task ID'nin benzersiz olması için index ekle
    const taskId = `${task.machine_name}_${index}`;
    
    // HTML tooltip içeriği - örnekteki tooltip'e göre düzenlendi
    const tooltipHtml = `
      <div style="padding: 10px; background: #333; color: white; border-radius: 5px; font-size: 12px; max-width: 300px;">
        <div style="margin-bottom: 5px; font-weight: bold; color: #fff; border-bottom: 1px solid #555; padding-bottom: 5px;">
          Machine: ${task.machine_name}
        </div>
        <div style="margin: 4px 0"><strong>Start:</strong> ${formatDate(startTime)}</div>
        <div style="margin: 4px 0"><strong>End:</strong> ${formatDate(endTime)}</div>
        <div style="margin: 4px 0"><strong>Work Order:</strong> ${task.work_order_id || ''}</div>
        <div style="margin: 4px 0"><strong>Customer:</strong> ${task.customer || 'ATLAS'}</div>
      </div>
    `;
    
    data.push([
      task.machine_name,  // Makine adı
      taskId,             // Task ID (benzersiz)
      startTime,          // Başlangıç zamanı
      endTime,            // Bitiş zamanı
      null,               // Süre (otomatik hesaplanacak)
      100,                // Tamamlanma yüzdesi
      null,               // Bağımlılıklar
      barColor,           // Renk
      tooltipHtml,        // Tooltip
    ]);
  });

  return data;
};

const GanttChart = ({ highlightedOrderCode }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: moment().subtract(12, 'hours').toDate(),
    end: moment().add(36, 'hours').toDate()
  });

  // Veri yükleme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const tasks = await getMachineTasks();
          
          if (!tasks || tasks.length === 0) {
          throw new Error('Görev verisi bulunamadı');
        }
        
        // Veriyi Gantt Chart formatına dönüştür
        const formattedData = formatDataForGantt(tasks, highlightedOrderCode);
        setChartData(formattedData);

        // Tarih aralığını ayarla
        if (tasks.length > 1) {
          let minDate = moment(tasks[0].start_time).subtract(4, 'hours');
          let maxDate = moment(tasks[0].end_time).add(4, 'hours');

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

          setDateRange({
            start: minDate.subtract(4, 'hours').toDate(),
            end: maxDate.add(4, 'hours').toDate()
          });
        }
      } catch (err) {
        console.error('Veri yükleme hatası:', err);
        setError(err.message || 'Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [highlightedOrderCode]);

  // Yükleniyor durumu
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
          </div>
        </div>
      </div>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <div className="gantt-error">
        <h3>Hata oluştu!</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Sayfayı Yenile</button>
      </div>
    );
  }

  // Alternatif liste görünümü
  const renderAlternativeView = () => {
  if (!chartData || chartData.length <= 1) {
    return <div className="no-data-message">Görüntülenecek veri yok.</div>;
  }

    return (
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
                borderLeft: isHighlighted ? '4px solid #FF9900' : 'none'
                }}
              >
              <div className="machine-name">{row[0]}</div>
              <div className="time-range">
                <strong>Zaman:</strong> {formatShortDate(row[2])} - {formatShortDate(row[3])}
                </div>
              <div className="order-info">
                <strong>İş Emri:</strong> {highlightedOrderCode || ''}
              </div>
              </div>
            );
          })}
      </div>
    );
  };

  return (
    <div className="gantt-container">
      <h2 className="gantt-title">
        Production Gantt Chart {highlightedOrderCode ? `(Highlighted Work Orders: ${highlightedOrderCode})` : ''}
      </h2>
      
      <div className="chart-wrapper">
        {chartData && chartData.length > 1 ? (
          <ChartFrame chartData={chartData} highlightedOrderCode={highlightedOrderCode} />
        ) : (
          renderAlternativeView()
        )}
      </div>
      
      <div className="time-range-display">
        <span>Time Range: {formatShortDate(dateRange.start)} to {formatShortDate(dateRange.end)}</span>
      </div>
    </div>
  );
};

export default GanttChart; 