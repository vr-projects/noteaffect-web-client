import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
  QueryUtility,
} from 'react-strontium';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import SeriesPresentationsLecturesLayout from '../shared/SeriesPresentationsLecturesLayout';
import Breadcrumb from '../controls/Breadcrumb';
import BreadcrumbLink from '../controls/BreadcrumbLink';
import Lectures from '../../utilities/LecturesUtil';
import SeriesMetadata from '../shared/SeriesMetadata';
import AppMappers from '../../mappers/AppMappers';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface ICourseLecturesProps {
  course: ICourse;
  lectureId: number;
  initialSlide: number;
}

interface IConnectedCourseLecturesProps {
  isCorpVersion?: boolean;
}

interface ICourseLecturesState {
  lectures: ILecture[];
  loading: LoadStates;
}

class CourseLectures extends SrUiComponent<
  ICourseLecturesProps & IConnectedCourseLecturesProps,
  ICourseLecturesState
> {
  initialState() {
    return { lectures: [], loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadLectures(this.props.course);
  }

  getHandles() {
    return [AppBroadcastEvents.LectureUpdated];
  }

  onAppMessage(msg: SrAppMessage) {
    // TODO - Tech Debt should look for listened broadcast event
    if (this.props.course && msg.data.courseId === this.props.course.id) {
      this.loadLectures(this.props.course, true);
    }
  }

  async loadLectures(course: ICourse, fromLectureUpdate: boolean = false) {
    if (!course || this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      const lecturesResp = await ApiHelpers.read(
        `series/${course.id}/lectures`
      );

      if (!this.mounted()) {
        return;
      }

      if (!lecturesResp.good) {
        throw new Error('Unable to get data');
      }

      if (this.props.course && this.props.course.id === course.id) {
        const lectures = this.sortedLectures(JSON.parse(lecturesResp.data));
        await this.setAsync({
          lectures: lectures,
          loading: LoadStates.Succeeded,
        });
        if (fromLectureUpdate) {
          let selected = this.selectedLecture();
          if (selected) {
            this.broadcast(AppBroadcastEvents.RefreshFrames, {
              lectureId: selected.id,
            });
          }
        }
      }
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  sortedLectures(lectures: ILecture[]): ILecture[] {
    return Lectures.sortedByDate(lectures);
  }

  onNewProps(props: ICourseLecturesProps) {
    if (
      props.course &&
      this.props.course &&
      props.course.id !== this.props.course.id
    ) {
      this.loadLectures(props.course);
    }
  }

  lecturesForView() {
    return (this.state.lectures || []).filter((l) => l.started != null);
  }

  returnToLectures() {
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: undefined, initialSlide: undefined })
    );
  }

  previousLecture(currentLecture: ILecture) {
    if (!currentLecture) {
      return null;
    }

    const lectures = this.lecturesForView();
    const idx = lectures.indexOf(currentLecture);

    if (idx > 0) {
      return lectures[idx - 1];
    }

    return null;
  }

  nextLecture(currentLecture: ILecture) {
    if (!currentLecture) {
      return null;
    }

    const lectures = this.lecturesForView();
    const idx = lectures.indexOf(currentLecture);

    if (idx < lectures.length - 1) {
      return lectures[idx + 1];
    }

    return null;
  }

  selectedLecture() {
    const { lectureId } = this.props;
    const { lectures } = this.state;
    if (!lectureId) {
      return null;
    }

    return lectures.find((f) => f.id === lectureId);
  }

  selectLecture(lec: ILecture) {
    this.updateQuery(QueryUtility.buildQuery({ lecture: lec.id }));
  }

  performRender() {
    const { isCorpVersion, course, lectureId, initialSlide } = this.props;
    const { loading, lectures } = this.state;
    const lecture = this.selectedLecture();
    const prev = this.previousLecture(lecture);
    const next = this.nextLecture(lecture);
    const lecturesForView = this.lecturesForView();

    if (isNull(course)) return null;

    return (
      <div className="course-lectures">
        <div className="p-0">
          <h3>
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!lecture}
                onClick={() => this.returnToLectures()}
              >
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.LECTURES_PRESENTATIONS
                )}
              </BreadcrumbLink>
              {lecture ? lecture.name : null}
            </Breadcrumb>
          </h3>
        </div>

        <LoadIndicator
          state={loading}
          errorMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.ERROR_LECTURES_PRESENTATIONS
          )}
          loadingMessage={Localizer.getFormatted(
            GENERAL_COMPONENT.LOADING_LECTURES_PRESENTATIONS
          )}
        />
        {lecturesForView.length > 0 || loading === LoadStates.Succeeded ? (
          lecturesForView.length > 0 ? (
            <SeriesPresentationsLecturesLayout
              course={course}
              lectures={this.lecturesForView()}
              lectureId={lectureId}
              initialSlide={initialSlide}
              isLecturerView={false}
            />
          ) : (
            <>
              {isCorpVersion && (
                <div className="metadata-container mb-2">
                  <SeriesMetadata
                    series={course}
                    hasPresentations={!isEmpty(lectures)}
                    hasDocuments={!isEmpty(course.documents)}
                  />
                </div>
              )}
              <Alert bsStyle="info" className="mt-1">
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.NONE_LECTURES_PRESENTATIONS_COURSE_MEETING
                )}
              </Alert>
            </>
          )
        ) : null}
      </div>
    );
  }
}

export default connect<IConnectedCourseLecturesProps, {}, ICourseLecturesProps>(
  AppMappers.VersionMapper
)(CourseLectures);
