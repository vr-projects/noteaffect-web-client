import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { BsPlayFill } from 'react-icons/bs';
import { FaDownload } from 'react-icons/fa';
import { Alert, Button } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
  SrAppMessage,
  QueryUtility,
  WaitSpinner,
  Animated,
} from 'react-strontium';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import {
  GENERAL_COMPONENT,
  INSTRUCTOR_COURSE_LECTURES_COMPONENT,
} from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import { getDownloadBundleRoute } from '../../../services/LinkService';
import SeriesPresentationsLecturesLayout from '../../shared/SeriesPresentationsLecturesLayout';
import BreadcrumbLink from '../../controls/BreadcrumbLink';
import Breadcrumb from '../../controls/Breadcrumb';
import LectureRenamePopup from './LectureRenamePopup';
import AppMappers from '../../../mappers/AppMappers';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';
import Link from '../../controls/Link';
import SeriesMetadata from '../../shared/SeriesMetadata';

interface IConnectedCourseLecturesProps {
  isCorpVersion?: boolean;
}

interface ICourseLecturesProps {
  course: ICourse;
  lectureId: number;
  initialSlide: number;
}

interface ICourseLecturesState {
  lectures: ILecture[];
  loading: LoadStates;
  waitingForNewLecture: boolean;
}

class InstructorCourseLectures extends SrUiComponent<
  ICourseLecturesProps & IConnectedCourseLecturesProps,
  ICourseLecturesState
> {
  initialState() {
    return {
      lectures: [],
      loading: LoadStates.Unloaded,
      waitingForNewLecture: false,
    };
  }

  onComponentMounted() {
    this.loadLectures(this.props.course);
  }

  getHandles() {
    return [
      AppBroadcastEvents.LectureUpdated,
      AppBroadcastEvents.PresentationStarting,
    ];
  }

  async onAppMessage(msg: SrAppMessage) {
    // TODO - Tech Debt else if could break, refactor to switch statement
    if (
      msg.action === AppBroadcastEvents.PresentationStarting &&
      this.props.course &&
      this.props.course.id === msg.data.seriesId &&
      this.state.waitingForNewLecture
    ) {
      const lectures = await this.loadLectures(this.props.course);
      const lecture = lectures.filter((l) => l.id === msg.data.lectureId)[0];
      if (lecture) {
        this.setPartial({ waitingForNewLecture: false });
        this.handleSelectedLecture(lecture);
      }
    } else if (
      this.props.course &&
      msg.data.courseId === this.props.course.id
    ) {
      this.loadLectures(this.props.course);
    }
  }

  // TODO wrap in try catch block
  async loadLectures(course: ICourse) {
    if (!course || this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    const lecturesResp = await ApiHelpers.read(`series/${course.id}/lectures`);

    if (!this.mounted()) {
      return;
    }

    if (lecturesResp.good) {
      if (this.props.course && this.props.course.id === course.id) {
        const lectures = this.sortedLectures(JSON.parse(lecturesResp.data));
        this.setPartial({ lectures: lectures, loading: LoadStates.Succeeded });
        return lectures;
      }
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }

    return this.state.lectures;
  }

  sortedLectures(lectures: ILecture[]): ILecture[] {
    lectures = lectures || [];
    return lectures.sort((a, b) => {
      const dateOrder = (b.started || 3000000000) - (a.started || 3000000000);
      if (dateOrder !== 0) {
        return dateOrder;
      }
      return (b.name || '').localeCompare(a.name || '');
    });
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

  handleSelectedLecture(lec: ILecture) {
    this.updateQuery(QueryUtility.buildQuery({ lecture: lec.id }));
  }

  startNewLecture() {
    this.setPartial({ waitingForNewLecture: true });
    this.deferred(
      () => this.setPartial({ waitingForNewLecture: false }),
      60000,
      'waitingForNewLecture'
    );
    document.location.assign(
      `/api/series/${this.props.course.id}/startLecture`
    );
  }

  returnToLectures() {
    this.updateQuery(
      QueryUtility.buildQuery({ lecture: undefined, initialSlide: undefined })
    );
  }

  getSelectedLecture() {
    const { lectureId } = this.props;
    if (!lectureId) {
      return null;
    }

    return this.state.lectures.find((f) => f.id === lectureId);
  }

  performRender() {
    const { isCorpVersion, lectureId, initialSlide, course } = this.props;
    const { loading, lectures, waitingForNewLecture } = this.state;
    const lecture = this.getSelectedLecture();
    const broadcasterUrl = getDownloadBundleRoute();

    return (
      <div className="instructor-course-lectures">
        <div className="header-container">
          <h3 className="breadcrumb-container">
            <Breadcrumb>
              <BreadcrumbLink
                linkEnabled={!!lecture}
                onClick={() => this.returnToLectures()}
              >
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.LECTURES_PRESENTATIONS
                )}
              </BreadcrumbLink>
              {lecture && (
                <>
                  {lecture.name}{' '}
                  <LectureRenamePopup lecture={lecture} course={course} />
                </>
              )}
            </Breadcrumb>
          </h3>
          <div className="cta-container">
            {!lecture && (
              <>
                {!waitingForNewLecture ? (
                  <Button
                    bsStyle="info"
                    className="start-lecture-button"
                    disabled={loading === LoadStates.Loading}
                    onClick={() => this.startNewLecture()}
                  >
                    <BsPlayFill />
                    <span className="ml-1">
                      {Localizer.getFormatted(
                        INSTRUCTOR_COURSE_LECTURES_COMPONENT.START_NEW
                      )}
                    </span>
                  </Button>
                ) : (
                  <WaitSpinner
                    message={Localizer.getFormatted(
                      INSTRUCTOR_COURSE_LECTURES_COMPONENT.BROADCASTER
                    )}
                  />
                )}

                <Link
                  className="download-broadcaster-btn btn btn-warning ml-1"
                  href={broadcasterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={loading === LoadStates.Loading}
                  disabledTooltipMessage={'Loading data, please wait'}
                >
                  <FaDownload />
                  <span className="ml-1">
                    {Localizer.get('Download Broadcaster')}
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
        {isCorpVersion && (
          <div className="metadata-container">
            <SeriesMetadata
              series={course}
              presentation={lecture}
              hasPresentations={!isEmpty(lectures)}
              hasDocuments={!isEmpty(course.documents)}
              className="mb-1"
            />
          </div>
        )}

        {lectures.length === 0 ? (
          <LoadIndicator
            state={loading}
            errorMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.ERROR_LECTURES_PRESENTATIONS
            )}
            loadingMessage={Localizer.getFormatted(
              GENERAL_COMPONENT.LOADING_LECTURES_PRESENTATIONS
            )}
          />
        ) : null}
        {loading === LoadStates.Succeeded || lectures.length > 0 ? (
          lectures.length > 0 ? (
            <SeriesPresentationsLecturesLayout
              course={course}
              lectures={lectures}
              lectureId={lectureId}
              initialSlide={initialSlide}
              isLecturerView={true}
            />
          ) : (
            <Animated in>
              <Alert bsStyle="info">
                {Localizer.getFormatted(
                  GENERAL_COMPONENT.NONE_LECTURES_PRESENTATIONS_COURSE_MEETING
                )}
              </Alert>
            </Animated>
          )
        ) : null}
      </div>
    );
  }
}

export default connect<IConnectedCourseLecturesProps, {}, ICourseLecturesProps>(
  AppMappers.VersionMapper
)(InstructorCourseLectures);
