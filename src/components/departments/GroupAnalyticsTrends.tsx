import * as React from 'react';
import Chart from 'chart.js';
import { SrUiComponent, LoadStates } from 'react-strontium';
import ICourse from '../../models/ICourse';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IGroupAnalysis from '../../interfaces/IGroupAnalysis';
import BarChart from '../controls/BarChart';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';

interface IGroupAnalyticsTrendsProps {
  groupId: number;
  groupType: string;
  courses: ICourse[];
  loading: LoadStates;
  analytics: IGroupAnalysis;
}

interface IGroupAnalyticsTrendsState {}

interface ISeriesAnalysisInfo {
  course: ICourse;
  analysis: ISeriesAnalysis;
}

export default class GroupAnalyticsTrends extends SrUiComponent<
  IGroupAnalyticsTrendsProps,
  IGroupAnalyticsTrendsState
> {
  topPresentationsWithSlides() {
    return this.getTrendData(
      'Total Presentations',
      (a, b) => b.analysis.lecturesWithSlides - a.analysis.lecturesWithSlides,
      (i) => i.analysis.lecturesWithSlides,
      'rgba(18,52,86,0.1)',
      'rgba(18,52,86,1)'
    );
  }

  topSlidesPresented() {
    return this.getTrendData(
      'Total Segments Presented',
      (a, b) => b.analysis.totalSlides - a.analysis.totalSlides,
      (i) => i.analysis.totalSlides,
      'rgba(172,190,163,0.1)',
      'rgba(172,190,163,1)'
    );
  }

  topUniqueSlideViews() {
    return this.getTrendData(
      'Unique Segment Views',
      (a, b) => b.analysis.uniqueSlideViews - a.analysis.uniqueSlideViews,
      (i) => i.analysis.uniqueSlideViews,
      'rgba(255,144,0,0.1)',
      'rgba(255,144,0,1)'
    );
  }

  topNotesOnSlides() {
    return this.getTrendData(
      'Total Notes on Segments',
      (a, b) => b.analysis.notesTaken - a.analysis.notesTaken,
      (i) => i.analysis.notesTaken,
      'rgba(18,52,86,0.1)',
      'rgba(18,52,86,1)'
    );
  }

  topWordCountFromNotes() {
    return this.getTrendData(
      'Total Word Count from Notes',
      (a, b) => b.analysis.totalWords - a.analysis.totalWords,
      (i) => i.analysis.totalWords,
      'rgba(172,190,163,0.1)',
      'rgba(172,190,163,1)'
    );
  }

  topAnnotationsMade() {
    return this.getTrendData(
      'Total Annotations on Segments',
      (a, b) => b.analysis.annotatationsMade - a.analysis.annotatationsMade,
      (i) => i.analysis.annotatationsMade,
      'rgba(255,144,0,0.1)',
      'rgba(255,144,0,1)'
    );
  }

  topAvgNotesPerPres() {
    return this.getTrendData(
      'Average Notes per Presentation',
      (a, b) => b.analysis.meanNotesPerLecture - a.analysis.meanNotesPerLecture,
      (i) => Math.round(i.analysis.meanNotesPerLecture),
      'rgba(18,52,86,0.1)',
      'rgba(18,52,86,1)'
    );
  }

  topAvgWordsPerNote() {
    return this.getTrendData(
      'Average Words per Note',
      (a, b) => b.analysis.meanWordsPerNote - a.analysis.meanWordsPerNote,
      (i) => Math.round(i.analysis.meanWordsPerNote),
      'rgba(172,190,163,0.1)',
      'rgba(172,190,163,1)'
    );
  }

  topWordsPerLecture() {
    return this.getTrendData(
      'Average Words per Presentation',
      (a, b) => b.analysis.meanWordsPerLecture - a.analysis.meanWordsPerLecture,
      (i) => Math.round(i.analysis.meanWordsPerLecture),
      'rgba(255,144,0,0.1)',
      'rgba(255,144,0,1)'
    );
  }

  topAnnotationsPerLecture() {
    return this.getTrendData(
      'Average Annotations per Presentation',
      (a, b) =>
        b.analysis.meanAnnotationsPerLecture -
        a.analysis.meanAnnotationsPerLecture,
      (i) => Math.round(i.analysis.meanAnnotationsPerLecture),
      'rgba(18,52,86,0.1)',
      'rgba(18,52,86,1)'
    );
  }

  getTrendData(
    label: string,
    sorter: (a: ISeriesAnalysisInfo, b: ISeriesAnalysisInfo) => number,
    mapper: (i: ISeriesAnalysisInfo) => number,
    backgroundColor?: string,
    borderColor?: string
  ): Chart.ChartData {
    let courses = this.props.courses;
    let courseData = courses
      .map((c) => {
        let sa = this.props.analytics.seriesData.filter(
          (sd) => sd.seriesId === c.id
        )[0];
        if (!sa) {
          return null;
        }
        return { course: c, analysis: sa };
      })
      .filter((d) => !!d);

    courseData = courseData.sort(sorter).slice(0, 10);

    return {
      labels: courseData.map((d) => d.course.name),
      datasets: [
        {
          label: label,
          hideInLegendAndTooltip: true,
          backgroundColor: backgroundColor || 'rgba(255,144,0,0.1)',
          borderColor: borderColor || 'rgba(255,144,0,1)',
          borderWidth: 1,
          fill: true,
          data: courseData.map(mapper),
        },
      ],
    };
  }

  performRender() {
    if (this.props.loading !== LoadStates.Succeeded) {
      return null;
    }

    if (!this.props.analytics) {
      return null;
    }

    return (
      <>
        <div className="group-analytics-trends presentation-analytics">
          <h4>{Localizer.get('Presentation Analytics')}</h4>
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Presentations with segments')}</strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.lecturesWithSlides}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topPresentationsWithSlides()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Total segments presented')}</strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.totalSlides}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topSlidesPresented()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Total unique segment views')}</strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.uniqueSlideViews}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topUniqueSlideViews()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
        </div>
        <div className="interaction-analytics">
          <h4>{Localizer.get('Notes & Annotation Analytics')}</h4>
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Total notes on segments made')}</strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.notesTaken}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topNotesOnSlides()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Total word count from notes')}</strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.totalWords}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topWordCountFromNotes()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>
                  {Localizer.get('Total annotations on segments made')}
                </strong>
              </p>
              <p className="group-analytics-value">
                {this.props.analytics.annotatationsMade}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topAnnotationsMade()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>
                  {Localizer.get('Average notes per presentation')}
                </strong>
              </p>
              <p className="group-analytics-value">
                {Math.round(this.props.analytics.meanNotesPerLecture)}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topAvgNotesPerPres()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>{Localizer.get('Average words per note')}</strong>
              </p>
              <p className="group-analytics-value">
                {Math.round(this.props.analytics.meanWordsPerNote)}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topAvgWordsPerNote()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>
                  {Localizer.get('Average words per presentation')}
                </strong>
              </p>
              <p className="group-analytics-value">
                {Math.round(this.props.analytics.meanWordsPerLecture)}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topWordsPerLecture()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-sm-3">
              <p>
                <strong>
                  {Localizer.get('Average annotations per presentation')}
                </strong>
              </p>
              <p className="group-analytics-value">
                {Math.round(this.props.analytics.meanAnnotationsPerLecture)}
              </p>
            </div>
            <div className="col-sm-9">
              <p>
                <strong>
                  {Localizer.getFormatted(
                    GENERAL_COMPONENT.TOP_COURSES_MEETINGS
                  )}
                </strong>
              </p>
              <BarChart
                data={this.topAnnotationsPerLecture()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.COURSE_MEETING
                )}
                yLabel="Value"
                hideLegend
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
