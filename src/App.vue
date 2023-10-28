<template>
  <div class="container">
    <Chart /> 
  </div>
</template>

<script>
import Chart from './components/Chart.vue'

export default {
  components: {
    Chart, 
  },
};
</script>

<style scoped>
  .container {
    /* background: rgb(4, 4, 26); */
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>