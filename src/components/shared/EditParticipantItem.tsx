import * as React from 'react';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  LoadIndicator,
  ApiHelpers,
} from 'react-strontium';
import { Label } from 'react-bootstrap';
import ICourse from '../../models/ICourse';
import IParticipant from '../../models/IParticipant';
import { DEPARTMENT_COURSE_PARTICIPANT_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';
import SystemRoleService from '../../services/SystemRoleService';
import SystemRoles from '../../enums/SystemRoles';

interface IEditParticipantItemProps {
  disable: boolean;
  course: ICourse;
  participant: IParticipant;
}

interface IEditParticipantItemState {
  loading: LoadStates;
}

class EditParticipantItem extends SrUiComponent<
  IEditParticipantItemProps,
  IEditParticipantItemState
> {
  async remove() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setState({ loading: LoadStates.Loading });

    const resp = await ApiHelpers.delete(
      `series/${this.props.course.id}/users/${this.props.participant.id}`
    );

    if (!this.mounted()) {
      return;
    }

    if (resp.good) {
      this.setState({ loading: LoadStates.Unloaded });
      this.broadcast(AppBroadcastEvents.ParticipantDeleted);
    } else {
      this.setState({ loading: LoadStates.Failed });
    }
  }

  async togglePromotion() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setState({ loading: LoadStates.Loading });

    const resp = await ApiHelpers.update(
      `series/${this.props.course.id}/users/${this.props.participant.id}`,
      { lecturer: !this.props.participant.lecturer }
    );

    if (!this.mounted()) {
      return;
    }
    if (resp.good) {
      this.setState({ loading: LoadStates.Unloaded });
      this.broadcast(AppBroadcastEvents.ParticipantPromotionUpdated);
    } else {
      this.setState({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const {
      participant: { lecturer, hasPresenterRole },
      disable,
    } = this.props;

    return (
      <div className="edit-participant-item">
        <div className="rel d-flex">
          <div className="">
            <p className="participant-name break-word">
              {[
                this.props.participant.firstName,
                this.props.participant.lastName,
              ]
                .filter((n) => (n || '').trim().length > 0)
                .join(' ')}
            </p>

            <p className="sub-title">{this.props.participant.email}</p>
          </div>
          {lecturer && (
            <Label bsStyle="info" className="mx-1 align-self-start">
              {Localizer.getFormatted(GENERAL_COMPONENT.INSTRUCTOR_PRESENTER)}
            </Label>
          )}
          <div className="controls ml-auto d-flex flex-column">
            <Button
              bsStyle="danger"
              disabled={disable}
              onClick={() => this.remove()}
            >
              &nbsp;
              <span className="">{Localizer.get('Remove participant')}</span>
            </Button>
            {SystemRoleService.hasSomeRoles([
              SystemRoles.PRESENTER,
              SystemRoles.SALES_PRESENTER,
              SystemRoles.DEPARTMENT_ADMIN,
              SystemRoles.CLIENT_ADMIN,
              SystemRoles.ADMIN,
            ]) &&
              hasPresenterRole && (
                <Button
                  bsStyle="default"
                  disabled={disable}
                  onClick={() => this.togglePromotion()}
                >
                  {this.props.participant.lecturer ? (
                    <span>&nbsp;{Localizer.get('Make Viewer')}</span>
                  ) : (
                    <span>
                      &nbsp;
                      {Localizer.getFormatted(
                        DEPARTMENT_COURSE_PARTICIPANT_COMPONENT.PROMOTE
                      )}
                    </span>
                  )}
                </Button>
              )}
          </div>
          <LoadMask state={this.state.loading} />
        </div>
        <LoadIndicator
          state={this.state.loading}
          errorMessage={Localizer.get(
            'There was a problem updating this participant.'
          )}
          loadingMessage={Localizer.get('Updating participant...')}
        />
      </div>
    );
  }
}

export default EditParticipantItem;
