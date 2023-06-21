import * as React from 'react';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, LoadStates } from 'react-strontium';
import EngagementPie from '../shared/EngagementPie';
import ICourse from '../../models/ICourse';
import {
  GENERAL_COMPONENT,
  GROUP_ENGAGEMENT_TRENDS_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import EngagementUtils from '../../utilities/EngagementUtils';
import IGroupAnalysis from '../../interfaces/IGroupAnalysis';
import BarChart from '../controls/BarChart';

interface IGroupEngagementTrendsProps {
  groupId: number;
  groupType: string;
  courses: ICourse[];
  loading: LoadStates;
  analytics: IGroupAnalysis;
}

interface IGroupEngagementTrendsState {}

export default class GroupEngagementTrends extends SrUiComponent<
  IGroupEngagementTrendsProps,
  IGroupEngagementTrendsState
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
    let courses = this.props.courses;
    let courseData = courses
      .map((c) => {
        let sa = this.props.analytics.seriesData.filter(
          (sd) => sd.seriesId === c.id
        )[0];
        if (!sa) {
          return null;
        }
        return {
          course: c,
          analysis: sa,
          engagement: EngagementUtils.weightedEngagement(sa.rates),
        };
      })
      .filter((d) => !!d);

    courseData = courseData
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    return {
      labels: courseData.map((d) => d.course.name),
      datasets: [
        {
          label: 'Engagement Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(18,52,86,0.1)',
          borderColor: 'rgba(18,52,86,1)',
          borderWidth: 1,
          fill: true,
          data: courseData.map((d) => d.engagement),
        },
      ],
    };
  }

  getParticipationTrendData(): Chart.ChartData {
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

    courseData = courseData
      .sort(
        (a, b) =>
          b.analysis.rates.participation - a.analysis.rates.participation
      )
      .slice(0, 10);

    return {
      labels: courseData.map((d) => d.course.name),
      datasets: [
        {
          label: 'Active User Participation Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(172,190,163,0.1)',
          borderColor: 'rgba(172,190,163,1)',
          borderWidth: 1,
          fill: true,
          data: courseData.map((d) => d.analysis.rates.participation),
        },
      ],
    };
  }

  getQuestionTrends(): Chart.ChartData {
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

    courseData = courseData
      .sort(
        (a, b) =>
          b.analysis.rates.questionsAnswered -
          a.analysis.rates.questionsAnswered
      )
      .slice(0, 10);

    return {
      labels: courseData.map((d) => d.course.name),
      datasets: [
        {
          label: 'Active User Participation Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(255,144,0,0.1)',
          borderColor: 'rgba(255,144,0,1)',
          borderWidth: 1,
          fill: true,
          data: courseData.map((d) => d.analysis.rates.questionsAnswered),
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
            <EngagementPie
              percent={this.props.analytics.rates.participation * 100}
            />
          </div>
          <div className="col-sm-8">
            <h5>
              {Localizer.getFormatted(
                GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_PARTICIPATION
              )}
            </h5>
            <BarChart
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
                EngagementUtils.weightedEngagement(this.props.analytics.rates) *
                100
              }
            />
          </div>
          <div className="col-sm-8">
            <h5>
              {Localizer.getFormatted(
                GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_ENGAGEMENT
              )}
            </h5>
            <BarChart
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
            {this.props.analytics.questionsAsked === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  GROUP_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS
                )}
              </Alert>
            ) : (
              <EngagementPie
                percent={this.props.analytics.rates.questionsAnswered * 100}
              />
            )}
          </div>
          <div className="col-sm-8">
            <h5>
              {Localizer.getFormatted(
                GROUP_ENGAGEMENT_TRENDS_COMPONENT.TOP_COURSES_MEETINGS_POLLING
              )}
            </h5>
            {this.props.analytics.questionsAsked === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  GROUP_ENGAGEMENT_TRENDS_COMPONENT.NO_POLLS
                )}
              </Alert>
            ) : (
              <BarChart
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
