import React from 'react';
import moment from 'moment';
import isNull from 'lodash/isNull';
// TODO tech debt use timzone from userInformation, DateFormatUtil
import { SrUiComponent, QueryUtility } from 'react-strontium';
import ILectureOverview from '../../interfaces/ILectureOverview';
import ILecture from '../../models/ILecture';
import ICourse from '../../models/ICourse';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';

interface IStudentLectureOverviewProps {
  overview: ILectureOverview;
  lecture: ILecture;
  course: ICourse;
}

interface IStudentLectureOverviewState {}

export default class StudentLectureOverview extends SrUiComponent<
  IStudentLectureOverviewProps,
  IStudentLectureOverviewState
> {
  performRender() {
    const { lecture, overview, course } = this.props;

    if (isNull(overview)) return null;

    return (
      <>
        <h4>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              this.updateQuery(QueryUtility.buildQuery({ lecture: undefined }));
            }}
          >
            {Localizer.getFormatted(
              GENERAL_COMPONENT.YOUR_COURSE_MEETING_PARTICIPATION
            )}
          </a>{' '}
          /{' '}
          {lecture.name ||
            Localizer.getFormatted(
              GENERAL_COMPONENT.UNNAMED_LECTURE_PRESENTATION
            )}
        </h4>
        <div className="student-lecture-overview">
          <table className="analytics-table margin margin-top-md">
            <thead>
              <tr>
                <th>{Localizer.get('Segment')}</th>
                <th>{Localizer.get('Times viewed')}</th>
                <th>{Localizer.get('Words in notes')}</th>
                <th>{Localizer.get('Annotations made')}</th>
                <th>{Localizer.get('Poll asked')}</th>
                <th>{Localizer.get('Poll answered')}</th>
                <th>{Localizer.get('Question asked')}</th>
                <th>{Localizer.get('First viewed')}</th>
              </tr>
            </thead>
            <tbody>
              {(overview.slideDetails || [])
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
                        <a
                          onClick={() =>
                            this.navigate(
                              `course/${course.id}?menu=lectures&lecture=${lecture.id}&initialSlide=${s.slide}`
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
                      <td colSpan={7}>{Localizer.get('Segment not viewed')}</td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
}
