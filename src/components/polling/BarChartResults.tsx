import * as React from 'react';
import Chart from 'chart.js';
import isNull from 'lodash/isNull';
import 'chartjs-plugin-datalabels';
import { SrUiComponent } from 'react-strontium';
import IPollingResults from '../../interfaces/IPollingResults';

interface IBarChartResultsProps {
  results: IPollingResults;
  autoFit?: boolean;
}

interface IBarChartResultState {}

export default class BarChartResults extends SrUiComponent<
  IBarChartResultsProps,
  IBarChartResultState
> {
  private _canvas: HTMLCanvasElement;
  private _chart: Chart;

  onComponentMounted() {
    this._canvas = undefined;
  }

  resizeCallback() {
    return () => {
      this.updateChartSize();
    };
  }

  onComponentWillUnmount() {
    this._canvas = undefined;
    if (this._chart) {
      this._chart.destroy();
      this._chart = undefined;
    }
  }

  onNewProps(props: { results: IPollingResults }) {
    if (props && props.results) {
      this.updateConfig(props.results);
    }
  }
  // TODO broken, no failsafe check for results
  setupChart(canvas: HTMLCanvasElement) {
    if (
      !canvas ||
      this._canvas ||
      isNull(this.props.results) ||
      isNull(this.props.results.numericResults)
    ) {
      return;
    }

    this._canvas = canvas;

    const plugins: any = {
      datalabels: {
        backgroundColor: (context) => {
          return context.dataset.backgroundColor;
        },
        borderColor: 'white',
        borderRadius: 5,
        borderWidth: 1,
        color: 'white',
        display: (context) => {
          const dataset = context.dataset;
          const value = dataset.data[context.dataIndex];
          return value > 0;
        },
        font: {
          weight: 'bold',
        },
        formatter: (value, context) => {
          const dataset = context.dataset;
          const totalCount = dataset.data.reduce((p, c) => p + c, 0);
          const percent =
            totalCount > 0
              ? `(${Math.round(100 * (value / totalCount))}%)`
              : '';
          return `${value} ${percent}`;
        },
      },
    };

    const config = {
      type: 'bar',
      data: {
        labels: Object.keys(this.props.results.numericResults),
        datasets: [
          {
            label: 'Results',
            data: Object.keys(this.props.results.numericResults).map(
              (k) => this.props.results.numericResults[k]
            ),
            backgroundColor: [
              'rgb(54, 162, 235)',
              'rgb(75, 192, 192)',
              'rgb(255, 159, 64)',
              'rgb(153, 102, 255)',
              'rgb(255, 99, 132)',
              'rgb(255, 205, 86)',
            ],
            datalabels: {
              anchor: 'center',
            },
          },
        ],
      },
      options: {
        legend: { display: false },
        // animation: {
        //   duration: 0,
        // },
        responsive: true,
        maintainAspectRatio: this.props.autoFit === true,
        plugins: plugins,
        scales: {
          yAxes: [
            {
              display: true,
              ticks: {
                beginAtZero: true,
                min: 0,
              },
            },
          ],
        },
      },
    };

    if (!this._chart) {
      this._chart = new Chart(canvas.getContext('2d'), config);
      this.updateChartSize();
    }
  }

  updateConfig(results: IPollingResults) {
    if (!this._chart || isNull(results) || isNull(results.numericResults)) {
      return;
    }

    this._chart.config.data.labels = Object.keys(results.numericResults);
    this._chart.config.data.datasets[0].data = Object.keys(
      results.numericResults
    ).map((k) => results.numericResults[k]);
    this.updateChartSize();
  }

  updateChartSize() {
    if (this.props.autoFit === true) {
      return;
    }

    if (!this._chart) {
      return;
    }

    let headerHeight = 0;
    const headerElement = document.getElementsByTagName('h1')[0];
    if (headerElement) {
      headerHeight = headerElement.clientHeight;
    }

    (this._chart.canvas.parentNode as any).style.width = `${
      window.innerWidth - 20
    }px`;
    (this._chart.canvas.parentNode as any).style.height = `${
      window.innerHeight - 20 - headerHeight
    }px`;
    this._chart.update();
  }

  performRender() {
    if (!this.props.results) {
      return null;
    }

    return (
      <div className="bar-chart-results">
        <canvas className="chart" ref={(r) => this.setupChart(r)}></canvas>
      </div>
    );
  }
}
