import 'moment-timezone';
import * as React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import {
  Modal,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
} from 'react-bootstrap';
import { FaShare, FaTimes } from 'react-icons/fa';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import SharePermission from '../../enums/SharePermission';
import ISeries from '../../models/ICourse';
import IParticipant from '../../models/IParticipant';
import Localizer from '../../utilities/Localizer';
import MultiRadioToggler, { IOption } from '../controls/MultiRadioToggler';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedSharePresentationsByParticipantsModalProps {
  userInformation?: IImmutableObject<IUserInformation>;
  isCorpVersion?: Boolean;
}
interface ISharePresentationsByParticipantsModalProps {
  show: boolean;
  onClose: (number?) => void;
  series: ISeries;
  permissionCode: SharePermission | null;
}

interface ISharePresentationsByParticipantsModalState {
  loading: LoadStates;
  description: string;
  descriptionTouched: boolean;
  selectedParticipants: number[];
  // bool to track if actually shared with participants orr not
  sharedWithParticipants: boolean;
}

const shareOptions: IOption[] = [
  { label: 'Yes', value: 'yes', style: 'success' },
  { label: 'No', value: 'no', style: 'danger' },
];

class SharePresentationsByParticipantsModal extends SrUiComponent<
  ISharePresentationsByParticipantsModalProps &
    IConnectedSharePresentationsByParticipantsModalProps,
  ISharePresentationsByParticipantsModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      description: '',
      descriptionTouched: false,
      selectedParticipants: [],
      sharedWithParticipants: false,
    };
  }

  componentWillUnmount() {
    this.setState({ ...this.initialState() });
  }

  handleClose() {
    this.setState({ ...this.initialState() });
    this.props.onClose();
  }

  validateDescription(): 'error' | null {
    const { description, descriptionTouched } = this.state;
    if (descriptionTouched && description.length === 0) {
      return 'error';
    }
    return null;
  }

  calcDisableSendShareBtn() {
    const { loading, description, selectedParticipants } = this.state;

    return (
      loading === LoadStates.Loading ||
      selectedParticipants.length === 0 ||
      description.length === 0
    );
  }

  shareWithParticipant(participant: IParticipant) {
    this.setPartial({
      selectedParticipants: [
        ...this.state.selectedParticipants,
        participant.userId,
      ],
    });
  }

  removeParticipant(participant: IParticipant) {
    this.setPartial({
      selectedParticipants: this.state.selectedParticipants.filter(
        (pUserId) => pUserId !== participant.userId
      ),
    });
  }

  handleSharingToggled(optionValue, participant) {
    switch (optionValue) {
      case 'yes':
        this.shareWithParticipant(participant);
        break;
      case 'no':
        this.removeParticipant(participant);
        break;
      default:
        break;
    }
  }

  getDefaultOptionIndex(selectedParticipants, participant) {
    // setting to No by default
    return isEmpty(selectedParticipants)
      ? 1
      : selectedParticipants.includes(participant.userId)
      ? 0
      : 1;
  }

  handleDescriptionChange(e) {
    this.setPartial({ description: e.target.value, descriptionTouched: true });
  }

  async handleFormSubmit() {
    const {
      series: { id: seriesId },
    } = this.props;
    const { description, selectedParticipants } = this.state;

    const payload = {
      ShareRemarks: true,
      Email: null,
      Description: description,
      Ids: selectedParticipants,
    };

    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const createObserversResp = await ApiHelpers.create(
        `series/${seriesId}/users/observer`,
        payload
      );

      if (!createObserversResp.good) {
        throw new Error('Error adding observers to meeting');
      }

      this.setPartial({
        description: '',
        descriptionTouched: false,
        loading: LoadStates.Succeeded,
        sharedWithParticipants: !isEmpty(selectedParticipants),
      });
      this.broadcast(AppBroadcastEvents.SharedByParticipants);

      // success alert fade out
      setTimeout(() => {
        this.setPartialAsync({
          loading: LoadStates.Unloaded,
          selectedParticipants: [],
          sharedWithParticipants: false,
        });
      }, 3000);
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
      console.error(err);
    }
  }

  performRender() {
    const { series, userInformation, show } = this.props;
    const {
      loading,
      description,
      selectedParticipants,
      sharedWithParticipants,
    } = this.state;

    const currentLoggedInUserId = userInformation.toJS().id;
    const nonInstructorParticipants = series.participants.filter(
      (participant) =>
        !participant.lecturer && participant.userId !== currentLoggedInUserId
    );
    const hasParticipantsToShare = !isEmpty(nonInstructorParticipants);

    return (
      <Modal
        show={show}
        keyboard
        backdrop={'static'}
        onHide={() => this.handleClose()}
      >
        <Modal.Header>
          <Modal.Title>
            {Localizer.get('Share Presentations With Participants')} -{' '}
            {series.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Updating ...')}
            errorMessage={Localizer.get(
              'Something went wrong.  Please try again later.'
            )}
          />

          {hasParticipantsToShare && (
            <>
              <Alert bsStyle="warning">
                {Localizer.get(
                  'Your presentation notes and annotations from all presentations associated with this meeting will be shared with all individuals selected below.'
                )}
              </Alert>
              <form noValidate>
                <div className="d-flex">
                  <FormGroup
                    className="flex-grow mb-0"
                    controlId="formDescription"
                    validationState={this.validateDescription()}
                  >
                    <ControlLabel>
                      <span>{Localizer.get('* Description:')}</span>
                    </ControlLabel>
                    <FormControl
                      disabled={false}
                      required
                      value={description}
                      componentClass="textarea"
                      className="resize-vertical"
                      placeholder={Localizer.get(
                        'Enter Description for Sharing Email'
                      )}
                      onChange={(e) => this.handleDescriptionChange(e)}
                    />
                  </FormGroup>
                </div>

                <div className="share-presentations-by-participants-list">
                  <h4>{Localizer.get('Current Participants')}</h4>
                  <ul className="list-unstyled">
                    {nonInstructorParticipants.map((participant) => {
                      return (
                        <li key={participant.userId} className="rel d-flex">
                          <div className="">
                            <p className="participant-name break-word">
                              {[participant.firstName, participant.lastName]
                                .filter((n) => (n || '').trim().length > 0)
                                .join(' ')}
                            </p>

                            <p className="sub-title">{participant.email}</p>
                          </div>
                          <div className="controls ml-auto d-flex flex-column">
                            <MultiRadioToggler
                              label={'Share:'}
                              options={shareOptions}
                              defaultOptionIndex={this.getDefaultOptionIndex(
                                selectedParticipants,
                                participant
                              )}
                              disable={loading === LoadStates.Loading}
                              onToggled={(optionValue) =>
                                this.handleSharingToggled(
                                  optionValue,
                                  participant
                                )
                              }
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </form>
              {loading === LoadStates.Succeeded && sharedWithParticipants && (
                <Alert bsStyle="success">
                  {Localizer.get('Successfully shared with participants.')}
                </Alert>
              )}
            </>
          )}

          {!hasParticipantsToShare && (
            <>
              <Alert bsStyle="warning">
                {Localizer.get(
                  'There are currently no other participants in this meeting.'
                )}
              </Alert>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <div className="share-presentations-by-participants-form-actions d-flex mt-3">
            <Button
              bsStyle="default"
              className="ml-auto"
              onClick={() => this.handleClose()}
            >
              <FaTimes />
              <span className="ml-1">{Localizer.get('Close')}</span>
            </Button>
            {hasParticipantsToShare && (
              <Button
                type="submit"
                bsStyle="info"
                className="ml-1"
                onClick={() => this.handleFormSubmit()}
                disabled={this.calcDisableSendShareBtn()}
              >
                <FaShare />
                <span className="ml-1">{Localizer.get('Share')}</span>
              </Button>
            )}
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect<
  IConnectedSharePresentationsByParticipantsModalProps,
  {},
  ISharePresentationsByParticipantsModalProps
>(AppMappers.ClientUserVersionMapper)(SharePresentationsByParticipantsModal);
