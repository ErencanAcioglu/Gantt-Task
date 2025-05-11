import { useEffect, useRef } from 'react';

// ChartFrame bileşeni - iframe içinde Google Charts gösterecek
const ChartFrame = ({ chartData, highlightedOrderCode }) => {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!chartData || chartData.length <= 1 || !iframeRef.current) return;

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
            body { margin: 0; padding: 0; overflow: hidden; background-color: #F5F5F5; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif; }
            #chart_div { width: 100%; height: 100%; }
            
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
          </style>
          <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
          <script type="text/javascript">
            google.charts.load('current', {'packages':['gantt'], 'language': 'tr'});
            google.charts.setOnLoadCallback(drawChart);

            function drawChart() {
              var data = new google.visualization.DataTable();
              data.addColumn('string', 'Task ID');
              data.addColumn('string', 'Task Name');
              data.addColumn('string', 'Resource');
              data.addColumn('date', 'Start Date');
              data.addColumn('date', 'End Date');
              data.addColumn('number', 'Duration');
              data.addColumn('number', 'Percent Complete');
              data.addColumn('string', 'Dependencies');
              data.addColumn({type: 'string', role: 'tooltip', p: {html: true}});

              var rawData = ${JSON.stringify(chartData.slice(1))};
              var rows = [];
              
              // Satırları işle
              rawData.forEach(function(row) {
                var taskId = row[1];
                var machineName = row[0];
                var startTime = new Date(row[2]);
                var endTime = new Date(row[3]);
                
                // Önemli: Sarı rengi doğru şekilde algıla
                var isHighlighted = row[7] === '#FFD700';
                console.log('Row:', row[0], 'Highlight status:', isHighlighted, 'Color:', row[7]);
                
                // Tooltip HTML'i
                var tooltipHtml = '<div class="tooltip-content">' +
                  '<div class="tooltip-title">Machine: ' + machineName + '</div>' +
                  '<div class="tooltip-row"><span class="tooltip-label">Start:</span> ' + formatDate(startTime) + '</div>' +
                  '<div class="tooltip-row"><span class="tooltip-label">End:</span> ' + formatDate(endTime) + '</div>' +
                  '<div class="tooltip-row"><span class="tooltip-label">Work Order:</span> ' + 
                    (isHighlighted ? 
                      ('<span style="color:#FFD700;font-weight:bold;text-shadow:0px 0px 1px #000;">' + '${highlightedOrderCode || "MFG-5"}' + '</span>') : 
                      (row[8]?.includes('MFG-5') ? 'MFG-5' : 'MFG-5')) + 
                  '</div>' +
                  '<div class="tooltip-row"><span class="tooltip-label">Customer:</span> ATLAS</div>' +
                  (isHighlighted ? '<div class="tooltip-row" style="margin-top:8px;font-weight:bold;color:#FFD700;text-shadow:0px 0px 1px #000;">★ Bu görev vurgulanmıştır ★</div>' : '') +
                '</div>';
                
                rows.push([
                  taskId,
                  machineName,
                  isHighlighted ? 'highlighted' : 'normal',  // Resource sütunu - bar rengini belirler
                  startTime,
                  endTime,
                  null,
                  100,
                  null,
                  tooltipHtml
                ]);
              });
              
              data.addRows(rows);

              // Tarih formatlama yardımcı fonksiyonu
              function formatDate(date) {
                function pad(n) { return n < 10 ? '0' + n : n; }
                return date.getFullYear() + '-' + 
                  pad(date.getMonth() + 1) + '-' + 
                  pad(date.getDate()) + ' ' + 
                  pad(date.getHours()) + ':' + 
                  pad(date.getMinutes()) + ':' + 
                  pad(date.getSeconds());
              }

              var options = {
                height: 500,
                width: '100%',
                gantt: {
                  trackHeight: 30,
                  barHeight: 20,
                  defaultStartDate: new Date(2024, 11, 18),
                  shadowEnabled: false,
                  labelMaxWidth: 150,
                  barLabelStyle: {
                    fontName: 'Segoe UI',
                    fontSize: 11
                  },
                  innerGridHorizLine: {
                    stroke: '#e0e0e0',
                    strokeWidth: 1
                  },
                  innerGridTrack: { fill: '#f7f7f7' },
                  innerGridDarkTrack: { fill: '#f2f2f2' },
                  palette: [
                    {
                      // normal (index 0) - mavi
                      color: '#4285F4',
                      dark: '#3367D6', 
                      light: '#A9C4F5'
                    },
                    {
                      // highlighted (index 1) - sarı
                      color: '#FFD700',
                      dark: '#FFC107',
                      light: '#FFF59D'
                    }
                  ]
                },
                backgroundColor: '#F5F5F5',
                tooltip: { 
                  isHtml: true,
                  trigger: 'focus'
                },
                hAxis: {
                  format: 'HH:mm',
                  gridlines: {count: 24, color: '#e0e0e0'},
                  minorGridlines: {count: 0}
                }
              };

              var chart = new google.visualization.Gantt(document.getElementById('chart_div'));
              
              // Chart hazır olduğunda çalışır
              google.visualization.events.addListener(chart, 'ready', function() {
                window.parent.postMessage('chart_rendered', '*');
              });
              
              chart.draw(data, options);
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
  }, [chartData, highlightedOrderCode]);

  return (
    <iframe 
      ref={iframeRef}
      title="Gantt Chart"
      style={{ 
        width: '100%', 
        height: '600px', 
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#F5F5F5'
      }}
    />
  );
};

export default ChartFrame; 