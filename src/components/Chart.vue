<template>
  <div class="chart">
    <canvas ref="chart"></canvas>
    <p>Clique do gráfico para <span>ativar</span> e <span>desativar</span> o zoom</p>
  </div>
</template>

<script>
import 'chartjs-adapter-date-fns';
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(...registerables);
Chart.register(zoomPlugin);

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
      website: value.url.replace(/https:\/\//, '').replace(/\.com/, ''),
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

        return accumulator
      }, {}))

      const emptyDataSets = websites.map((website) => {
        return {
          label: website.replace(/https:\/\//, ''),
          data: [],
          borderWidth: 1.5,
          pointRadius: 0.1,
          tension: 0.5,
        }
      })

      const datasets = emptyDataSets

      sortedFile.forEach((value) => {
        datasets.forEach((dataset) => {
          if (value.url.replace(/https:\/\//, '') === dataset.label) {
            dataset.data.push(value.timeSpent)
          }
        })
      })

      const zoomOptions = {

        pan: {
          enabled: true,

        },
        zoom: {
          wheel: {
            enabled: false,
          },
          pinch: {
            enabled: false
          },
          mode: 'xy',
        }
      };


      const borderPlugin = {
        id: 'chartAreaBorder',
        beforeDraw(chart, args, options) {
          const { ctx, chartArea: { left, top, width, height } } = chart;
          if (chart.options.plugins.zoom.zoom.wheel.enabled) {
            ctx.save();
            ctx.strokeStyle = '#6c757d';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, width, height);
            ctx.restore();
          }
        }
      };

      chart.value = new Chart(chart.value, {
        type: 'line',
        data: {
          labels: labels,
          datasets,
        },
        options: {
          locale: 'pt-BR',
          responsive: true,

          plugins: {
            //add line plugin
            zoom: zoomOptions,
            title: {  //add style title 
              display: true,
              align: 'start',
              text: 'Sites',
              color: '#495057',
              font: {
                size: 20,
                weight: 'bold',
              },
            },
            subtitle: { //add style subtitle
              display: true,
              align: 'start',
              text: 'Veja os acessos de cada site',
              color: '#6c757d',
              font: {
                size: 14,
                weight: 'normal',
              },
              padding: {
                bottom: 10
              }
            },
            legend: { // add style legend
              labels: {
                color: '#6c757d',
                boxWidth: 20,
                boxHeight: 20,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                padding: 24,

              }
            },

          },

          onClick(e) {
            const chart = e.chart;
            chart.options.plugins.zoom.zoom.wheel.enabled = !chart.options.plugins.zoom.zoom.wheel.enabled;
            chart.options.plugins.zoom.zoom.pinch.enabled = !chart.options.plugins.zoom.zoom.pinch.enabled;

            chart.update();
          },




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
        plugins: [borderPlugin],
      });
    });

    return { chart };
  },
};
</script>

<style scoped>
.chart {
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  flex-direction: column;
  width: 60%;
  padding: 24px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

p {
  color: #6c757d;
  padding: 5px;
  font-size: 14px;
  margin-top: 12px;
}

span {
  color: #495057;
  font-weight: 600;
}
</style>