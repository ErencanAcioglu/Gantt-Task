// Sample data for testing when backend connection fails

// Base date
const BASE_DATE = new Date('2024-12-18T05:00:00');

// Helper function to add hours to a date
const addHours = (date, hours) => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

// Sample machine tasks - Makine adlarını Y ekseninde ve iş emirleri bar içinde görünecek şekilde örnek veriler
export const SAMPLE_MACHINE_TASKS = [
  // SARDON makinesi görevleri
  {
    machine_name: "SARDON",
    work_order_id: "MFG-1",
    order_code: "MFG-1",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 3),
    end_time: addHours(BASE_DATE, 5)
  },
  {
    machine_name: "SARDON",
    work_order_id: "MFG-2",
    order_code: "MFG-2",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 8),
    end_time: addHours(BASE_DATE, 10)
  },
  
  // RAM 2 makinesi görevleri  
  {
    machine_name: "RAM 2",
    work_order_id: "MFG-3",
    order_code: "MFG-3",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 3),
    end_time: addHours(BASE_DATE, 5)
  },
  {
    machine_name: "RAM 2",
    work_order_id: "MFG-4",
    order_code: "MFG-4",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 5),
    end_time: addHours(BASE_DATE, 7)
  },
  
  // FINAL KALITE KONTROL makinesi görevleri
  {
    machine_name: "FINAL KALITE KONTROL",
    work_order_id: "MFG-5",
    order_code: "MFG-5",
    customer_name: "ATLAS",
    start_time: BASE_DATE,
    end_time: addHours(BASE_DATE, 1)
  },
  {
    machine_name: "FINAL KALITE KONTROL",
    work_order_id: "MFG-6",
    order_code: "MFG-6",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 2),
    end_time: addHours(BASE_DATE, 4)
  },
  
  // RAM 1 makinesi görevleri
  {
    machine_name: "RAM 1",
    work_order_id: "MFG-7",
    order_code: "MFG-7",
    customer_name: "ATLAS",
    start_time: BASE_DATE,
    end_time: addHours(BASE_DATE, 1)
  },
  {
    machine_name: "RAM 1",
    work_order_id: "MFG-8",
    order_code: "MFG-8",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 6),
    end_time: addHours(BASE_DATE, 8)
  },
  
  // SARDON 1 makinesi görevleri
  {
    machine_name: "SARDON 1",
    work_order_id: "MFG-9",
    order_code: "MFG-9",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 3),
    end_time: addHours(BASE_DATE, 5)
  },
  
  // KURUTMA 2 makinesi görevleri
  {
    machine_name: "KURUTMA 2",
    work_order_id: "MFG-10",
    order_code: "MFG-10",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 7),
    end_time: addHours(BASE_DATE, 9)
  },
  
  // SARDON 2 makinesi görevleri
  {
    machine_name: "SARDON 2",
    work_order_id: "MFG-11",
    order_code: "MFG-11",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 9),
    end_time: addHours(BASE_DATE, 11)
  },
  
  // YIKAMA makinesi görevleri
  {
    machine_name: "YIKAMA",
    work_order_id: "MFG-12",
    order_code: "MFG-12",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 10),
    end_time: addHours(BASE_DATE, 12)
  },
  
  // TUP ACMA makinesi görevleri
  {
    machine_name: "TUP ACMA",
    work_order_id: "MFG-13",
    order_code: "MFG-13",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 12),
    end_time: addHours(BASE_DATE, 14)
  },
  
  // KURUTMA 1 makinesi görevleri
  {
    machine_name: "KURUTMA 1",
    work_order_id: "MFG-14",
    order_code: "MFG-14",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 13),
    end_time: addHours(BASE_DATE, 15)
  },
  
  // BALON makinesi görevleri
  {
    machine_name: "BALON",
    work_order_id: "MFG-15",
    order_code: "MFG-15",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 14),
    end_time: addHours(BASE_DATE, 16)
  },
  
  // KON5 makinesi görevleri
  {
    machine_name: "KON5",
    work_order_id: "MFG-16",
    order_code: "MFG-16",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 15),
    end_time: addHours(BASE_DATE, 17)
  },
  
  // KON3 makinesi görevleri
  {
    machine_name: "KON3",
    work_order_id: "MFG-17",
    order_code: "MFG-17",
    customer_name: "ATLAS",
    start_time: addHours(BASE_DATE, 16),
    end_time: addHours(BASE_DATE, 18)
  }
];

// Sample work orders for testing
export const SAMPLE_WORK_ORDERS = [
  { id: "MFG-1", order_code: "MFG-1", customer_name: "ATLAS", quantity: 100 },
  { id: "MFG-2", order_code: "MFG-2", customer_name: "ATLAS", quantity: 50 },
  { id: "MFG-3", order_code: "MFG-3", customer_name: "ATLAS", quantity: 75 },
  { id: "MFG-4", order_code: "MFG-4", customer_name: "ATLAS", quantity: 60 },
  { id: "MFG-5", order_code: "MFG-5", customer_name: "ATLAS", quantity: 90 },
  { id: "MFG-6", order_code: "MFG-6", customer_name: "ATLAS", quantity: 45 },
  { id: "MFG-7", order_code: "MFG-7", customer_name: "ATLAS", quantity: 80 },
  { id: "MFG-8", order_code: "MFG-8", customer_name: "ATLAS", quantity: 55 }
]; 