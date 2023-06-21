import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { SrUiComponent, SrAppMessage } from 'react-strontium';
import LectureStopButton from './LectureStopButton';
import { LECTURE_DETAIL_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import ICourse from '../../../models/ICourse';
import ILecture from '../../../models/ILecture';
import InstructorLectureReviewer from './InstructorLectureReviewer';
import LecturesUtil from '../../../utilities/LecturesUtil';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';
import AppMappers from '../../../mappers/AppMappers';

interface IConnectedLectureDetailProps {
  isCorpVersion?: boolean;
}

interface ILectureDetailProps {
  course: ICourse;
  lecture: ILecture;
  initialSlide: number;
}

interface ILectureDetailState {}

class LectureDetail extends SrUiComponent<
  ILectureDetailProps & IConnectedLectureDetailProps,
  ILectureDetailState
> {
  getHandles() {
    return [AppBroadcastEvents.PresentationEnded];
  }

  onAppMessage(msg: SrAppMessage) {
    if (
      msg.action === AppBroadcastEvents.PresentationEnded &&
      msg.data.lectureId === this.props.lecture.id
    ) {
      this.lectureEnded();
    }
  }

  lectureEnded() {
    this.broadcast(AppBroadcastEvents.LectureUpdated, {
      courseId: this.props.course.id,
    });
  }

  performRender() {
    const { isCorpVersion, lecture, course, initialSlide } = this.props;

    return (
      <div className="instructor-lecture-detail">
        {!lecture ? (
          <>
            <h4>{Localizer.getFormatted(LECTURE_DETAIL_COMPONENT.TITLE)}</h4>
            <Alert bsStyle="info">
              {Localizer.getFormatted(LECTURE_DETAIL_COMPONENT.DESCRIPTION)}
            </Alert>
          </>
        ) : (
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
        )}
      </div>
    );
  }
}

export default connect<IConnectedLectureDetailProps, {}, ILectureDetailProps>(
  AppMappers.VersionMapper
)(LectureDetail);
