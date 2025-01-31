"use client"
import {  useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export function RadialChart() {
  const [setAnimationCompleted] = useState(false);

  const data = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [65, 35], // Example data
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      animateRotate: true,
      animateScale: true,
      onComplete: () => setAnimationCompleted(true),
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="h-[300px] flex items-center justify-center">
      <Chart type="doughnut" data={data} options={options} />
    </div>
  );
}