import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, SrAppMessage } from 'react-strontium';
import { LECTURE_DETAIL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ILecture from '../../models/ILecture';
import LectureReviewer from '../course/LectureReviewer';
import InstructorLectureReviewer from '../instructor_tools/courses/InstructorLectureReviewer';
import LecturesUtil from '../../utilities/LecturesUtil';
import ICourse from '../../models/ICourse';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import AppMappers from '../../mappers/AppMappers';
import LectureStopButton from '../instructor_tools/courses/LectureStopButton';

interface IConnectedPresentationLectureDetailProps {
  isCorpVersion?: boolean;
}

interface IPresentationLectureDetailProps {
  course: ICourse;
  lecture: ILecture;
  initialSlide: number;
  isLecturerView: boolean;
}

interface IPresentationLectureDetailState {}

class PresentationLectureDetail extends SrUiComponent<
  IConnectedPresentationLectureDetailProps & IPresentationLectureDetailProps,
  IPresentationLectureDetailState
> {
  getHandles() {
    return [AppBroadcastEvents.PresentationEnded];
  }

  onAppMessage(msg: SrAppMessage) {
    if (!this.props.isLecturerView) return;
    if (
      msg.action === AppBroadcastEvents.PresentationEnded &&
      msg.data.lectureId === this.props.lecture.id
    ) {
      this.lectureEnded();
    }
  }
  lectureEnded() {
    if (!this.props.isLecturerView) return;
    this.broadcast(AppBroadcastEvents.LectureUpdated, {
      courseId: this.props.course.id,
    });
  }

  performRender() {
    const {
      isCorpVersion,
      lecture,
      course,
      initialSlide,
      isLecturerView,
    } = this.props;

    return (
      <div className={`presentation-lecture-detail`}>
        {!lecture ? (
          <>
            <h4>{Localizer.getFormatted(LECTURE_DETAIL_COMPONENT.TITLE)}</h4>
            <Alert bsStyle="info">
              {Localizer.getFormatted(LECTURE_DETAIL_COMPONENT.DESCRIPTION)}
            </Alert>
          </>
        ) : (
          <>
            {isLecturerView ? (
              <>
                {!isCorpVersion && (
                  <p className="helper-message">
                    {Localizer.get('PRESENTED')}{' '}
                    {LecturesUtil.formattedStart(lecture)}
                  </p>
                )}
                <div className="">
                  {lecture.started && !lecture.ended && (
                    <>
                      <LectureStopButton lecture={lecture} course={course} />
                      <hr />
                    </>
                  )}
                </div>
                <InstructorLectureReviewer
                  lecture={lecture}
                  initialSlide={initialSlide}
                />
              </>
            ) : (
              <LectureReviewer {...this.props} />
            )}
          </>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedPresentationLectureDetailProps,
  {},
  IPresentationLectureDetailProps
>(AppMappers.VersionMapper)(PresentationLectureDetail);
