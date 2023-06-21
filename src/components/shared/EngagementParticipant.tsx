import * as React from 'react';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILectureOverview from '../../interfaces/ILectureOverview';
import IParticipant from '../../models/IParticipant';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import ColorUtils from '../../utilities/ColorUtils';
import EngagementUtils from '../../utilities/EngagementUtils';
import ILectureAnalysis from '../../interfaces/ILectureAnalysis';
import Localizer from '../../utilities/Localizer';

interface IEngagementParticipantProps {
  course: ICourse;
  lectureId: number;
  user: IParticipant;
  overview: ILectureOverview;
  analysis: ILectureAnalysis;
  isDepartment: boolean;
}

interface IEngagementParticipantState {}

export default class EngagementParticpant extends SrUiComponent<
  IEngagementParticipantProps,
  IEngagementParticipantState
> {
  overallParticipation(overview: ILectureOverview) {
    return (
      (overview.viewedPercentile +
        overview.notedPercentile +
        overview.annotatedPercentile +
        overview.questionsAnsweredPercentile) /
      100.0 /
      4.0
    );
  }

  hasQuestions(analysis: ILectureAnalysis) {
    return this.questionsAsked(analysis) > 0;
  }

  questionsAsked(analysis: ILectureAnalysis) {
    return analysis.slideAnalyses.filter((s) => s.questionAsked).length;
  }

  performRender() {
    const { isDepartment } = this.props;
    let slidesLabel = this.props.overview.slides === 1 ? 'segment' : 'segments';
    let questionsLabel =
      this.questionsAsked(this.props.analysis) === 1 ? 'poll' : 'polls';

    return (
      <>
        {/* // TODO tech debt responsiveness, refactor to single component, color readability */}
        <tr className="engagement-participant">
          <td className="title">
            {isDepartment ? (
              <>{ParticipantsUtil.displayName(this.props.user)}</>
            ) : (
              <a
                onClick={() =>
                  this.navigate(
                    `instructor/course/${this.props.course.id}?menu=participants&user=${this.props.user.userId}`
                  )
                }
              >
                {ParticipantsUtil.displayName(this.props.user)}
              </a>
            )}
          </td>
          <td
            className=""
            style={{
              color: ColorUtils.valueToRedGreenRgbStyle(
                this.props.overview.viewedPercentile / 100.0
              ),
            }}
          >
            <p>
              {this.props.overview.slidesViewed} of {this.props.overview.slides}{' '}
              {slidesLabel}
            </p>
            <p className="sub-title">
              {EngagementUtils.percentileRanking(
                this.props.overview.viewedPercentile
              )}
            </p>
          </td>
          <td
            className=""
            style={{
              color: ColorUtils.valueToRedGreenRgbStyle(
                this.props.overview.notedPercentile / 100.0
              ),
            }}
          >
            <p>
              {this.props.overview.slidesNoted} of {this.props.overview.slides}{' '}
              {slidesLabel}
            </p>
            <p className="sub-title">
              {EngagementUtils.percentileRanking(
                this.props.overview.notedPercentile
              )}
            </p>
          </td>
          <td
            className=""
            style={{
              color: ColorUtils.valueToRedGreenRgbStyle(
                this.props.overview.annotatedPercentile / 100.0
              ),
            }}
          >
            <p>
              {this.props.overview.slidesAnnotated} of{' '}
              {this.props.overview.slides} {slidesLabel}
            </p>
            <p className="sub-title">
              {EngagementUtils.percentileRanking(
                this.props.overview.annotatedPercentile
              )}
            </p>
          </td>
          {this.hasQuestions(this.props.analysis) ? (
            <td
              className=""
              style={{
                color: ColorUtils.valueToRedGreenRgbStyle(
                  this.props.overview.questionsAnsweredPercentile / 100.0
                ),
              }}
            >
              <p>
                Answered {this.props.overview.questionsAnswered} of{' '}
                {this.questionsAsked(this.props.analysis)} {questionsLabel}
              </p>
              <p className="sub-title">
                {EngagementUtils.percentileRanking(
                  this.props.overview.questionsAnsweredPercentile
                )}
              </p>
            </td>
          ) : (
            <td className="sub-title">{Localizer.get('No polls asked')}</td>
          )}
        </tr>
      </>
    );
  }
}
