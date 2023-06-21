import * as React from 'react';
import { Alert } from 'react-bootstrap';
import Chart from 'chart.js';
import { SrUiComponent, LoadStates } from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import ISeriesStudentsOverview from '../../interfaces/ISeriesStudentsOverview';
import {
  GENERAL_COMPONENT,
  COURSE_ENGAGEMENT_TRENDS_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import EngagementUtils from '../../utilities/EngagementUtils';
import LecturesUtil from '../../utilities/LecturesUtil';
import EngagementPie from './EngagementPie';
import LineChart from '../controls/LineChart';

interface ICourseEngagementTrendsProps {
  course: ICourse;
  lectureId: number;
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
  overviews: ISeriesStudentsOverview;
  loading: LoadStates;
}

interface ICourseEngagementTrendsState {}

export default class CourseEngagementTrends extends SrUiComponent<
  ICourseEngagementTrendsProps,
  ICourseEngagementTrendsState
> {
  initialState() {
    return {
      lectures: [],
      analytics: null,
      overviews: null,
      loading: LoadStates.Unloaded,
    };
  }

  getTrendData(): Chart.ChartData {
    const { lectures, analytics } = this.props;
    const lectureData = lectures
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

    return {
      labels: lectureData.map((d) => [
        LecturesUtil.fallbackName(d.lecture),
        LecturesUtil.formattedStart(d.lecture, true),
      ]),
      datasets: [
        {
          label: 'Engagement Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(18,52,86,0.1)',
          borderColor: 'rgba(18,52,86,1)',
          borderWidth: 1,
          fill: true,
          data: lectureData.map((d) =>
            EngagementUtils.weightedEngagement(d.analysis.rates)
          ),
        },
      ],
    };
  }

  getParticipationTrendData(): Chart.ChartData {
    const { lectures, analytics } = this.props;
    const lectureData = lectures
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

    return {
      labels: lectureData.map((d) => [
        LecturesUtil.fallbackName(d.lecture),
        LecturesUtil.formattedStart(d.lecture, true),
      ]),
      datasets: [
        {
          label: 'Active User Participation Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(172,190,163,0.1)',
          borderColor: 'rgba(172,190,163,1)',
          borderWidth: 1,
          fill: true,
          data: lectureData.map((d) => d.analysis.rates.participation),
        },
      ],
    };
  }

  getQuestionTrends(): Chart.ChartData {
    const { lectures, analytics } = this.props;
    const lectureData = lectures
      .map((l) => {
        let la = analytics.lectureAnalyses.filter(
          (a) => a.lectureId === l.id
        )[0];
        if (!la || la.questionsAsked === 0) {
          return null;
        }
        return { lecture: l, analysis: la };
      })
      .filter((d) => !!d);

    return {
      labels: lectureData.map((d) => [
        LecturesUtil.fallbackName(d.lecture),
        LecturesUtil.formattedStart(d.lecture, true),
      ]),
      datasets: [
        {
          label: 'Active User Participation Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(255,144,0,0.1)',
          borderColor: 'rgba(255,144,0,1)',
          borderWidth: 1,
          fill: true,
          data: lectureData.map((d) => d.analysis.rates.questionsAnswered),
        },
      ],
    };
  }

  performRender() {
    const { loading, lectureId, analytics, overviews, lectures } = this.props;
    if (loading !== LoadStates.Succeeded) {
      return null;
    }

    if (lectureId) {
      return null;
    }

    if (!analytics || !overviews || !lectures || lectures.length === 0) {
      return null;
    }

    return (
      <div className="course-trends">
        <h4>{Localizer.get('Participation')}</h4>
        <span className="helper-message">
          {Localizer.getFormatted(
            GENERAL_COMPONENT.PARTICIPATION_PRESENTATIONS_DESCRIPTION
          )}
        </span>
        <div className="row">
          <div className="col-sm-4">
            <h5>{Localizer.get('Average Participation Rate')}</h5>
            <EngagementPie percent={analytics.rates.participation * 100} />
          </div>
          <div className="col-sm-8">
            <h5>{Localizer.get('Participation Trends')}</h5>
            <LineChart
              data={this.getParticipationTrendData()}
              xLabel={Localizer.getFormatted(
                GENERAL_COMPONENT.LECTURE_PRESENTATION
              )}
              yLabel="Rate"
              percentLabels
              maxYValue={1}
              hideLegend
            />
          </div>
        </div>
        <hr />
        <h4>{Localizer.get('Engagement')}</h4>
        <span className="helper-message">
          {Localizer.getFormatted(
            GENERAL_COMPONENT.ENGAGEMENT_PRESENTATIONS_DESCRIPTION
          )}
        </span>
        <div className="row">
          <div className="col-sm-4">
            <h5>{Localizer.get('Average Engagement Rate')}</h5>
            <EngagementPie
              percent={
                EngagementUtils.weightedEngagement(analytics.rates) * 100
              }
            />
          </div>
          <div className="col-sm-8">
            <h5>{Localizer.get('Engagement Trends')}</h5>
            <LineChart
              data={this.getTrendData()}
              xLabel={Localizer.getFormatted(
                GENERAL_COMPONENT.LECTURE_PRESENTATION
              )}
              yLabel="Rate"
              percentLabels
              maxYValue={1}
              hideLegend
            />
          </div>
        </div>
        <hr />
        <h4>{Localizer.get('Polling')}</h4>
        <span className="helper-message">
          {Localizer.getFormatted(
            GENERAL_COMPONENT.POLL_PRESENTATIONS_DESCRIPTION
          )}
        </span>
        <div className="row">
          <div className="col-sm-4">
            <h5>{Localizer.get('Polls Answered Average')}</h5>
            {analytics.questionsAsked === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  COURSE_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS
                )}
              </Alert>
            ) : (
              <EngagementPie
                percent={analytics.rates.questionsAnswered * 100}
              />
            )}
          </div>
          <div className="col-sm-8">
            <h5>{Localizer.get('Polls Answered Trends')}</h5>
            {analytics.questionsAsked === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  COURSE_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS
                )}
              </Alert>
            ) : (
              <LineChart
                data={this.getQuestionTrends()}
                xLabel={Localizer.getFormatted(
                  GENERAL_COMPONENT.LECTURE_PRESENTATION
                )}
                yLabel="Rate"
                percentLabels
                maxYValue={1}
                hideLegend
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
