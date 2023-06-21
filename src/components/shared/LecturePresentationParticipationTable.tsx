import React from 'react';
import moment from 'moment';
// TODO tech debt use timzone from userInformation, DateFormatUtil
import isNull from 'lodash/isNull';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import {
  GENERAL_COMPONENT,
  GENERAL_TABLES,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ColorUtils from '../../utilities/ColorUtils';
import EngagementUtils from '../../utilities/EngagementUtils';
import IStudentOverview from '../../interfaces/IStudentOverview';
import ILectureOverview from '../../interfaces/ILectureOverview';
import ILecture from '../../models/ILecture';

interface ILecturePresentationParticipationTableProps {
  overview: IStudentOverview;
  filteredLectures: ILecture[];
  courseId: number;
  className?: string;
}
interface ILecturePresentationParticipationTableState {}

class LecturePresentationParticipationTable extends SrUiComponent<
  ILecturePresentationParticipationTableProps,
  ILecturePresentationParticipationTableState
> {
  lectureHasQuestions(lecture: ILectureOverview) {
    return (
      lecture.questionsAnswered +
        lecture.questionsNotAnswered +
        lecture.questionsMissed >
      0
    );
  }

  getRanking(value: number, participated: boolean) {
    return EngagementUtils.percentileRanking(value, participated);
  }

  openLectureDetails(e: React.MouseEvent<any>, id: number) {
    e.stopPropagation();
    e.preventDefault();
    this.updateQuery(QueryUtility.buildQuery({ lecture: id }));
  }

  performRender() {
    const { filteredLectures, overview, courseId } = this.props;

    if (isNull(overview)) return null;

    return (
      <div className="lecture-presentation-participation-table">
        <h4>
          {Localizer.getFormatted(
            GENERAL_TABLES.LECTURE_PRESENTATION_PARTICIPATION
          )}
        </h4>
        <div className="na-table-wrapper">
          <table className="analytics-table margin margin-top-md">
            <thead>
              <tr>
                <th>
                  {Localizer.getFormatted(
                    GENERAL_TABLES.LECTURES_PRESENTATIONS_VIEWED
                  )}
                </th>
                <th>{Localizer.get('Segments viewed')}</th>
                <th>{Localizer.get('Segments with notes taken')}</th>
                <th>{Localizer.get('Segments with annotations made')}</th>
                <th>{Localizer.get('Viewing Participation')}</th>
                <th>{Localizer.get('Note-taking Participation')}</th>
                <th>{Localizer.get('Annotating Participation')}</th>
                <th>{Localizer.get('Poll Answering Participation')}</th>
                <th>{Localizer.get('Details')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLectures.map((l) => {
                let filteredOverview = overview.lectureOverviews.filter(
                  (lo) => lo.lectureId === l.id
                )[0];
                if (!filteredOverview) {
                  return null;
                }
                return (
                  <tr
                    key={l.id.toString()}
                    className={
                      'lecture-overview ' +
                      (!filteredOverview.participated ? 'non-participant' : '')
                    }
                  >
                    <td>
                      <p className="list-menu-title">
                        <button
                          className="btn btn-link btn-table word-break-initial"
                          onClick={() =>
                            this.navigate(
                              `course/${courseId}?menu=lectures&lecture=${l.id}`
                            )
                          }
                        >
                          {l.name ||
                            Localizer.getFormatted(
                              GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION
                            )}
                        </button>
                      </p>
                      <p className="sub-title">
                        {moment(l.started * 1000).format(
                          'dddd, MMM Do YYYY, hh:mma'
                        )}
                      </p>
                    </td>
                    {filteredOverview.participated ? (
                      <>
                        <td>
                          {filteredOverview.slidesViewed} of{' '}
                          {filteredOverview.slides}
                        </td>
                        <td>{filteredOverview.slidesNoted}</td>
                        <td>{filteredOverview.slidesAnnotated}</td>
                        <td
                          style={{
                            color: ColorUtils.valueToRedGreenRgbStyle(
                              filteredOverview.viewedPercentile / 100.0
                            ),
                          }}
                        >
                          {this.getRanking(
                            filteredOverview.viewedPercentile,
                            filteredOverview.participated
                          )}
                        </td>
                        <td
                          style={{
                            color: ColorUtils.valueToRedGreenRgbStyle(
                              filteredOverview.notedPercentile / 100.0
                            ),
                          }}
                        >
                          {this.getRanking(
                            filteredOverview.notedPercentile,
                            filteredOverview.participated
                          )}
                        </td>
                        <td
                          style={{
                            color: ColorUtils.valueToRedGreenRgbStyle(
                              filteredOverview.annotatedPercentile / 100.0
                            ),
                          }}
                        >
                          {this.getRanking(
                            filteredOverview.annotatedPercentile,
                            filteredOverview.participated
                          )}
                        </td>
                        {this.lectureHasQuestions(filteredOverview) ? (
                          <td
                            style={{
                              color: ColorUtils.valueToRedGreenRgbStyle(
                                filteredOverview.questionsAnsweredPercentile /
                                  100.0
                              ),
                            }}
                          >
                            {this.getRanking(
                              filteredOverview.questionsAnsweredPercentile,
                              filteredOverview.participated
                            )}
                          </td>
                        ) : (
                          <td>{'No polls asked'}</td>
                        )}
                        {filteredOverview.slideDetails &&
                        filteredOverview.slideDetails.length > 0 ? (
                          <td
                            className="open-details-cell"
                            onClick={(e) => this.openLectureDetails(e, l.id)}
                          >
                            {/* // TODO tech debt improper use of a tag, refactor */}
                            <a>
                              <FaExternalLinkAlt />
                            </a>
                          </td>
                        ) : (
                          <td></td>
                        )}
                      </>
                    ) : filteredOverview.activeUser ? (
                      <td colSpan={8}>Did not participate</td>
                    ) : (
                      <td colSpan={8}>
                        {Localizer.getFormatted(
                          GENERAL_TABLES.NOT_YET_IN_COURSE_MEETING
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default LecturePresentationParticipationTable;
