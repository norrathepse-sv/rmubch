"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DepartmentBarChart({ data }: { data: any[] }) {
 const chartData = {
  // เปลี่ยน d.depreport เป็น d.name
  labels: data.map((d) => d.name), 
  datasets: [
    {
      label: 'จำนวนอุบัติการณ์',
      data: data.map((d) => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      hoverBackgroundColor: '#2563eb',
      borderRadius: 12,
      barThickness: 32,
    },
  ],
};

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: 'bold' as const, family: 'Inter' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
      }
    }
  };

  return (
    <div className="h-[350px] w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}