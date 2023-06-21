import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import Chart from 'chart.js';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import {
  COURSE_ANALYTICS_TRENDS_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';

interface ICourseAnalyticsTrendsProps {
  isDepartment: boolean;
  course: ICourse;
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
}

interface ICourseAnalyticsTrendsState {}

export default class CourseAnalyticsTrends extends SrUiComponent<
  ICourseAnalyticsTrendsProps,
  ICourseAnalyticsTrendsState
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
      chart.destroy();
    }
  }

  setupChart(canvas: HTMLCanvasElement) {
    if (!canvas || this._canvas) {
      return;
    }

    this._canvas = canvas;
    const { isDepartment, lectures, analytics } = this.props;

    let lectureData = lectures
      .map((l) => {
        let la = analytics.lectureAnalyses.filter(
          (a) => a.lectureId === l.id
        )[0];
        if (!la) {
          return null;
        }
        return { lecture: l, analysis: la };
      })
      .filter((d) => !!d);

    let plugins: any = {
      datalabels: { display: false },
    };

    const cfg: Chart.ChartConfiguration = {
      type: 'line',
      data: {
        labels: lectureData.map(
          (d) =>
            d.lecture.name ||
            Localizer.getFormatted(
              GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION
            )
        ),
        datasets: [
          {
            label: Localizer.get('Views'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#123456',
            borderColor: '#123456',
            fill: false,
            data: lectureData.map((d) => d.analysis.uniqueSlideViews),
            yAxisID: 'axis-1',
          },
          {
            label: Localizer.get('Notes taken'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#ACBEA3',
            borderColor: '#ACBEA3',
            fill: false,
            data: lectureData.map((d) => d.analysis.notesTaken),
            yAxisID: 'axis-1',
          },
          {
            label: Localizer.get('Words per note'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#FF9000',
            borderColor: '#FF9000',
            borderDash: [5, 5],
            fill: false,
            data: lectureData.map((d) => d.analysis.meanWordsPerNote),
            yAxisID: 'axis-2',
          },
          {
            label: Localizer.get('Annotations'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#4C061D',
            borderColor: '#4C061D',
            fill: false,
            data: lectureData.map((d) => d.analysis.annotatationsMade),
            yAxisID: 'axis-1',
          },
        ],
      },
      options: {
        responsive: true,
        title: {
          display: false,
        },
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: Localizer.getFormatted(GENERAL_COMPONENT.SEGMENT),
              },
            },
          ],
          yAxes: [
            {
              display: true,
              stacked: false,
              scaleLabel: {
                display: true,
                labelString: Localizer.getFormatted(GENERAL_COMPONENT.SEGMENTS),
              },
              ticks: {
                min: 0,
                beginAtZero: true,
                callback: (value) => {
                  if (Math.floor(value) === value) {
                    return value;
                  }
                },
              },
              id: 'axis-1',
            },
            {
              display: true,
              stacked: false,
              position: 'right',
              scaleLabel: {
                display: true,
                labelString: Localizer.get('Words'),
              },
              ticks: {
                min: 0,
                beginAtZero: true,
                callback: (value) => {
                  if (Math.floor(value) === value) {
                    return value;
                  }
                },
              },
              id: 'axis-2',
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
    const { lectures, analytics } = this.props;
    if (!lectures || !analytics) {
      return null;
    }

    return (
      <>
        <h4>
          {Localizer.getFormatted(COURSE_ANALYTICS_TRENDS_COMPONENT.TITLE)}
        </h4>
        {lectures.length <= 1 && (
          <Alert bsStyle="info">
            {Localizer.getFormatted(COURSE_ANALYTICS_TRENDS_COMPONENT.NONE)}
          </Alert>
        )}
        {lectures.length > 1 && (
          <canvas className="chart" ref={(r) => this.setupChart(r)} />
        )}
        <hr />
      </>
    );
  }
}
