<template>
  <div class="chart">
    <div class="filters">
      <button class="btn" @click="() => handleClickFilter('7d')">7d</button>
      <button class="btn" @click="() => handleClickFilter('30d')">30d</button>
      <button class="btn" @click="() => handleClickFilter('all')">Tudo</button>
    </div>
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
import { endOfMonth, startOfMonth, subMonths, subDays } from 'date-fns';

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

const websites = Object.keys(sortedFile.reduce((accumulator, value) => {
  if (!accumulator[value.url]) accumulator[value.url] = []

  return accumulator
}, {}))

const labelsFormat = (values) => {
  const uniqLabels = values.reduce((accumulator, value) => {
    if (!accumulator[value.dateAccessed]) accumulator[value.dateAccessed] = {
      date: value.dateAccessed,
      website: value.url,
    };
    return accumulator;
  }, {})
  return Object.keys(uniqLabels)
}

const datasetsFormat = (values) => {
  const summedData = [];
  const labels = labelsFormat(values)

  labels.forEach((date) => {
    websites.forEach((url) => {
      const matchingEntry = values.filter((entry) =>
        entry.dateAccessed === date && entry.url === url
      );

      const timeSpent =
        matchingEntry.length > 0 ?
          matchingEntry.reduce(function (sum, value) {
            return sum + value.timeSpent;
          }, 0)
          : 0;

      summedData.push({
        dateAccessed: date,
        url: url,
        timeSpent: timeSpent === 0 ? 0 : (timeSpent / matchingEntry.length).toFixed(0),
      });
    });
  });

  const datasets = websites.map((website) => {
    const filtered = summedData.filter(item => item.url === website);
    return {
      label: website.replace(/https:\/\//, ''),
      data: filtered.map(item => item.timeSpent),
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
      filtered: "all",
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
  computed: {},
  methods: {
    handleClickFilter(type) {
      if (this.filtered === type) return;

      this.filtered = type;
    },
    last30DFilter(values) {
      const oneMonthAgo = subMonths(new Date(), 0)
      const dataOneMonthAgo = sortedFile.filter((value) => {
        const dateAccessed = new Date(value.dateAccessed)
        return dateAccessed >= startOfMonth(oneMonthAgo) && dateAccessed <= endOfMonth(oneMonthAgo)
      });
      return {
        labels: labelsFormat(dataOneMonthAgo),
        datasets: datasetsFormat(dataOneMonthAgo)
      }
    },
    last7DFilter(values) {
      const sevenDaysAgo = subDays(new Date(), 7);
      const dataSevenDaysAgo = sortedFile.filter((value) => {
        const dateAccessed = new Date(value.dateAccessed);
        return dateAccessed >= sevenDaysAgo && dateAccessed <= new Date();
      });
      
      return {
        labels: labelsFormat(dataSevenDaysAgo),
        datasets: datasetsFormat(dataSevenDaysAgo)
      }
    }
  },
  components: { Line },
  watch: {
    filtered(newValue) {
      if (newValue === "all")
        this.chartData = {
          labels: labelsFormat(sortedFile),
          datasets: datasetsFormat(sortedFile)
        }
      else if (newValue === '30d'){
        const { labels, datasets } = this.last30DFilter(sortedFile)
        this.chartData = {
          labels,
          datasets,
        }
      }else if (newValue === '7d'){
        const { labels, datasets } = this.last7DFilter(sortedFile)
        this.chartData = {
          labels,
          datasets,
        }
      }
    }
  }
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

.filters {
  position: absolute;
  top: 40px;
  right: 36px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart .btn {
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  border: none;
  background: #F3F4F6;
  color: #B7BCC5;
  cursor: pointer;
  font-weight: 700;
  transition: .3s;
}
.chart .btn:hover {
  background: #F0F9FF;
  color: #649EBB;
}

@media (max-width: 800px) {
  .chart {
    width: 98vw;
    padding: 24px 6px;
  }
}
</style>