import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FaStop } from 'react-icons/fa';
import { SrUiComponent, LoadStates, LoadIndicator } from 'react-strontium';
import ILecture from '../../../models/ILecture';
import { LECTURE_STOP_BUTTON_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import ICourse from '../../../models/ICourse';
import ApiHelpers from 'react-strontium/dist/api/ApiHelpers';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';

interface ILectureStopButtonProps {
  lecture: ILecture;
  course: ICourse;
}

interface ILectureStopButtonState {
  loading: LoadStates;
}

export default class LectureStopButton extends SrUiComponent<
  ILectureStopButtonProps,
  ILectureStopButtonState
> {
  initialState() {
    return { loading: LoadStates.Unloaded };
  }

  async save() {
    const {
      course: { id: courseId },
      lecture: { id: lectureId },
    } = this.props;

    this.setPartial({ loading: LoadStates.Loading });

    const resp = await ApiHelpers.update(`lectures/${lectureId}`, {
      end: true,
    });

    if (!resp.good) {
      this.setState({ loading: LoadStates.Failed });
      return;
    }

    this.setState({ loading: LoadStates.Unloaded });
    this.broadcast(AppBroadcastEvents.LectureUpdated, { courseId });
  }

  performRender() {
    const { loading } = this.state;

    return (
      <Button
        className={'lecture-stop-button rel'}
        disabled={loading === LoadStates.Loading}
        onClick={() => this.save()}
      >
        {loading === LoadStates.Loading && (
          <LoadIndicator
            state={this.state.loading}
            loadingMessage={Localizer.getFormatted(
              LECTURE_STOP_BUTTON_COMPONENT.ENDING
            )}
          />
        )}
        {loading !== LoadStates.Loading && (
          <>
            <FaStop />{' '}
            {Localizer.getFormatted(LECTURE_STOP_BUTTON_COMPONENT.END)}
          </>
        )}
      </Button>
    );
  }
}
