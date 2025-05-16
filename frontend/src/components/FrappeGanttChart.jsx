


import React, { useEffect, useRef } from 'react';
import Gantt from 'frappe-gantt';
import '../assets/frappe-gantt.css';

// tasks: [{ id, name, start, end, progress, dependencies, machine_name, order_code, ... }]
const FrappeGanttChart = ({ tasks }) => {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);

  // Makine bazında gruplama
  const machines = Array.from(new Set(tasks.map(t => t.machine_name)));

  // Her makine için iş emirlerini grupla
  const groupedTasks = machines.map(machine => {
    return {
      machine,
      tasks: tasks.filter(t => t.machine_name === machine)
    };
  });

  useEffect(() => {
    if (!ganttRef.current) return;
    // Tüm görevleri tek array olarak veriyoruz
    const flatTasks = tasks.map((t, i) => ({
      id: t.id || `${t.machine_name}-${t.order_code}-${i}`,
      name: t.order_code,
      start: t.start_time,
      end: t.end_time,
      progress: 100,
      custom_class: t.highlighted ? 'bar-highlighted' : '',
      machine_name: t.machine_name,
      order_code: t.order_code,
      dependencies: t.dependencies || ''
    }));
    // destroy fonksiyonu yok, kaldırıldı
    ganttInstance.current = new Gantt(ganttRef.current, flatTasks, {
      view_mode: 'Day',
      custom_popup_html: (task) => {
        return `
          <div style="padding:10px;max-width:250px;">
            <b>Makine:</b> ${task.machine_name}<br/>
            <b>İş Emri:</b> ${task.order_code}<br/>
            <b>Başlangıç:</b> ${task.start}<br/>
            <b>Bitiş:</b> ${task.end}<br/>
          </div>
        `;
      }
    });
  }, [tasks]);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div ref={ganttRef} />
    </div>
  );
};

export default FrappeGanttChart; 