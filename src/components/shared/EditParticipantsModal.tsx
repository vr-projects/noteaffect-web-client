import * as React from 'react';
import { connect } from 'react-redux';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import throttle from 'lodash/throttle';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import { Alert, Tabs, Tab } from 'react-bootstrap';
import AppMappers from '../../mappers/AppMappers';
import {
  GENERAL_COMPONENT,
  EDIT_PARTICIPANTS_COMPONENT,
} from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ErrorUtil from '../../utilities/ErrorUtil';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import ICourse from '../../models/ICourse';
import EmailDomainUtil from '../../utilities/EmailDomainUtil';
import EditParticipantItem from './EditParticipantItem';
import EmailListItem from './EmailListItem';
import GenericModal from '../controls/GenericModal';
import AddEmailsFormGroup from '../controls/AddEmailsFormGroup';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

export enum TAB_GROUP_TYPE {
  INDIVIDUAL = 'INDIVIDUAL',
  DISTRIBUTION_LIST = 'DISTRIBUTION_LIST',
}

interface IEditParticipantModalProps {
  show: boolean;
  type: 'edit' | 'add';
  course?: ICourse | null;
  courseId?: number | null;
  onClose: () => void;
}

interface IConnectedEditParticipantModalProps {
  userInformation?: IImmutableObject<IUserInformation>;
  userPermissions?: IUserPermissions;
  isCorpVersion?: boolean;
  isEduVersion?: boolean;
  lexicon?: string;
}

interface IEditParticipantModalState {
  loading: LoadStates;
  errorMessage: string;
  added: boolean;
  participantEmails: string;
  participantEmailsTouched: boolean;
  participantEmailsValidationError: boolean;
  distributionLists: string;
  distributionListsTouched: boolean;
  distributionListsValidationError: boolean;
  selectedTab: TAB_GROUP_TYPE;
}

