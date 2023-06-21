import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import Chart from 'chart.js';

interface IBarChartProps {
  data: Chart.ChartData;
  xLabel: string;
  yLabel: string;
  maxYValue?: number;
  percentLabels?: boolean;
  stacked?: boolean;
  hideLegend?: boolean;
}

interface IBarChartState {}

export default class BarChart extends SrUiComponent<
  IBarChartProps,
  IBarChartState
> {
  private _canvas: HTMLCanvasElement;
  private _chart: Chart;

  onComponentWillUnmount() {
    this.cleanUpCharts();
  }

  cleanUpCharts() {
    this._canvas = null;
    if (this._chart) {
      let chart = this._chart;
      this._chart = null;
      try {
        chart.destroy();
      } catch (e) {}
    }
  }

  setupChart(canvas: HTMLCanvasElement) {
    if (!canvas || this._canvas) {
      return;
    }

    this._canvas = canvas;

    let ops: Chart.ChartTooltipCallback = undefined;
    if (this.props.percentLabels === true) {
      ops = {
        label: (item, data) => {
          let label = data.datasets[item.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          return label + Math.floor(parseFloat(item.yLabel) * 100) + '%';
        },
      };
    } else {
      ops = {
        label: (item, data) => {
          let label = data.datasets[item.datasetIndex].label || '';
          if (label) {
            label += ': ';
          }
          return label + item.yLabel;
        },
      };
    }

    let plugins: any = {
      datalabels: { display: false },
    };

    const cfg: Chart.ChartConfiguration = {
      type: 'bar',
      data: this.props.data,
      options: {
        responsive: true,
        title: {
          display: false,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          callbacks: ops,
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        legend: {
          display: this.props.hideLegend !== true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: this.props.xLabel,
              },
            },
          ],
          yAxes: [
            {
              display: true,
              stacked: this.props.stacked === true,
              scaleLabel: {
                display: true,
                labelString: this.props.yLabel,
              },
              ticks: {
                max: this.props.maxYValue,
                callback: this.props.percentLabels
                  ? (val) => {
                      return Math.floor(val * 100) + '%';
                    }
                  : (v) => v,
              },
            },
          ],
        },
        plugins: plugins,
      },
    };

    if (!this._chart) {
      this._chart = new Chart(canvas.getContext('2d'), cfg);
    }
  }

  performRender() {
    return <canvas className="chart" ref={(r) => this.setupChart(r)} />;
  }
}
