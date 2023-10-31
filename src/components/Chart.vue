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
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import zoomPlugin from 'chartjs-plugin-zoom';
import { eachMonthOfInterval, getMonth, startOfMonth, subDays } from 'date-fns';
import { Line } from 'vue-chartjs';
import {
  borderPlugin,
  legendConfig,
  scalesConfig,
  subtitleConfig,
  titleConfig,
  tooltipConfig,
  zoomConfig
} from '../utils/chartUtils';

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
const lastDate = new Date(sortedFile[sortedFile.length - 1].dateAccessed)
const last30DaysAgo = subDays(new Date(lastDate), 30).toISOString()
const dataLast30DaysAgo = sortedFile.filter((value) => {
  const dateAccessed = new Date(value.dateAccessed).toISOString()
  return dateAccessed >= last30DaysAgo
});
const sevenDaysAgo = subDays(new Date(lastDate), 7).toISOString()
const dataSevenDaysAgo = sortedFile.filter((value) => {
  const dateAccessed = new Date(value.dateAccessed).toISOString();
  return dateAccessed > sevenDaysAgo;
});

const websites = sortedFile.reduce((accumulator, value) => {
  if (!accumulator[value.url]) accumulator[value.url] = []

  return accumulator
}, {})

const labelsFormatForAll = (values) => {
  const uniqLabels = values.reduce((accumulator, value) => {
    const currentMonth = startOfMonth(new Date(value.dateAccessed))
    if (!accumulator[currentMonth]) {
      const date = new Intl.DateTimeFormat('pt-BR', {
        month: 'short'
      }).format(currentMonth)

      accumulator[currentMonth] = date
    };
    return accumulator;
  }, {})

  return Object.values(uniqLabels)
}

const labelsFormat = (values) => {
  const labels = values.map(({ dateAccessed }) => {
    return dateAccessed
  })

  const unique = [...new Set(labels)]
  return unique;
}

const datasetsFormatAll = (values) => {
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
        return accumulator + value.timeSpent
      }, 0)

      const avg = (sum / list.length).toFixed(0)

      return avg
    })

    return {
      label: key.replace(/https:\/\//, ''),
      data,
      borderWidth: 1.5,
      pointRadius: 1,
      tension: 0.5,
    }
  })

  return datasets
}

const datasetsFormat = (values) => {
  const summedData = [];
  const labels = labelsFormat(values)

  labels.forEach((date) => {
    Object.keys(websites).forEach((url) => {
      const matchingEntry = values.filter((entry) => {
        return entry.dateAccessed === date && entry.url === url
      });

      const timeSpent =
        matchingEntry.length > 0 ?
          matchingEntry.reduce(function (sum, value) {
            return sum + value.timeSpent;
          }, 0)
          : 0

      summedData.push({
        dateAccessed: date,
        url: url,
        timeSpent: timeSpent === 0 ? 0 : (timeSpent / matchingEntry.length).toFixed(0),
      })
    })
  })

  const datasets = Object.keys(websites).map((website) => {
    const filtered = summedData.filter(item => item.url === website)
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
        labels: labelsFormatForAll(sortedFile),
        datasets: datasetsFormatAll(sortedFile)
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
    last30DFilter() {
      return {
        labels: labelsFormat(dataLast30DaysAgo),
        datasets: datasetsFormat(dataLast30DaysAgo)
      }
    },
    last7DFilter() {
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
          labels: labelsFormatForAll(sortedFile),
          datasets: datasetsFormatAll(sortedFile)
        }
      else if (newValue === '30d') {
        const { labels, datasets } = this.last30DFilter()
        this.chartData = {
          labels,
          datasets,
        }
      } else if (newValue === '7d') {
        const { labels, datasets } = this.last7DFilter()
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