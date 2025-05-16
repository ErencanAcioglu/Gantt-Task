import { useEffect, useRef } from 'react';
import moment from 'moment';

// ChartFrame bileşeni - iframe içinde Google Charts gösterecek
const ChartFrame = ({ data, dateRange }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!data || data.length <= 1 || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    
    // iframe içeriğini hazırla
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Gantt Chart</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              overflow: hidden; 
              background-color: #F5F5F5; 
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; 
            }
            #chart_div { 
              width: 100%; 
              height: 100vh; 
            }
            
            /* Google Chart stillerini geçersiz kıl */
            .google-visualization-tooltip {
              background-color: #333 !important;
              color: white !important;
              border: none !important;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
              padding: 0 !important;
              font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif !important;
              max-width: 300px !important;
              z-index: 100 !important;
              pointer-events: none !important;
            }
            
            /* Tooltip içerik stileri */
            .tooltip-content {
              padding: 10px;
              background-color: #333;
              color: white;
              border-radius: 5px;
              font-size: 12px;
              max-width: 300px;
            }
            
            .tooltip-title {
              margin-bottom: 5px;
              font-weight: bold;
              color: #fff;
              border-bottom: 1px solid #555;
              padding-bottom: 5px;
            }
            
            .tooltip-row {
              margin: 4px 0;
            }
            
            .tooltip-label {
              font-weight: bold;
            }

            /* Ekstra stil düzenlemeleri */
            text {
              font-family: 'Segoe UI', sans-serif !important;
            }
            
            .google-visualization-tooltip {
              background: #333 !important;
              border: none !important;
              box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;
              padding: 0px !important;
              border-radius: 3px !important;
            }
          </style>
          <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
          <script type="text/javascript">
            google.charts.load('current', {'packages':['gantt'], 'language': 'tr'});
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
              try {
                // Chart verilerini doğrudan JSON olarak al
                var chartData = ${JSON.stringify(data)};
                
                console.log('Veri işleme başlıyor...', chartData.length > 1 ? chartData.length - 1 : 0, 'satır veri mevcut');
                
                if (!chartData || chartData.length <= 1) {
                  throw new Error('Gösterilecek veri bulunamadı');
                }
                
                // Veri satırlarını önceden işle ve tarih değerlerini düzelt
                for (var i = 1; i < chartData.length; i++) {
                  var row = chartData[i];
                  
                  // Satır veri hatalarını kontrol et
                  if (!row || row.length < 4) {
                    console.error('Satır #' + i + ' geçersiz veri formatı:', row);
                    continue;
                  }
                  
                  // Sadece Y-ekseninde gösterilecek makine adının geçerli olduğundan emin ol
                  if (!row[0] || typeof row[0] !== 'string' || row[0].length === 0) {
                    console.error("HATA: Geçersiz Y-ekseni değeri:", row[0]);
                    row[0] = "Bilinmeyen Makine";
                  }
                  
                  // Bar içinde gösterilecek iş emri kodunun geçerli olduğundan emin ol
                  if (!row[1] || typeof row[1] !== 'string' || row[1].length === 0) {
                    console.error("HATA: Geçersiz bar değeri:", row[1]);
                    row[1] = "Bilinmeyen İş";
                  }
                  
                  // Tarihleri her zaman Date nesneleri olarak ayarla
                  try {
                    if (row[2]) {
                      if (typeof row[2] === 'string') {
                        row[2] = new Date(row[2]);
                        if (isNaN(row[2].getTime())) {
                          console.error('Satır #' + i + ' geçersiz başlangıç tarihi:', row[2]);
                          row[2] = new Date('2024-12-18T08:00:00');
                        }
                      } else if (row[2] && typeof row[2] === 'object') {
                        if (row[2] instanceof Date) {
                          // Zaten Date objesi, bir şey yapma
                        } else if (row[2].hasOwnProperty('value')) {
                          // Google Chart'ın özel tarih formatı durumunu ele al
                          row[2] = new Date(row[2].value);
                        } else {
                          // Diğer objeler için bir tahmin yap
                          console.warn('Satır #' + i + ' beklenmeyen tarih formatı:', row[2]);
                          row[2] = new Date('2024-12-18T08:00:00');
                        }
                      }
                    } else {
                      // Null/undefined tarihi varsayılan değere ayarla
                      row[2] = new Date('2024-12-18T08:00:00');
                    }
                    
                    if (row[3]) {
                      if (typeof row[3] === 'string') {
                        row[3] = new Date(row[3]);
                        if (isNaN(row[3].getTime())) {
                          console.error('Satır #' + i + ' geçersiz bitiş tarihi:', row[3]);
                          row[3] = new Date('2024-12-18T10:00:00');
                        }
                      } else if (row[3] && typeof row[3] === 'object') {
                        if (row[3] instanceof Date) {
                          // Zaten Date objesi, bir şey yapma
                        } else if (row[3].hasOwnProperty('value')) {
                          // Google Chart'ın özel tarih formatı durumunu ele al
                          row[3] = new Date(row[3].value);
                        } else {
                          // Diğer objeler için bir tahmin yap
                          console.warn('Satır #' + i + ' beklenmeyen tarih formatı:', row[3]);
                          row[3] = new Date('2024-12-18T10:00:00');
                        }
                      }
                    } else {
                      // Null/undefined tarihi varsayılan değere ayarla
                      row[3] = new Date('2024-12-18T10:00:00');
                    }
                  } catch (dateErr) {
                    console.error('Satır #' + i + ' tarih dönüştürme hatası:', dateErr);
                    row[2] = new Date('2024-12-18T08:00:00');
                    row[3] = new Date('2024-12-18T10:00:00');
                  }
                }
                
                console.log('Veri işleme tamamlandı, datatable oluşturuluyor...');
                
                // Google Charts DataTable oluştur
                var dataTable = new google.visualization.DataTable();
                
                // Sütunları doğru sırayla ekle
                dataTable.addColumn('string', 'Machine');     // İlk sütun: Y-ekseni - MAKİNE ADI
                dataTable.addColumn('string', 'Work Order');  // İkinci sütun: Bar içinde gösterilecek - İŞ EMRİ
                dataTable.addColumn('date', 'Start Date');
                dataTable.addColumn('date', 'End Date');
                dataTable.addColumn('number', 'Duration');
                dataTable.addColumn('number', 'Percent Complete');
                dataTable.addColumn('string', 'Dependencies');
                dataTable.addColumn('string', 'style');
                dataTable.addColumn({type: 'string', role: 'tooltip', p: {html: true}});
                
                // Debug için sütun yapısını kontrol et
                console.log("Tablo sütunları:", [
                  'Machine (string) - Y ekseni', 
                  'Work Order (string) - Bar içinde gösterilir', 
                  'Start Date (date)', 
                  'End Date (date)', 
                  'Duration (number)', 
                  'Percent (number)', 
                  'Dependencies (string)', 
                  'style (string)', 
                  'tooltip (string/html)'
                ]);
                
                // Makine adları analizi
                var uniqueMachines = {};
                for (var i = 1; i < chartData.length; i++) {
                  var machine = chartData[i][0];
                  uniqueMachines[machine] = true;
                }
                
                console.log('Benzersiz makine sayısı:', Object.keys(uniqueMachines).length);
                console.log('Makine adları:', Object.keys(uniqueMachines));
                
                console.log('ChartFrame - CHART DATA BAŞLIK:', chartData[0]);
                console.log('ChartFrame - CHART DATA İLK SATIR:', chartData[1]);
                console.log('ChartFrame - CHART DATA MAKINE ADLARI (Y-eksen):', [...new Set(chartData.slice(1).map(function(row) { return row[0]; }))]);
                
                // Datatable'a satırları ekle
                console.log('ChartFrame - EKLENEN SATIR ÖRNEKLERİ:');
                for (var i = 1; i < Math.min(chartData.length, 5); i++) {
                  console.log("ChartFrame - Satır #" + i + ": Y-eksen=" + chartData[i][0] + ", Bar=" + chartData[i][1]);
                  
                  dataTable.addRow([
                    chartData[i][0],    // Y-ekseni - Makine adı
                    chartData[i][1],    // Bar - İş emri kodu 
                    chartData[i][2],    // Başlangıç
                    chartData[i][3],    // Bitiş
                    chartData[i][4],    // Süre
                    chartData[i][5],    // Tamamlanma
                    chartData[i][6],    // Bağımlılıklar 
                    chartData[i][7],    // Stil
                    chartData[i][8]     // Tooltip
                  ]);
                }
                
                // Her veri satırını ekledik mi kontrol et
                var totalRows = chartData.length - 1; // Başlık satırını çıkar
                var addedRows = 0;
                
                // Tüm veri satırlarını ekleyelim
                for (var i = 1; i < chartData.length; i++) {
                  try {
                    dataTable.addRow([
                      chartData[i][0],    // Y-ekseni - Makine adı
                      chartData[i][1],    // Bar - İş emri kodu 
                      chartData[i][2],    // Başlangıç
                      chartData[i][3],    // Bitiş
                      chartData[i][4],    // Süre
                      chartData[i][5],    // Tamamlanma
                      chartData[i][6],    // Bağımlılıklar 
                      chartData[i][7],    // Stil
                      chartData[i][8]     // Tooltip
                    ]);
                    addedRows++;
                  } catch (err) {
                    console.error("Satır #" + i + " eklenirken hata:", err);
                  }
                }
                console.log("Toplam " + addedRows + " / " + totalRows + " satır eklendi");
                
                // Tarih aralığı ayarla - Basitleştirilmiş yaklaşım
                var startDate = new Date('2024-12-18T05:00:00');
                var endDate = new Date('2024-12-19T20:00:00');
                
                console.log('Date range:', startDate, 'to', endDate);

                var options = {
                  height: window.innerHeight,
                  width: '100%',
                  gantt: {
                    trackHeight: 30,  // Makine başına track yüksekliği
                    barHeight: 20,    // Bar yüksekliği
                    defaultStartDate: startDate,
                    shadowEnabled: true,  // Gölgelendirmeyi etkinleştir
                    shadowColor: '#888',  // Gölge rengi
                    shadowOffset: 2,      // Gölge kaydırma
                    labelMaxWidth: 200,   // Makine adlarının genişliği - daha geniş
                    innerGridHorizontalSpacing: 20, // Increase spacing
                    labelStyle: {         // Makine adları sitili
                      fontName: 'Segoe UI',
                      fontSize: 12,
                      bold: true
                    },
                    barLabelStyle: {     // Bar içindeki iş emri kodlarının stili
                      fontName: 'Segoe UI',
                      fontSize: 11,      // İş emirlerinin görünmesi için boyutu artırıldı
                      bold: true,
                      color: '#fff'      // Beyaz metin
                    },
                    
                    // İş emri kodlarının bar içinde görünmesini sağla
                    taskFormatter: function(task) {
                      if (task.type === 'category') {
                        return null;
                      }
                      
                      console.log('ChartFrame - Task formatter:', task);
                      
                      // task.title, artık ikinci sütundaki iş emri kodunu temsil eder
                      return {
                        content: task.title, // İş emri kodunu göster
                        start: task.start,
                        end: task.end,
                        progressValue: task.percent,
                        title: task.title,
                        tooltip: task.tooltip,
                        style: task.style
                      };
                    },
                    
                    // Y ekseni sıralaması 
                    sortTasks: false, // Varsayılan sıralamayı kapat, veri sırasına göre göster
                    criticalPathEnabled: false, // Kritik yol özelliğini kapat
                    
                    innerGridHorizLine: {
                      stroke: '#e0e0e0',
                      strokeWidth: 1
                    },
                    innerGridTrack: { fill: '#f9fbff' },
                    innerGridDarkTrack: { fill: '#f3f7ff' },
                    
                    // Bar içindeki iş emri kodları görünsün
                    barCornerRadius: 3,  // Köşeleri yuvarlat
                    barLabelPosition: 'middle', // Label'ları çubuğun ortasına konumlandır
                    
                    palette: [
                      {
                        color: '#4285F4',
                        dark: '#3367D6',
                        light: '#8AB4F8'
                      }
                    ],
                    percentEnabled: false, // Yüzde çubuğunu gizle
                    arrow: {
                      angle: 0,
                      width: 0,
                      color: 'transparent',
                      radius: 0
                    }
                  },
                  backgroundColor: '#F5F5F5',
                  tooltip: { 
                    isHtml: true,
                    trigger: 'focus' 
                  },
                  hAxis: {
                    format: 'HH:mm',
                    gridlines: {count: 12, color: '#e0e0e0'},  // Orta seviye grid çizgisi
                    minorGridlines: {count: 0, color: '#f0f0f0'}, // Minor gridlines'ı gizle
                    minValue: startDate,
                    maxValue: endDate,
                    textStyle: {fontSize: 10}
                  },
                  vAxis: {
                    title: 'Makine',
                    titleTextStyle: {
                      color: '#333',
                      fontSize: 12,
                      italic: false,
                      bold: true
                    },
                    textStyle: {
                      color: '#333',
                      fontSize: 12,
                      bold: true
                    },
                    format: '',
                    gridlines: {
                      count: Object.keys(uniqueMachines).length,
                      color: '#e0e0e0'
                    },
                    minorGridlines: {
                      count: 0
                    }
                  }
                };

                var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
                
                // Chart hazır olduğunda çalışır
                google.visualization.events.addListener(chart, 'ready', function() {
                  window.parent.postMessage('chart_rendered', '*');
                  
                  console.log("Chart başarıyla oluşturuldu");
                  
                  // SVG'yi genel olarak iyileştir
                  var svg = document.querySelector('svg');
                  if (svg) {
                    // Etiket sayısı bilgisi
                    var allTextElements = svg.querySelectorAll('text');
                    console.log('Değiştirilecek etiket sayısı:', allTextElements.length);
                    
                    // Y ekseni etiketleri artık doğru sıralamayla geliyor, manipülasyona gerek yok
                  }
                });
                
                // Chart'ı çiz
                try {
                  chart.draw(dataTable, options);
                  console.log('Chart başarıyla oluşturuldu');
                  
                  // Pencere boyutu değişirse chart'ı yeniden çiz
                  window.addEventListener('resize', function() {
                    options.height = window.innerHeight;
                    chart.draw(dataTable, options);
                  });
                  
                  // Text elemanlarını kontrol et ve düzelt
                  setTimeout(function() {
                    try {
                      // SVG text elementlerini bul
                      var svg = document.querySelector('svg');
                      if (svg) {
                        var textElements = svg.querySelectorAll('text');
                        console.log('Bulunan toplam metin elemanları:', textElements.length);

                        // Sütun başlıklarını ve makine adları etiketlerini daha belirgin hale getir
                        textElements.forEach(function(textEl) {
                          // Y-eksenindeki metinlerin stilini düzelt (makine adları)
                          if (textEl.getAttribute('text-anchor') === 'end') {
                            textEl.setAttribute('font-weight', 'bold');
                            textEl.setAttribute('fill', '#333');
                          }
                        });
                      }
                    } catch(e) {
                      console.error('SVG text manipülasyonu hatası:', e);
                    }
                  }, 1000);
                  
                } catch (e) {
                  console.error('Chart oluşturma hatası:', e);
                }
              } catch(e) {
                console.error('Chart oluşturma hatası:', e);
                document.getElementById('chart_div').innerHTML = '<div style="padding: 20px; color: red;">Gantt chart oluşturulurken bir hata oluştu: ' + e.message + '</div>';
              }
            }
          </script>
        </head>
        <body>
          <div id="chart_div"></div>
        </body>
      </html>
    `);
    iframeDoc.close();

    // iframe içindeki mesajları dinle
    const messageListener = (event) => {
      if (event.data === 'chart_rendered') {
        console.log('Chart başarıyla oluşturuldu');
      }
    };
    
    window.addEventListener('message', messageListener);
    
    return () => {
      window.removeEventListener('message', messageListener);
    };
  }, [data, dateRange]);

  return (
    <iframe 
      ref={iframeRef}
      title="Gantt Chart"
      style={{ 
        width: '100%', 
        height: '100%', 
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#F5F5F5'
      }}
    />
  );
};

export default ChartFrame; 