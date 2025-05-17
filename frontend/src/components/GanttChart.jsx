import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const GanttChart = ({ highlightedOrderCode }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/gantt-data')
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
      });
  }, []);

  const normalize = (str) => (str || '').trim().toUpperCase();

  const getBarColor = (orderCode) =>
    highlightedOrderCode && normalize(orderCode) === normalize(highlightedOrderCode)
      ? '#FFD600'
      : '#1f77b4';

  return (
    <Plot
      data={
        tasks.length === 0
          ? []
          : tasks.map(task => ({
              x: [task.start_time || 'Bilinmiyor', task.end_time || 'Bilinmiyor'],
              y: [task.machine_name || 'Bilinmiyor', task.machine_name || 'Bilinmiyor'],
              mode: 'lines',
              line: { width: 20, color: getBarColor(task.order_code) },
              customdata: [[
                task.machine_name || 'Bilinmiyor',
                task.start_time || 'Bilinmiyor',
                task.end_time || 'Bilinmiyor',
                task.order_code || 'Bilinmiyor',
                task.customer_name || 'Bilinmiyor'
              ]],
              hovertemplate:
                'Makine: %{customdata[0]}<br>' +
                'Başlangıç: %{customdata[1]}<br>' +
                'Bitiş: %{customdata[2]}<br>' +
                'İş Emri: %{customdata[3]}<br>' +
                'Müşteri: %{customdata[4]}<extra></extra>',
            }))
      }
      layout={{
        title: 'Üretim Gantt Chart Sistemi',
        xaxis: {
          title: 'Zaman',
          type: 'date',
        },
        yaxis: {
          title: 'Makine',
          type: 'category',
          automargin: true,
        },
        height: 600,
        showlegend: false,
        margin: { l: 120, r: 40, t: 60, b: 40 },
      }}
      config={{ responsive: true }}
      style={{ width: '100%' }}
    />
  );
};

export default GanttChart;