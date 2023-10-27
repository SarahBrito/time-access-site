<template>
  <div class="chart">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import { ref, onMounted} from 'vue';
import { Chart, registerables } from 'chart.js';
import axios from 'axios'

Chart.register(...registerables);

export default {
  setup() {
    const chart = ref(null);

    onMounted(async () => {

      const response = await axios.get('https://vuetestti.s3.us-east-1.amazonaws.com/data.json'); 

      // Extraia os labels e dados da resposta da API
      const data = response.data;

      chart.value = new Chart(chart.value, {
        type: 'line',
        data: {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
          datasets: [
            {
              label: '#',
              data: [12, 19, 3, 5, 2, 3],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
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
    border: 1px solid rgb(179, 179, 179);
    width: 700px;
    height: 400px;
    padding: 12px;
  }
</style>