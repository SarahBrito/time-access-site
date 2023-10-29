import {formatedDate} from './formatedDate' 

export const zoomConfig = {
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
}

export const borderPlugin = {
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
}

export const tooltipConfig = {
  backgroundColor: '#22223b',
  titleAlign: 'center',
  usePointStyle: true,
  padding: 16,
  boxPadding: 4,
  displayColors: true,
  callbacks: {
    labelPointStyle: function (context) {
      return {
        pointStyle: 'rectRounded',
        rotation: 0,
      };
    },
    labelTextColor: function (context) {
      return '#eeee';
    },
    title: function (context) {
      const date = context[0].label;
      const newDate = date.replace(', 12:00:00 a.m.', '');
      return formatedDate(newDate);
    },
  },
};


export const titleConfig = {  
  display: true,
  align: 'start',
  text: 'Sites',
  color: '#495057',
  font: {
    size: 20,
    weight: 'bold',
  },
}

export const subtitleConfig = {
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
}

export const legendConfig = {
  labels: {
    color: '#6c757d',
    boxWidth: 20,
    boxHeight: 20,
    usePointStyle: true,
    pointStyle: 'rectRounded',
    padding: 24,
  }
}