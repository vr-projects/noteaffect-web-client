import * as React from 'react';
import Chart from 'chart.js';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, LoadStates } from 'react-strontium';
import {
  GENERAL_COMPONENT,
  LECTURE_ENGAGEMENT_COMPONENT,
} from '../../version/versionConstants';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import ISeriesStudentsOverview from '../../interfaces/ISeriesStudentsOverview';
import ILectureAnalysis from '../../interfaces/ILectureAnalysis';
import ILectureOverview from '../../interfaces/ILectureOverview';
import Localizer from '../../utilities/Localizer';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import LecturesUtil from '../../utilities/LecturesUtil';
import EngagementUtils from '../../utilities/EngagementUtils';
import LineChart from '../controls/LineChart';
import EngagementPie from './EngagementPie';
import EngagementParticipant from './EngagementParticipant';

interface ILectureEngagementProps {
  course: ICourse;
  lectureId: number;
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
  overviews: ISeriesStudentsOverview;
  isDepartment: boolean;
  loading: LoadStates;
}

interface ILectureEngagementState {
  sortBy: string;
}

export default class LectureEngagement extends SrUiComponent<
  ILectureEngagementProps,
  ILectureEngagementState
> {
  private _ref: HTMLDivElement;

  initialState(): ILectureEngagementState {
    return { sortBy: 'best' };
  }

  getSlideData(analysis: ILectureAnalysis): Chart.ChartData {
    return {
      labels: analysis.slideAnalyses
        .sort((a, b) => a.slide - b.slide)
        .map(
          (d) =>
            `${Localizer.getFormatted(GENERAL_COMPONENT.SEGMENT)} ${d.slide}`
        ),
      datasets: [
        {
          label: 'Weighted Note Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderColor: '#ACBEA3',
          borderWidth: 1,
          fill: true,
          data: analysis.slideAnalyses.map((d) =>
            EngagementUtils.weightedNoteRate(d.rates)
          ),
        },
        {
          label: 'Weighted Annotation Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderColor: '#FF9000',
          borderWidth: 1,
          fill: true,
          data: analysis.slideAnalyses.map((d) =>
            EngagementUtils.weightedAnnotationRate(d.rates)
          ),
        },
        {
          label: 'Weighted View Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderColor: '#123456',
          borderWidth: 2,
          fill: true,
          data: analysis.slideAnalyses.map((d) =>
            EngagementUtils.weightedViewRate(d.rates)
          ),
        },
      ],
    };
  }

  hasQuestions(analysis: ILectureAnalysis) {
    return analysis.slideAnalyses.filter((s) => s.questionAsked).length > 0;
  }

  getQuestionData(analysis: ILectureAnalysis): Chart.ChartData {
    const slides = analysis.slideAnalyses.filter((s) => s.questionAsked);

    return {
      labels: slides.map((d) => `Question for Segment ${d.slide}`),
      datasets: [
        {
          label: 'Answer Rate',
          hideInLegendAndTooltip: true,
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderColor: '#ACBEA3',
          borderWidth: 1,
          fill: true,
          data: slides.map((d) => d.rates.questionsAnswered),
        },
      ],
    };
  }

  getParticipatingUsers() {
    const { overviews, lectureId, course } = this.props;
    const { sortBy } = this.state;
    const participating = overviews.studentOverviews
      .filter(
        (so) =>
          so.lectureOverviews.filter((lo) => lo.lectureId === lectureId)[0]
            .participated
      )
      .map((p) => p.userId);
    let participants = ParticipantsUtil.sort(
      course.participants.filter((p) => participating.indexOf(p.userId) !== -1),
      false,
      true
    ).map((p) => {
      return {
        user: p,
        overview: overviews.studentOverviews
          .filter((so) => so.userId === p.userId)[0]
          .lectureOverviews.filter((lo) => lo.lectureId === lectureId)[0],
      };
    });

    if (sortBy === 'name') {
      return participants;
    }

    return participants.sort((a, b) => {
      if (sortBy === 'worst') {
        return (
          this.overallParticipation(a.overview) -
          this.overallParticipation(b.overview)
        );
      }
      return (
        this.overallParticipation(b.overview) -
        this.overallParticipation(a.overview)
      );
    });
  }

  overallParticipation(overview: ILectureOverview) {
    return (
      overview.viewedPercentile +
      overview.notedPercentile +
      overview.annotatedPercentile +
      overview.questionsAnsweredPercentile
    );
  }

  getNonParticipatingUsers() {
    const { overviews, lectureId, course } = this.props;
    const nonParticipating = overviews.studentOverviews
      .filter((so) => {
        let lecture = so.lectureOverviews.filter(
          (lo) => lo.lectureId === lectureId
        )[0];
        return !lecture.participated && lecture.activeUser;
      })
      .map((p) => p.userId);
    return ParticipantsUtil.sort(
      course.participants.filter(
        (p) => nonParticipating.indexOf(p.userId) !== -1
      ),
      false
    );
  }

  getNonActiveUsers() {
    const { overviews, lectureId, course } = this.props;
    const nonParticipating = overviews.studentOverviews
      .filter((so) => {
        let lecture = so.lectureOverviews.filter(
          (lo) => lo.lectureId === lectureId
        )[0];
        return !lecture.activeUser;
      })
      .map((p) => p.userId);
    return ParticipantsUtil.sort(
      course.participants.filter(
        (p) => nonParticipating.indexOf(p.userId) !== -1
      ),
      false
    );
  }

  performRender() {
    const {
      loading,
      course,
      lectureId,
      analytics,
      overviews,
      lectures,
      isDepartment,
    } = this.props;
    const { sortBy } = this.state;

    if (
      loading !== LoadStates.Succeeded ||
      !lectureId ||
      !analytics ||
      !overviews
    ) {
      return null;
    }

    const lecture = lectures.filter((l) => l.id === lectureId)[0];

    if (!lecture) {
      return null;
    }

    const lectureAnalysis = analytics.lectureAnalyses.filter(
      (la) => la.lectureId === lectureId
    )[0];
    if (!lectureAnalysis) {
      return null;
    }

    if (lectureAnalysis.slideAnalyses.length === 0) {
      return (
        <div className="lecture-engagement">
          <Alert bsStyle="warning">
            {Localizer.getFormatted(LECTURE_ENGAGEMENT_COMPONENT.NO_SEGMENTS)}
          </Alert>
        </div>
      );
    }

    const participating = this.getParticipatingUsers();
    const nonParticipating = this.getNonParticipatingUsers();
    const nonActive = this.getNonActiveUsers();

    return (
      <div
        className="lecture-engagement"
        ref={(r) => {
          if (r && !this._ref) {
            this._ref = r;
            window.scrollTo(0, 0);
          }
        }}
      >
        <p className="helper-message">
          {Localizer.get('Presented')} {LecturesUtil.formattedStart(lecture)}
        </p>
        <div className="row">
          <div className="col-sm-4">
            <h4>{Localizer.get('Participation Rate')}</h4>
            <span className="helper-message">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.PARTICIPATION_PRESENTATION_DESCRIPTION
              )}
            </span>
            <EngagementPie
              percent={lectureAnalysis.rates.participation * 100}
            />
          </div>
          <div className="col-sm-4">
            <h4>{Localizer.get('Engagement Rate')}</h4>
            <span className="helper-message">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.ENGAGEMENT_PRESENTATION_DESCRIPTION
              )}
            </span>
            <EngagementPie
              percent={
                EngagementUtils.weightedEngagement(lectureAnalysis.rates) * 100
              }
            />
          </div>
          <div className="col-sm-4">
            <h4>{Localizer.get('Poll Answer Rate')}</h4>
            <span className="helper-message">
              {Localizer.getFormatted(
                GENERAL_COMPONENT.POLL_PRESENTATION_DESCRIPTION
              )}
            </span>
            <EngagementPie
              percent={lectureAnalysis.rates.questionsAnswered * 100}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-6">
            <h4>{Localizer.get('Segment-by-segment Engagement')}</h4>
            <LineChart
              data={this.getSlideData(lectureAnalysis)}
              xLabel={Localizer.getFormatted(GENERAL_COMPONENT.SEGMENT)}
              yLabel="Rate"
              percentLabels
              maxYValue={1}
              stacked
            />
          </div>
          <div className="col-sm-6">
            <h4>{Localizer.get('Poll Answer Rates')}</h4>
            {this.hasQuestions(lectureAnalysis) ? (
              <LineChart
                data={this.getQuestionData(lectureAnalysis)}
                xLabel={GENERAL_COMPONENT.POLL_SEGMENT}
                yLabel="Rate"
                percentLabels
                maxYValue={1}
                stacked
              />
            ) : (
              <Alert bsStyle="info">
                {Localizer.getFormatted(LECTURE_ENGAGEMENT_COMPONENT.NO_POLLS)}
              </Alert>
            )}
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-sm-8">
            <h4>
              {Localizer.getFormatted(
                LECTURE_ENGAGEMENT_COMPONENT.PARTICIPANTS
              )}{' '}
              - {participating.length}/{overviews.studentOverviews.length}
            </h4>
            <div className="margin margin-bottom-sm">
              <label htmlFor="participant-sort-by">
                {Localizer.get('Sort by: ')}
              </label>{' '}
              <select
                id="participant-sort-by"
                name="participant-sort-by"
                value={sortBy}
                onChange={(e) => this.setPartial({ sortBy: e.target.value })}
              >
                <option value="best">Highest to lowest performing</option>
                <option value="worst">Lowest to highest performing</option>
                <option value="name">Name</option>
              </select>
            </div>
            {participating.length === 0 ? (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  LECTURE_ENGAGEMENT_COMPONENT.NO_PARTICIPATION
                )}
              </Alert>
            ) : (
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>
                      {Localizer.getFormatted(
                        GENERAL_COMPONENT.STUDENT_PARTICIPANT
                      )}
                    </th>
                    <th>{Localizer.get('Views')}</th>
                    <th>{Localizer.get('Notes')}</th>
                    <th>{Localizer.get('Annotations')}</th>
                    <th>{Localizer.get('Polls')}</th>
                  </tr>
                </thead>
                <tbody>
                  {participating.map((p) => (
                    <EngagementParticipant
                      key={p.user.userId.toString()}
                      user={p.user}
                      overview={p.overview}
                      analysis={lectureAnalysis}
                      course={course}
                      lectureId={lectureId}
                      isDepartment={isDepartment}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="col-sm-4">
            <h4>
              {Localizer.getFormatted(
                LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING_TITLE
              )}{' '}
              - {nonParticipating.length}/{overviews.studentOverviews.length}
            </h4>
            {nonParticipating.length > 0 ? (
              nonParticipating.map((p) => (
                <div key={p.userId.toString()}>
                  {ParticipantsUtil.displayName(p)}
                </div>
              ))
            ) : (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  LECTURE_ENGAGEMENT_COMPONENT.NON_PARTICIPATING
                )}
              </Alert>
            )}
            <h4>
              {Localizer.getFormatted(
                LECTURE_ENGAGEMENT_COMPONENT.NOT_IN_COURSE_MEETING
              )}{' '}
              - {nonActive.length}/{overviews.studentOverviews.length}
            </h4>
            {nonActive.length > 0 ? (
              nonActive.map((p) => (
                <div key={p.userId.toString()}>
                  {isDepartment ? (
                    <>{ParticipantsUtil.displayName(p)}</>
                  ) : (
                    <a
                      onClick={() =>
                        this.navigate(
                          `instructor/course/${course.id}?menu=participants&user=${p.userId}`
                        )
                      }
                    >
                      {ParticipantsUtil.displayName(p)}
                    </a>
                  )}
                </div>
              ))
            ) : (
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  LECTURE_ENGAGEMENT_COMPONENT.NOT_YET_ACTIVE
                )}
              </Alert>
            )}
          </div>
        </div>
      </div>
    );
  }
}
