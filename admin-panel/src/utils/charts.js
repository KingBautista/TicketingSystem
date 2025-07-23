import Chart from 'chart.js/auto';

let monthlyChartInstance = null;

export function initMonthlySchedulesChart(data) {
  const ctx = document.getElementById('monthlySchedulesChart');
  if (!ctx) return;

  // Destroy previous chart instance if it exists
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }

  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.month),
      datasets: [
        {
          label: 'Pending Approval',
          data: data.map(item => item.pending_schedules),
          backgroundColor: '#ffc107'
        },
        {
          label: 'In Progress',
          data: data.map(item => item.in_progress_schedules),
          backgroundColor: '#17a2b8'
        },
        {
          label: 'Completed',
          data: data.map(item => item.completed_schedules),
          backgroundColor: '#28a745'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
} 