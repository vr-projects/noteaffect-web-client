import * as React from 'react';
import isNull from 'lodash/isNull';
import { Alert } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import IStudentOverview from '../../../interfaces/IStudentOverview';
import {
  GENERAL_COMPONENT,
  PARTICIPANT_OVERVIEW_COMPONENT,
} from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import LecturesUtil from '../../../utilities/LecturesUtil';
import IUser from '../../../models/IUser';
import ParticipantLectureOverview from './ParticipantLectureOverview';
import SeriesParticipationTable from '../../shared/SeriesParticipationTable';
import LecturePresentationParticipationTable from '../../shared/LecturePresentationParticipationTable';

interface IParticipantOverviewProps {
  user: IUser;
  course: ICourse;
  lectures: ILecture[];
  lectureId: number;
  overview: IStudentOverview;
}

interface IParticipantOverviewState {}

/** Note - similar to CourseDetail component */
export default class ParticipantOverview extends SrUiComponent<
  IParticipantOverviewProps,
  IParticipantOverviewState
> {
  filterLectures(lectures: ILecture[]) {
    return LecturesUtil.sortedByDate(
      (lectures || []).filter((l) => l.started != null)
    );
  }

  performRender() {
    const { course, lectures, overview, lectureId } = this.props;

    const filteredLectures = this.filterLectures(lectures);
    const hasLectures = filteredLectures.length > 0;

    const studentLectureOverview =
      lectureId && !isNull(overview)
        ? overview.lectureOverviews.filter((l) => l.lectureId === lectureId)[0]
        : null;
    const studentLecture =
      lectureId && !isNull(overview)
        ? filteredLectures.filter((l) => l.id === this.props.lectureId)[0]
        : null;
    const showStudentLectureOverview =
      !isNull(studentLectureOverview) && !isNull(studentLecture);

    return (
      <div className="participant-overview">
        {!hasLectures && (
          <Alert bsStyle="info">
            {Localizer.getFormatted(GENERAL_COMPONENT.NO_PARTICIPATION)}
          </Alert>
        )}

        {hasLectures && !overview && (
          <Alert bsStyle="warning">
            {Localizer.getFormatted(PARTICIPANT_OVERVIEW_COMPONENT.ERROR)}
          </Alert>
        )}

        {hasLectures && !!overview && (
          <>
            {showStudentLectureOverview ? (
              <ParticipantLectureOverview
                overview={studentLectureOverview}
                lecture={studentLecture}
                course={course}
              />
            ) : (
              <>
                <SeriesParticipationTable
                  overview={overview}
                  filteredLectures={filteredLectures}
                />
                <LecturePresentationParticipationTable
                  overview={overview}
                  filteredLectures={filteredLectures}
                  courseId={course.id}
                />
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
