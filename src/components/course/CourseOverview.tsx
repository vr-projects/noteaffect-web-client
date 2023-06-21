import * as React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  SrAppMessage,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import {
  COURSE_DETAIL_COMPONENT,
  GENERAL_COMPONENT,
} from '../../version/versionConstants';
import AppMappers from '../../mappers/AppMappers';
import Localizer from '../../utilities/Localizer';
import IUserPermissions from '../../interfaces/IUserPermissions';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import LecturesUtil from '../../utilities/LecturesUtil';
import ErrorUtil from '../../utilities/ErrorUtil';
import IStudentOverview from '../../interfaces/IStudentOverview';
import StudentLectureOverview from './StudentLectureOverview';
import SeriesMetadata from '../shared/SeriesMetadata';
import SeriesParticipationTable from '../shared/SeriesParticipationTable';
import LecturePresentationParticipationTable from '../shared/LecturePresentationParticipationTable';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedCourseOverviewProps {
  isSecurityMode: boolean;
  isSecurityAppLoading: boolean;
  isSecurityCheckDone: boolean;
  userPermissions?: IUserPermissions;
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
}

interface ICourseOverviewProps {
  course: ICourse;
  lectureId: number;
}

interface ICourseOverviewState {
  lectures: ILecture[];
  overview: IStudentOverview;
  lecturesLoadState: LoadStates;
  overviewLoadState: LoadStates;
}

class CourseOverview extends SrUiComponent<
  ICourseOverviewProps & IConnectedCourseOverviewProps,
  ICourseOverviewState
