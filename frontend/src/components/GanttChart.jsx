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

  // Normalize fonksiyonu
  const normalize = (str) => (str || '').trim().toUpperCase();

  // Bar renklerini ayarla: sadece aranan iş emri sarı, diğerleri mavi
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
              x: [task.start_time, task.end_time],
              y: [task.machine_name, task.machine_name],
              mode: 'lines',
              line: { width: 20, color: getBarColor(task.order_code) },
              name: task.order_code,
              customdata: [[
                task.machine_name,
                task.start_time,
                task.end_time,
                task.order_code,
                task.customer_name || ''
              ]],
              hovertemplate:
                'Machine: %{customdata[0]}<br>' +
                'Start: %{customdata[1]}<br>' +
                'End: %{customdata[2]}<br>' +
                'Work Order: %{customdata[3]}<br>' +
                'Customer: %{customdata[4]}<extra></extra>',
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