import { SrUiComponent } from 'react-strontium';
import * as React from 'react';
import Chart from 'chart.js';
import ColorUtils from '../../utilities/ColorUtils';

interface IEngagementPieProps {
  percent: number;
}

interface IEngagementPieState {}

export default class EngagementPie extends SrUiComponent<
  IEngagementPieProps,
  IEngagementPieState
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

  resizeCallback() {
    return () => this.resizeChart();
  }

  resizeChart() {
    if (this._canvas) {
      this._canvas.height = this._canvas.width * 0.9;
      this.deferred(
        () => {
          if (this._chart && this.mounted()) {
            try {
              this._chart.update();
            } catch {}
          }
        },
        250,
        'chartUpdate'
      );
    }
  }

  setupChart(canvas: HTMLCanvasElement) {
    if (!canvas || this._canvas) {
      return;
    }

    this._canvas = canvas;
    this.resizeChart();

    const chunkSize = 10;
    const borderSize = 1;
    const unfilledBorderSize = 1;
    const unfilledBackground: string = '#f5f5f5';
    const borderColor: string = 'rgb(255,255,255)';
    const colorChunks = [];
    const data: number[] = [];
    const borderWidths: number[] = [];
    const hoverWidths: number[] = [];
    const hoverColors: string[] = [];
    const hoverBackgrounds: string[] = [];
    const fill = Math.floor(Math.max(Math.min(100, this.props.percent), 0));
    let lastChunk = 0;

    for (let chunk = chunkSize; chunk <= fill; chunk += chunkSize) {
      data.push(chunkSize);
      lastChunk = chunk;
      colorChunks.push(this.percentColor(chunk / 100));
      borderWidths.push(borderSize);
      hoverWidths.push(borderSize);
      hoverColors.push(borderColor);
      hoverBackgrounds.push(this.percentColor(chunk / 100));
    }

    let remainingFill = fill % chunkSize;
    if (remainingFill !== 0) {
      data.push(remainingFill);
      colorChunks.push(this.percentColor((lastChunk + chunkSize) / 100));
      borderWidths.push(borderSize);
      hoverWidths.push(borderSize);
      hoverColors.push(borderColor);
      hoverBackgrounds.push(this.percentColor((lastChunk + chunkSize) / 100));
    }

    if (fill !== 100) {
      data.push(100 - fill);
      colorChunks.push(unfilledBackground);
      borderWidths.push(unfilledBorderSize);
      hoverWidths.push(unfilledBorderSize);
      hoverColors.push(borderColor);
      hoverBackgrounds.push(unfilledBackground);
    }

    let centerElement: any = {
      center: {
        text: Math.floor(fill) + '%',
        color: this.percentColor(this.props.percent / 100.0, 0.8, 0.2),
      },
    };

    let plugins: any = {
      datalabels: { display: false },
    };

    const cfg: Chart.ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Engagement Rate', ''],
        datasets: [
          {
            data: data,
            backgroundColor: colorChunks,
            borderWidth: borderWidths,
            hoverBorderColor: hoverColors,
            hoverBackgroundColor: hoverBackgrounds,
          },
        ],
      },
      options: {
        cutoutPercentage: 70,
        responsive: true,
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
          enabled: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        elements: centerElement,
        plugins: plugins,
      },
    };
    if (!this._chart) {
      this._chart = new Chart(canvas.getContext('2d'), cfg);
    }
  }

  percentColor(
    percent: number,
    saturation: number = 1,
    lightness: number = 0.4
  ) {
    return ColorUtils.valueToRedGreenRgbStyle(percent, saturation, lightness);
  }

  performRender() {
    return (
      <canvas
        className="engagement-pie chart"
        ref={(r) => this.setupChart(r)}
      />
    );
  }
}