> {
  initialState() {
    return {
      lectures: [],
      lecturesLoadState: LoadStates.Unloaded,
      overviewLoadState: LoadStates.Unloaded,
      overview: null,
    };
  }

  // Non-secure Series immediately load lectures
  onComponentMounted() {
    const { isSecurityMode, isSecurityCheckDone, course } = this.props;

    // initial mount
    if (!isSecurityMode) {
      this.loadLectures(course);
    }
    // mounting from tabbed navigation
    if (!this.securityAppCheckDone && isSecurityCheckDone && isSecurityMode) {
      this.securityAppCheckDone = true;
      this.loadLectures(course);
    }
  }

  // Secured Series for Safari and Firefox require user to click alert popup
  // This allows Redux store to pass through changed flags, allow API call after check done
  private securityAppCheckDone = false;
  onNewProps(props) {
    const { isSecurityMode, isSecurityCheckDone, course } = props;
    if (!this.securityAppCheckDone && isSecurityCheckDone && isSecurityMode) {
      this.securityAppCheckDone = true;
      this.loadLectures(course);
    }
  }

  getHandles() {
    return [AppBroadcastEvents.LectureUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    // TODO refactor, not listening for action type
    const { course } = this.props;
    if (course && msg.data.courseId === course.id) {
      this.loadLectures(course);
    }
  }

  filterLectures(lectures: ILecture[]) {
    return LecturesUtil.sortedByDate(
      (lectures || []).filter((l) => l.started !== null)
    );
  }

  async loadLectures(series: ICourse) {
    const { lecturesLoadState, overviewLoadState } = this.state;
    const { course } = this.props;
    if (
      !series ||
      lecturesLoadState === LoadStates.Loading ||
      overviewLoadState === LoadStates.Loading
    ) {
      return;
    }

    if (!this.mounted()) {
      return;
    }

    try {
      this.setPartial({ lecturesLoadState: LoadStates.Loading });
      const lecturesResp = await ApiHelpers.read(
        `series/${series.id}/lectures`
      );

      if (!lecturesResp.good) {
        throw new Error(
          Localizer.get('There was an error getting your presentations')
        );
      }
      if (!isEmpty(lecturesResp.errors)) {
        ErrorUtil.throwErrorMessage(lecturesResp.errors);
      }

      if (course && course.id === series.id) {
        const lectures = JSON.parse(lecturesResp.data);

        this.setPartial({
          lectures: lectures,
          lecturesLoadState: LoadStates.Succeeded,
        });

        try {
          this.setPartial({ overviewLoadState: LoadStates.Loading });
          const overviewResp = await ApiHelpers.read(
            `series/${series.id}/data/overview`,
            undefined,
            { contentType: undefined }
          );

          if (!overviewResp.good) {
            throw new Error(
              Localizer.get('There was an error getting your overview data')
            );
          }

          if (!isEmpty(overviewResp.errors)) {
            ErrorUtil.throwErrorMessage(overviewResp.errors);
          }

          this.setPartial({
            overviewLoadState: LoadStates.Succeeded,
            overview: JSON.parse(overviewResp.data),
          });
          return;
        } catch (error) {
          console.error(error);
          this.setPartial({
            overviewLoadState: LoadStates.Failed,
          });
        }
      }
    } catch (error) {
      console.error(error);
      this.setPartial({
        lecturesLoadState: LoadStates.Failed,
      });
    }
  }

  performRender() {
    const {
      isCorpVersion,
      course,
      lectureId,
      userPermissions: { isAdmin, isDepartmentAdmin, instructorOnly },
    } = this.props;
    const {
      lecturesLoadState,
      overviewLoadState,
      lectures,
      overview,
    } = this.state;
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

    const hideTopTable =
      isCorpVersion && !isAdmin && !isDepartmentAdmin && !instructorOnly;

    if (isNull(course)) return null;

    return (
      <div className="course-overview">
        <div className="">
          <h3>{Localizer.getFormatted(COURSE_DETAIL_COMPONENT.TITLE)} </h3>
          {lecturesLoadState !== LoadStates.Succeeded && (
            <LoadIndicator
              state={lecturesLoadState}
              loadingMessage={Localizer.getFormatted(
                COURSE_DETAIL_COMPONENT.LECTURES_LOADING
              )}
              errorMessage={Localizer.getFormatted(
                COURSE_DETAIL_COMPONENT.LECTURES_ERROR
              )}
            />
          )}

          <div className="content-container">
            {lecturesLoadState === LoadStates.Succeeded && (
              <>
                {isCorpVersion && !isNull(course) && (
                  <div className="metadata-container mb-2">
                    <SeriesMetadata
                      series={course}
                      hasPresentations={!isEmpty(lectures)}
                      hasDocuments={!isEmpty(course.documents)}
                    />
                  </div>
                )}
                {overviewLoadState === LoadStates.Failed && (
                  <>
                    <Alert bsStyle="info">
                      {!hasLectures && (
                        <>
                          {Localizer.getFormatted(
                            GENERAL_COMPONENT.NO_PARTICIPATION
                          )}
                          <br />
                        </>
                      )}
                      {Localizer.getFormatted(
                        COURSE_DETAIL_COMPONENT.OVERVIEW_ERROR
                      )}
                    </Alert>
                  </>
                )}
                {overviewLoadState === LoadStates.Succeeded && !hasLectures && (
                  <>
                    <Alert bsStyle="info">
                      {Localizer.getFormatted(
                        GENERAL_COMPONENT.NO_PARTICIPATION
                      )}
                    </Alert>
                  </>
                )}

                {hasLectures && !isNull(overview) && (
                  <div>
                    {showStudentLectureOverview ? (
                      <>
                        <StudentLectureOverview
                          overview={studentLectureOverview}
                          lecture={studentLecture}
                          course={course}
                        />
                      </>
                    ) : (
                      <>
                        {hideTopTable && (
                          <SeriesParticipationTable
                            overview={overview}
                            filteredLectures={filteredLectures}
                          />
                        )}
                        <LecturePresentationParticipationTable
                          overview={overview}
                          filteredLectures={filteredLectures}
                          courseId={course.id}
                        />
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect<IConnectedCourseOverviewProps, {}, ICourseOverviewProps>(
  AppMappers.AppMapper
)(CourseOverview);
