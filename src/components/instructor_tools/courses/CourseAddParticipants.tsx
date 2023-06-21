import * as React from 'react';
import { DispatchProp, connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  Popover,
  ApiHelpers,
  LoadStates,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import * as CoursesActions from '../../../store/courses/CoursesActions';
import Localizer from '../../../utilities/Localizer';
import ICourse from '../../../models/ICourse';

// TODO tech debt refactor to GenericModal
interface ICourseAddParticipantsProps extends DispatchProp<any> {
  series: ICourse;
  disabled: boolean;
}

interface ICourseAddParticipantsState {
  loading: LoadStates;
  email: string;
}

class CourseAddParticipants extends SrUiComponent<
  ICourseAddParticipantsProps,
  ICourseAddParticipantsState
> {
  initialState() {
    return { email: undefined, loading: LoadStates.Unloaded };
  }

  cancel() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setState({ email: undefined, loading: LoadStates.Unloaded });
    this.getRef<HTMLButtonElement>('add-button').click();
  }

  async addEmail() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const email = this.state.email;
    const resp = await ApiHelpers.create(
      `series/${this.props.series.id}/users`,
      { email }
    );
    if (resp.good) {
      this.setState({ email: undefined, loading: LoadStates.Unloaded });
      this.getRef<HTMLButtonElement>('add-button').click();
      this.props.dispatch(CoursesActions.getCourses(true));
    } else {
      this.setState({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const { disabled } = this.props;

    const content = (
      <>
        <div className="rel">
          <p>
            {Localizer.get(
              'Add participant by email (unregistered users will be sent an invitation to join NoteAffect):'
            )}
          </p>
          <textarea
            disabled={this.state.loading === LoadStates.Loading}
            className="form-control resize-vertical"
            autoFocus
            value={this.state.email || ''}
            onChange={(e) => this.setState({ email: e.target.value })}
            placeholder="Email addresses (separate by line, comma, or semi-colon)"
          />
          <br />
          <div className="d-flex justify-content-end">
            <Button bsStyle="default" onClick={() => this.cancel()}>
              {Localizer.get('Cancel')}
            </Button>
            <Button
              bsStyle="success"
              disabled={disabled}
              onClick={() => this.addEmail()}
            >
              {Localizer.get('Add')}
            </Button>
          </div>
          <LoadMask state={this.state.loading} />
        </div>
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.get('Adding participant(s)...')}
          errorMessage={Localizer.get(
            'Something went wrong.  Please try again later.'
          )}
        />
      </>
    );

    return (
      <Popover
        id="add-user-po"
        placement="bottom"
        content={content}
        rootClose={false}
        title="Add by email..."
      >
        <button ref="add-button" disabled={disabled} className="btn btn-info">
          {Localizer.get('Add Participant')}
        </button>
      </Popover>
    );
  }
}

export default connect<any, void, ICourseAddParticipantsProps>(() => {
  return {};
})(CourseAddParticipants);
