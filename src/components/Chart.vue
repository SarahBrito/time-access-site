<template>
  <div class="chart">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import 'chartjs-adapter-date-fns';
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const sortDates = (values) => {
  return values.sort((value1, value2) => {
    const dateA = new Date(value1.dateAccessed);
    const dateB = new Date(value2.dateAccessed);

    return dateA - dateB;
  })
}

const labelsFormat = (values) => {
  const uniqLabels = values.reduce((accumulator, value) => {
    if (!accumulator[value.dateAccessed]) accumulator[value.dateAccessed] = {
      date: value.dateAccessed,
      website: value.url
    };

    return accumulator;
  }, {})

  return Object.keys(uniqLabels)
}

export default {
  setup() {
    const chart = ref(null);

    onMounted(async () => {
      const response = await fetch("/data.json");
      const file = await response.json();

      const sortedFile = sortDates(file)

      const labels = labelsFormat(sortedFile)

      const websites = Object.keys(sortedFile.reduce((accumulator, value) => {
        if (!accumulator[value.url]) accumulator[value.url] = []

        return accumulator;
      }, {}))

      const emptyDataSets = websites.map((website) => {
        return {
          label: website,
          data: [],
          borderWidth: 1.5,
          pointRadius: 0.1,
          tension: 0.5,
        }
      })

      const datasets = emptyDataSets

      sortedFile.forEach((value) => {
        datasets.forEach((dataset) => {
          if (value.url === dataset.label) {
            dataset.data.push(value.timeSpent)
          }
        })
      })

      chart.value = new Chart(chart.value, {
        type: 'line',
        data: {
          labels: labels,
          datasets,
        },
        options: {
          locale: 'pt-BR',
          responsive: true,
          scales: {
            x: {
              grid: {
                drawOnChartArea: false,
              },
              type: 'time',
              time: {
                unit: 'month',
              },
              ticks: {
                callback: (value, _index, _ticks) => {
                  const date = new Date(value)

                  return new Intl.DateTimeFormat('pt-BR', {
                    month: 'short'
                  }).format(date)
                }
              }
            },
            y: {
              grid: {
                display: true,
              },
            },
          },
        },
      });
    });

    return { chart };
  },
};
</script>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 500px;
  padding: 24px;

  background: #F4F4F6;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}
</style>