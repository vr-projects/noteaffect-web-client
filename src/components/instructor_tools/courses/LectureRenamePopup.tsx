import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  LoadMask,
  Popover,
} from 'react-strontium';
import ApiHelpers from 'react-strontium/dist/api/ApiHelpers';
import ILecture from '../../../models/ILecture';
import ICourse from '../../../models/ICourse';
import { LECTURE_RENAME_POPUP_COMPONENT } from '../../../version/versionConstants';
import Localizer from '../../../utilities/Localizer';
import AppBroadcastEvents from '../../../broadcastEvents/AppBroadcastEvents';

interface ILectureNamePopupProps {
  lecture: ILecture;
  course: ICourse;
}

interface ILectureNamePopupState {
  name: string;
  loading: LoadStates;
  errorMessage: string;
}

export default class LectureNamePopup extends SrUiComponent<
  ILectureNamePopupProps,
  ILectureNamePopupState
> {
  initialState() {
    return {
      name: this.props.lecture.name,
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
    };
  }

  onNewProps(props: ILectureNamePopupProps) {
    if (props.lecture) {
      this.setPartial({ name: props.lecture.name });
    }
  }

  cancel() {
    this.setState({
      name: this.props.lecture.name,
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
    });
    (this.refs['open-button'] as HTMLButtonElement).click();
  }

  async save() {
    if ((this.state.name || '').trim().length === 0) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter a present and valid name.'),
      });
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, errorMessage: undefined });
    const resp = await ApiHelpers.update(`lectures/${this.props.lecture.id}`, {
      name: this.state.name,
    });
    if (resp.good) {
      this.setState({
        name: undefined,
        loading: LoadStates.Unloaded,
        errorMessage: undefined,
      });
      (this.refs['open-button'] as HTMLButtonElement).click();
      this.broadcast(AppBroadcastEvents.LectureUpdated, {
        courseId: this.props.course.id,
      });
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const poContent = (
      <>
        <div className="rel">
          <input
            readOnly={this.state.loading === LoadStates.Loading}
            autoFocus
            type="text"
            className="form-control"
            value={this.state.name || ''}
            onChange={(e) => this.setPartial({ name: e.target.value })}
          />
          {this.state.loading !== LoadStates.Loading ? (
            <div className="margin margin-top-sm margin-bottom-sm">
              <Button bsStyle="info" onClick={() => this.save()}>
                {Localizer.get('Save name')}
              </Button>
              <Button bsStyle="default" onClick={() => this.cancel()}>
                {Localizer.get('Cancel')}
              </Button>
            </div>
          ) : null}
          <LoadMask state={this.state.loading} />
        </div>
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.get('Saving name...')}
          errorMessage={
            this.state.errorMessage ||
            Localizer.get(
              'There was a problem saving the name.  Please try later.'
            )
          }
        />
      </>
    );

    return (
      <Popover
        title={Localizer.getFormatted(LECTURE_RENAME_POPUP_COMPONENT.TITLE)}
        rootClose={false}
        id="update-lecture-name"
        content={poContent}
      >
        <button ref="open-button" className="btn-link">
          <FaPen className="light" />
        </button>
      </Popover>
    );
  }
}
