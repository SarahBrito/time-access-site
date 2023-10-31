<template>
  <div class="chart">
    <Line id="chart-id" :options="chartOptions" :data="chartData" :plugins="chartPluggins" />
  </div>
</template>

<script>
import 'chartjs-adapter-date-fns';
import {
  zoomConfig, borderPlugin, tooltipConfig, titleConfig, subtitleConfig, legendConfig, scalesConfig
} from '../utils/chartUtils';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Line } from 'vue-chartjs'
import { startOfMonth, eachMonthOfInterval, getMonth} from 'date-fns';

Chart.register(...registerables);
Chart.register(zoomPlugin);
const response = await fetch("/data.json");
const file = await response.json();

const sortDates = (values) => {
  return values.sort((value1, value2) => {
    const dateA = new Date(value1.dateAccessed);
    const dateB = new Date(value2.dateAccessed);
    return dateA - dateB;
  })
}

const sortedFile = sortDates(file)

const websites = sortedFile.reduce((accumulator, value) => {
  if (!accumulator[value.url]) accumulator[value.url] = []

  return accumulator
}, {})

const labelsFormat = (values) => {
  const uniqLabels = values.reduce((accumulator, value) => {
    const currentMonth = startOfMonth(new Date(value.dateAccessed))
    if (!accumulator[currentMonth]) {
      const date = new Intl.DateTimeFormat('pt-BR', {
        month: 'short'
      }).format(currentMonth)

      accumulator[currentMonth] = {
        date,
        website: value.url,
      }
    };
    return accumulator;
  }, {})

  const dates = Object.values(uniqLabels).map(({ date }) => date)

  return dates
}

const datasetsFormat = (values) => {
  const months = eachMonthOfInterval({
    start: new Date(values[0].dateAccessed),
    end: new Date(values[values.length - 1].dateAccessed)
  })
 
  months.forEach((month) => {
    const currentMonth = getMonth(new Date(month));

    Object.keys(websites).forEach((url) => {
      const websiteValuesByMonth = values.filter((entry) => {
        const valueMonth = getMonth(new Date(entry.dateAccessed))

        if (entry.url === url && (valueMonth === currentMonth)) {
          return { ...entry, dateAccessed: month }
        }
      });

      websites[url] = [...websites[url], websiteValuesByMonth]
    })
  })

  const datasets = Object.entries(websites).map(([key, values]) => {
    const data = values.map(entry => {
      const list = Object.values(entry)
      const sum = list.reduce((accumulator, value) => {
        return accumulator + value.timeSpent;
      }, 0)

      const avg = (sum / list.length).toFixed(0)

      return avg;
    })

    return {
      label: key.replace(/https:\/\//, ''),
      data,
      borderWidth: 1.5,
      pointRadius: 1,
      tension: 0.5,
    }
  })

  return datasets;
}
export default {
  data() {
    return {
      chartData: {
        labels: labelsFormat(sortedFile),
        datasets: datasetsFormat(sortedFile)
      },
      chartOptions: {
        locale: 'pt-BR',
        responsive: true,
        interaction: {
          mode: 'index',
        },
        plugins: {
          tooltip: tooltipConfig,
          zoom: zoomConfig,
          title: titleConfig,
          subtitle: subtitleConfig,
          legend: legendConfig,
        },
        onClick(e) {
          const chart = e.chart;
          chart.options.plugins.zoom.zoom.wheel.enabled = !chart.options.plugins.zoom.zoom.wheel.enabled;
          chart.options.plugins.zoom.zoom.pinch.enabled = !chart.options.plugins.zoom.zoom.pinch.enabled;

          chart.update();
        },
        maintainAspectRatio: false,
        scales: scalesConfig,
      },
      chartPluggins: [borderPlugin]
    }
  },
 
  components: { Line },
};
</script>

<style scoped>
.chart {
  font-family: Arial, Helvetica, sans-serif;
  display: flex;
  flex-direction: column;
  width: 70vw;
  height: 70vh;
  position: relative;
  margin: auto;
  padding: 24px;
  border-radius: 10px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

canvas {
  border: 1px solid #e1e2e3;
  padding: 12px;
  border-radius: 10px;
}

@media (max-width: 800px) {
  .chart {
    width: 98vw;
    padding: 24px 6px;
  }
}
</style>