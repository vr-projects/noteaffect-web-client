import * as React from 'react';
import Chart from 'chart.js';
import { SrUiComponent } from 'react-strontium';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import ISeriesAnalysis from '../../../interfaces/ISeriesAnalysis';
import {
  GENERAL_COMPONENT,
  LECTURE_ANALYTICS,
} from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';

interface ILectureAnalyticsProps {
  course: ICourse;
  lecture: ILecture;
  analytics: ISeriesAnalysis;
}

interface ILectureAnalyticsState {}

export default class LectureAnalytics extends SrUiComponent<
  ILectureAnalyticsProps,
  ILectureAnalyticsState
> {
  private _chartReferences: {
    [key: string]: { canvas: HTMLCanvasElement; chart: Chart };
  } = {};

  onComponentWillUnmount() {
    this.cleanUpCharts();
  }

  cleanUpCharts() {
    Object.keys(this._chartReferences).forEach((k) => {
      if (this._chartReferences[k].chart) {
        this._chartReferences[k].chart.destroy();
      }
      delete this._chartReferences[k];
    });
  }

  navToSlide(slide: number) {
    this.navigate(
      `instructor/course/${this.props.course.id}?menu=lectures&lecture=${this.props.lecture.id}&initialSlide=${slide}`
    );
  }

  setupChart(canvas: HTMLCanvasElement) {
    if (
      !canvas ||
      (this._chartReferences['courseTrends'] &&
        this._chartReferences['courseTrends'].canvas)
    ) {
      return;
    }

    let config = { canvas: canvas, chart: null };

    this._chartReferences['courseTrends'] = config;

    const slides = this.slideData();

    let plugins: any = {
      datalabels: { display: false },
    };

    const cfg: Chart.ChartConfiguration = {
      type: 'line',
      data: {
        labels: slides.map(
          (d) =>
            `${Localizer.getFormatted(GENERAL_COMPONENT.SEGMENT)} ${d.slide}`
        ),
        datasets: [
          {
            label: Localizer.get('Views'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#123456',
            borderColor: '#123456',
            fill: false,
            data: slides.map((d) => d.uniqueViews),
            yAxisID: 'axis-1',
          },
          {
            label: Localizer.get('Notes taken'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#ACBEA3',
            borderColor: '#ACBEA3',
            fill: false,
            data: slides.map((d) => d.notesTaken),
            yAxisID: 'axis-1',
          },
          {
            label: Localizer.get('Words per note'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#FF9000',
            borderColor: '#FF9000',
            fill: false,
            data: slides.map((d) => d.meanWordsPerNote),
            yAxisID: 'axis-2',
          },
          {
            label: Localizer.get('Annotations'),
            hideInLegendAndTooltip: true,
            backgroundColor: '#4C061D',
            borderColor: '#4C061D',
            fill: false,
            data: slides.map((d) => d.annotatationsMade),
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
    if (!config.chart) {
      config.chart = new Chart(canvas.getContext('2d'), cfg);
    }
  }

  slideData() {
    const analysis = this.props.analytics.lectureAnalyses.filter(
      (l) => l.lectureId === this.props.lecture.id
    )[0];
    return analysis.slideAnalyses.sort((a, b) => a.slide - b.slide);
  }

  performRender() {
    const slides = this.slideData();

    return (
      <>
        {/* // TODO wrap in div or span, add className fo component */}
        <canvas className="chart" ref={(r) => this.setupChart(r)} />
        <table className="analytics-table margin margin-top-md">
          <thead>
            <tr>
              <th>{Localizer.getFormatted(GENERAL_COMPONENT.SEGMENT)}</th>
              <th>{Localizer.getFormatted(LECTURE_ANALYTICS.UNIQUE_VIEWS)}</th>
              <th>{Localizer.getFormatted(LECTURE_ANALYTICS.NOTES_TAKEN)}</th>
              <th>{Localizer.getFormatted(LECTURE_ANALYTICS.AVERAGE_WORDS)}</th>
              <th>{Localizer.getFormatted(LECTURE_ANALYTICS.ANNOTATIONS)}</th>
            </tr>
          </thead>
          <tbody>
            {slides.map((slide) => {
              return (
                <tr key={slide.slide.toString()}>
                  <td>
                    {/* // TODO tech debt a tag refactor */}
                    <a onClick={() => this.navToSlide(slide.slide)}>
                      <p className="list-menu-title">{slide.slide}</p>
                    </a>
                  </td>
                  <td>{slide.uniqueViews}</td>
                  <td>{slide.notesTaken}</td>
                  <td>{Math.round(slide.meanWordsPerNote)}</td>
                  <td>{slide.annotatationsMade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </>
    );
  }
}
