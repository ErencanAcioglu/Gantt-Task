import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';

const GanttChart = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5001/api/gantt-data')
      .then(res => res.json())
      .then(data => {
        setTasks(Array.isArray(data) ? data : []);
      });
  }, []);

  // Makine isimlerini sırala ve unique hale getir
  const machines = Array.from(new Set(tasks.map(task => task.machine_name)));

  // Her makine için iş emirlerini topla
  const data = machines.map(machine => {
    const machineTasks = tasks.filter(task => task.machine_name === machine);
    return {
      x: machineTasks.map(task => [task.start_time, task.end_time]),
      y: Array(machineTasks.length).fill(machine),
      base: machineTasks.map(task => task.start_time),
      orientation: 'h',
      type: 'bar',
      width: 0.5,
      name: machine,
      customdata: machineTasks.map(task => task.order_code),
      hovertemplate:
        'Makine: %{y}<br>Başlangıç: %{base}<br>Bitiş: %{x[1]}<br>İş Emri: %{customdata}<extra></extra>',
      marker: {
        color: machineTasks.map(task => '#1f77b4'),
      },
      offset: 0,
    };
  });

  // Her makine için barlar y ekseninde üst üste gelmesin diye y değerlerini ayarla
  // Plotly'de gerçek Gantt için shape veya waterfall gerekebilir, ama bar ile sade çözüm

  return (
    <Plot
      data={
        tasks.length === 0
          ? []
          : tasks.map(task => ({
              x: [task.start_time, task.end_time],
              y: [task.machine_name, task.machine_name],
              mode: 'lines',
              line: { width: 20 },
              name: task.order_code,
              hovertemplate:
                'Makine: %{y[0]}<br>Başlangıç: %{x[0]}<br>Bitiş: %{x[1]}<br>İş Emri: %{name}<extra></extra>',
            }))
      }
      layout={{
        title: 'Makine Bazlı Gantt Chart',
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