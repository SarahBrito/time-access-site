<template>
  <div>
     <canvas ref="chart" class="chart" ></canvas>
  </div>
</template>
 
 <script>
 import { ref, onMounted } from 'vue';
 import { Chart, registerables } from 'chart.js';
 
 Chart.register(...registerables);
 
 export default {
  setup() {
     const chart = ref(null);
 
     onMounted(() => {
       chart.value = new Chart(chart.value, {
         type: 'line',
         data: {
           labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
           datasets: [
             {
               label: '# of Votes',
               data: [12, 19, 3, 5, 2, 3],
               backgroundColor: ['rgba(255, 99, 132, 0.2)'],
               borderColor: ['rgba(255, 99, 132, 1)'],
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
    aspect-ratio: auto 500 / 200;
  }

</style>