class EditParticipantsModal extends SrUiComponent<
  IEditParticipantModalProps & IConnectedEditParticipantModalProps,
  IEditParticipantModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      errorMessage: '',
      added: false,
      participantEmails: '',
      participantEmailsTouched: false,
      participantEmailsValidationError: false,
      distributionLists: '',
      distributionListsTouched: false,
      distributionListsValidationError: false,
      selectedTab: TAB_GROUP_TYPE.INDIVIDUAL,
    };
  }

  onNewProps(props: IEditParticipantModalProps) {
    if (props.type === 'edit' && !props.course) {
      this.setPartial({
        ...this.initialState(),
      });
    }
  }

  componentWillUnmount() {
    this.throttledValidateParticipantEmails.cancel();
    this.throttledValidateDistributionLists.cancel();
  }

  handleTabSelect(selectedTab: TAB_GROUP_TYPE) {
    this.setPartial({ selectedTab });
  }

  handleParticipantEmailsChange(e) {
    this.setPartial({
      participantEmails: e.target.value,
      participantEmailsTouched: true,
    });

    this.throttledValidateParticipantEmails.cancel();
    this.throttledValidateParticipantEmails();
  }

  handleDistributionListsChange(e) {
    this.setPartial({
      distributionLists: e.target.value,
      distributionListsTouched: true,
    });

    this.throttledValidateDistributionLists.cancel();
    this.throttledValidateDistributionLists();
  }

  validateParticipantEmailsState(): 'error' | null {
    const { participantEmails, participantEmailsTouched } = this.state;
    if (participantEmailsTouched && participantEmails.length === 0) {
      return 'error';
    }
    return null;
  }

  validateDistributionListsState(): 'error' | null {
    const { distributionLists, distributionListsTouched } = this.state;
    if (distributionListsTouched && distributionLists.length === 0) {
      return 'error';
    }
    return null;
  }

  validateParticipantEmails() {
    const { participantEmails } = this.state;
    const validEmails = EmailDomainUtil.isEmailStrings(participantEmails);

    this.setPartial({
      participantEmailsValidationError: !validEmails,
    });
  }
  private throttledValidateParticipantEmails = throttle(
    () => {
      this.validateParticipantEmails();
    },
    750,
    { leading: false }
  );

  validateDistributionLists() {
    const { distributionLists } = this.state;
    const validDistributionLists = EmailDomainUtil.isEmailStrings(
      distributionLists
    );

    this.setPartial({
      distributionListsValidationError: !validDistributionLists,
    });
  }
  private throttledValidateDistributionLists = throttle(
    () => {
      this.validateDistributionLists();
    },
    750,
    { leading: false }
  );

  async addEmail(e) {
    e.preventDefault();
    const {
      loading,
      participantEmails,
      distributionLists,
      selectedTab,
    } = this.state;
    const { type, isCorpVersion, course, courseId } = this.props;
    const apiCourseId = courseId ? courseId : course.id;
    const isDistro = selectedTab === TAB_GROUP_TYPE.DISTRIBUTION_LIST;
    const trimmedEmails = isDistro
      ? distributionLists.trim()
      : participantEmails.trim();

    if (
      loading === LoadStates.Loading ||
      !this.mounted() ||
      (type === 'edit' && !course)
    ) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });

    try {
      // Corp is users/invitees, edu is users
      const endpoint = `series/${apiCourseId}/${
        isCorpVersion ? 'users/invitees' : 'users'
      }`;

      const payload = {
        SeriesId: apiCourseId,
        Email: trimmedEmails,
        DistroList: isDistro,
      };

      const resp = await ApiHelpers.create(endpoint, payload);

      ErrorUtil.handleAPIErrors(
        resp,
        'There was an error adding email address'
      );

      this.setPartial({
        participantEmails: '',
        participantEmailsTouched: false,
        distributionLists: '',
        distributionListsTouched: false,
        loading: LoadStates.Unloaded,
        added: true,
      });

      this.broadcast(AppBroadcastEvents.ParticipantAdded);
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: err.message,
        participantEmails: participantEmails,
        participantEmailsTouched: false,
        distributionLists: distributionLists,
        distributionListsTouched: false,
        added: false,
      });
    }
  }

  async handleRemoveUnregistered(unregisteredId) {
    try {
      const {
        course: { id: courseId },
      } = this.props;

      this.setPartial({
        loading: LoadStates.Loading,
      });

      const removedResp = await ApiHelpers.delete(
        `series/${courseId}/users/invitees/${unregisteredId}`
      );

      ErrorUtil.handleAPIErrors(removedResp, 'Error deleting email');

      this.setPartial({
        loading: LoadStates.Succeeded,
      });

      this.broadcast(AppBroadcastEvents.UnregisteredDeleted);
    } catch (error) {
      console.error('Error deleting email');
      this.setPartial({
        loading: LoadStates.Failed,
      });
    }
  }

  async handleRemoveDistroList(distroListId) {
    try {
      const {
        course: { id: courseId },
      } = this.props;

      this.setPartial({
        loading: LoadStates.Loading,
      });

      const removedResp = await ApiHelpers.delete(
        `series/${courseId}/users/distroinvitees/${distroListId}`
      );

      ErrorUtil.handleAPIErrors(
        removedResp,
        'Error deleting distribution list email'
      );

      this.setPartial({
        loading: LoadStates.Succeeded,
      });

      this.broadcast(AppBroadcastEvents.DistributionListDeleted);
    } catch (error) {
      console.error('Error deleting distribution list email');
      this.setPartial({
        loading: LoadStates.Failed,
      });
    }
  }

  calcDisableEmailAddBtn = () => {
    const {
      participantEmails,
      participantEmailsTouched,
      participantEmailsValidationError,
      loading,
    } = this.state;

    const enableAddBtn =
      participantEmails.length > 0 &&
      participantEmailsTouched &&
      !participantEmailsValidationError &&
      loading !== LoadStates.Loading;
    return !enableAddBtn;
  };

  calcDisableDistributionListAddBtn = () => {
    const {
      distributionLists,
      distributionListsTouched,
      distributionListsValidationError,
      loading,
    } = this.state;

    const enableAddBtn =
      distributionLists.length > 0 &&
      distributionListsTouched &&
      !distributionListsValidationError &&
      loading !== LoadStates.Loading;
    return !enableAddBtn;
  };

  close() {
    const { onClose } = this.props;
    this.setPartial({
      ...this.initialState(),
    });
    this.broadcast(AppBroadcastEvents.ShouldRefreshData);
    onClose();
  }

  performRender() {
    const { show, type, isCorpVersion, course } = this.props;
    const { loading } = this.state;

    if (isNull(course)) {
      return null;
    }

    const {
      participantEmails,
      participantEmailsValidationError,
      distributionLists,
      distributionListsValidationError,
      selectedTab,
    } = this.state;
    const modalTitle =
      type === 'edit'
        ? EDIT_PARTICIPANTS_COMPONENT.TITLE_EDIT
        : EDIT_PARTICIPANTS_COMPONENT.TITLE_ADD;

    const lecturerPresenter =
      type === 'edit'
        ? ParticipantsUtil.getInstructorsPresenters(course.participants)
        : null;
    const registeredParticipants =
      type === 'edit'
        ? ParticipantsUtil.getStudentsParticipants(course.participants)
        : null;
    const unregisteredParticipants =
      type === 'edit'
        ? ParticipantsUtil.getUnregistered(course.unregisteredParticipants)
        : null;
    const distributionInvitations =
      type === 'edit'
        ? ParticipantsUtil.sortByEmail(course.distributionInvitations)
        : null;

    return (
      <>
        <GenericModal
          show={show}
          modalTitle={`${Localizer.getFormatted(modalTitle)} ${
            this.props.course ? ' - ' + this.props.course.name : ''
          }`}
          onCloseClicked={() => this.close()}
          bodyClassName="edit-participants-modal"
        >
          <LoadMask state={loading} />
          <div className="add-new-participant">
            {!isCorpVersion && (
              <form onSubmit={(e) => this.addEmail(e)} noValidate>
                <AddEmailsFormGroup
                  controlId="formParticipantEmails"
                  validator={this.validateParticipantEmailsState()}
                  label={Localizer.get(
                    'Add participant by email (unregistered users will be sent an invitation to join NoteAffect):'
                  )}
                  emails={participantEmails}
                  disabled={this.state.loading === LoadStates.Loading}
                  onChange={(e) => this.handleParticipantEmailsChange(e)}
                  disableAddBtn={this.calcDisableEmailAddBtn}
                  validationError={participantEmailsValidationError}
                  errorMessage={Localizer.get(
                    'Please enter comma-separated email addresses of participants (i.e. participant1@email.com, participant2@email.com).'
                  )}
                />
              </form>
            )}
            {isCorpVersion && (
              <form onSubmit={(e) => this.addEmail(e)} noValidate>
                <Tabs
                  id="email-group-type"
                  activeKey={selectedTab}
                  onSelect={(tab) => this.handleTabSelect(tab)}
                >
                  <Tab
                    eventKey={TAB_GROUP_TYPE.INDIVIDUAL}
                    title={Localizer.get('Add Individuals')}
                  >
                    <AddEmailsFormGroup
                      controlId="formParticipantEmails"
                      validator={this.validateParticipantEmailsState()}
                      label={Localizer.get(
                        'Add participant by email (unregistered users will be sent an invitation to join NoteAffect):'
                      )}
                      emails={participantEmails}
                      disabled={this.state.loading === LoadStates.Loading}
                      onChange={(e) => this.handleParticipantEmailsChange(e)}
                      disableAddBtn={this.calcDisableEmailAddBtn}
                      validationError={participantEmailsValidationError}
                      errorMessage={Localizer.get(
                        'Please enter comma-separated email addresses of participants (i.e. participant1@email.com, participant2@email.com).'
                      )}
                      groupType={TAB_GROUP_TYPE.INDIVIDUAL}
                    />
                  </Tab>
                  <Tab
                    eventKey={TAB_GROUP_TYPE.DISTRIBUTION_LIST}
                    title={Localizer.get('Add distribution lists')}
                  >
                    <AddEmailsFormGroup
                      controlId="formDistributionLists"
                      validator={this.validateDistributionListsState()}
                      label={Localizer.get('Add distribution lists:')}
                      emails={distributionLists}
                      disabled={this.state.loading === LoadStates.Loading}
                      onChange={(e) => this.handleDistributionListsChange(e)}
                      disableAddBtn={this.calcDisableDistributionListAddBtn}
                      validationError={distributionListsValidationError}
                      errorMessage={Localizer.get(
                        'Please enter comma-separated email addresses of distribution lists (i.e. hr@email.com, support@email.com).'
                      )}
                      groupType={TAB_GROUP_TYPE.DISTRIBUTION_LIST}
                    />
                  </Tab>
                </Tabs>
              </form>
            )}
            <LoadIndicator
              state={this.state.loading}
              loadingMessage={Localizer.get('Updating participants...')}
              errorMessage={Localizer.get(this.state.errorMessage)}
            />
            {this.state.added ? (
              <Alert bsStyle="success">
                {Localizer.getFormatted(EDIT_PARTICIPANTS_COMPONENT.INVITED)}
              </Alert>
            ) : null}
          </div>

          {/* For Presenter Participants View */}
          {isCorpVersion && type === 'edit' && (
            <div className="list-participants">
              <h4>
                {`${Localizer.getFormatted(
                  GENERAL_COMPONENT.INSTRUCTOR_PRESENTER
                )}:`}
              </h4>
              {lecturerPresenter.map((p) => (
                <EditParticipantItem
                  disable={loading === LoadStates.Loading}
                  course={course}
                  participant={p}
                  key={p.id}
                />
              ))}
              <h4>
                {`${Localizer.getFormatted(
                  GENERAL_COMPONENT.REGISTERED_PARTICIPANTS
                )}:`}
              </h4>
              {registeredParticipants && registeredParticipants.length > 0 ? (
                registeredParticipants.map((p) => (
                  <EditParticipantItem
                    disable={loading === LoadStates.Loading}
                    course={course}
                    participant={p}
                    key={p.id}
                  />
                ))
              ) : (
                <Alert bsStyle="info">
                  {Localizer.get(
                    'There are currently no registered participants.'
                  )}
                </Alert>
              )}
              {unregisteredParticipants && !isEmpty(unregisteredParticipants) && (
                <>
                  <h4>
                    {`${Localizer.getFormatted(
                      GENERAL_COMPONENT.UNREGISTERED_PARTICIPANTS
                    )}:`}
                  </h4>
                  <ul className="unregistered-list list-group">
                    {unregisteredParticipants.map((u) => (
                      <EmailListItem
                        key={u.id}
                        emailListItem={u}
                        removeEmailListItem={(id) =>
                          this.handleRemoveUnregistered(id)
                        }
                        isLoading={loading === LoadStates.Loading}
                      />
                    ))}
                  </ul>
                </>
              )}
              {distributionInvitations && !isEmpty(distributionInvitations) && (
                <>
                  <h4>
                    {`${Localizer.getFormatted(
                      GENERAL_COMPONENT.DISTROLIST_INVITATIONS
                    )}:`}
                  </h4>
                  <ul className="distroinvite-list list-group">
                    {distributionInvitations.map((item) => (
                      <EmailListItem
                        key={item.id}
                        emailListItem={item}
                        removeEmailListItem={(id) =>
                          this.handleRemoveDistroList(id)
                        }
                        isLoading={loading === LoadStates.Loading}
                      />
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </GenericModal>
      </>
    );
  }
}

export default connect<
  IConnectedEditParticipantModalProps,
  {},
  IEditParticipantModalProps
>(AppMappers.UserVersionMapper)(EditParticipantsModal);
