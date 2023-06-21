import React from 'react';
import moment from 'moment';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import ILectureOverview from '../../../interfaces/ILectureOverview';
import ILecture from '../../../models/ILecture';
import ICourse from '../../../models/ICourse';
import { GENERAL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';

interface IParticipantLectureOverviewProps {
  overview: ILectureOverview;
  lecture: ILecture;
  course: ICourse;
}

interface IParticipantLectureOverviewState {}

export default class ParticipantLectureOverview extends SrUiComponent<
  IParticipantLectureOverviewProps,
  IParticipantLectureOverviewState
> {
  performRender() {
    return (
      <div className="participant-lecture-overview">
        <h4>
          {/* // TODO tech debt a tag refactor */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              this.updateQuery(QueryUtility.buildQuery({ lecture: undefined }));
            }}
          >
            {Localizer.getFormatted(
              GENERAL_COMPONENT.COURSE_MEETING_PARTICIPATION
            )}
          </a>{' '}
          /{' '}
          {this.props.lecture.name ||
            Localizer.getFormatted(
              GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION
            )}
        </h4>
        <div className="student-lecture-overview">
          <table className="analytics-table margin margin-top-md">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Times viewed</th>
                <th>Words in notes</th>
                <th>Annotations made</th>
                <th>Poll asked</th>
                <th>Poll answered</th>
                <th>Question asked</th>
                <th>First viewed</th>
              </tr>
            </thead>
            <tbody>
              {(this.props.overview.slideDetails || [])
                .sort((a, b) => a.slide - b.slide)
                .map((s) => (
                  <tr
                    key={s.slide}
                    className={
                      'lecture-overview ' +
                      (s.totalViews === 0 ? 'non-participant' : '')
                    }
                  >
                    <td>
                      <p className="list-menu-title">
                        {/* // TODO tech debt a tag refactor */}
                        <a
                          onClick={() =>
                            this.navigate(
                              `instructor/course/${this.props.course.id}?menu=lectures&lecture=${this.props.lecture.id}&initialSlide=${s.slide}`
                            )
                          }
                        >{`Segment ${s.slide}`}</a>
                      </p>
                    </td>
                    {s.totalViews > 0 ? (
                      <>
                        <td>{s.totalViews}</td>
                        <td>{s.noteWords}</td>
                        <td>{s.annotations}</td>
                        <td>
                          <input
                            type="checkbox"
                            readOnly
                            checked={s.pollAsked}
                          ></input>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            readOnly
                            checked={s.pollAnswered}
                          ></input>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            readOnly
                            checked={s.questionAsked}
                          ></input>
                        </td>
                        <td>
                          {s.totalViews > 0
                            ? moment(s.firstViewed * 1000).format(
                                'MM/DD/YYYY hh:mma'
                              )
                            : ''}
                        </td>
                      </>
                    ) : (
                      <td colSpan={7}>Segment not viewed</td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
