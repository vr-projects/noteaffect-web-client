import * as React from 'react';
import orderBy from 'lodash/orderBy';
import isEmpty from 'lodash/isEmpty';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Tabs,
  Tab,
  Alert,
} from 'react-bootstrap';
import { FaChalkboard, FaFilePdf, FaPlus } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  Animated,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';
import ErrorUtil from '../../utilities/ErrorUtil';
import IDocument from '../../models/IDocument';
import ICourse from '../../models/ICourse';

export enum TAB_GROUP_TYPE {
  ADD_MEETING = 'ADD_MEETING',
  REMOVE_MEETING = 'REMOVE_MEETING',
}

export enum ALERT_STYLE_TYPE {
  SUCCESS = 'success',
  DANGER = 'danger',
}

interface IAssociateDocumentToMeetingModalProps {
  onClosed: () => void;
  documentUpdated: () => void;
  show: boolean;
  document: IDocument;
  selectedTab?: boolean;
}

interface IAssociateDocumentToMeetingModalState {
  loading: LoadStates;
  availableMeetings: ICourse[];
  selectedMeetingId: string;
  selectedTab: TAB_GROUP_TYPE;
  showAlert: boolean;
  alertStyle: ALERT_STYLE_TYPE;
  alertMsg: string;
}

class AssociateDocumentToMeetingModal extends SrUiComponent<
  IAssociateDocumentToMeetingModalProps,
  IAssociateDocumentToMeetingModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      availableMeetings: [],
      selectedMeetingId: '',
      selectedTab: this.props.selectedTab
        ? TAB_GROUP_TYPE.REMOVE_MEETING
        : TAB_GROUP_TYPE.ADD_MEETING,
      showAlert: false,
      alertStyle: null,
      alertMsg: '',
    };
  }

  async onComponentMounted() {
    this.getAvailableMeetings();
  }

  async getAvailableMeetings() {
    const { loading } = this.state;

    if (loading === LoadStates.Loading) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      let resp = await ApiHelpers.read(`series/instructing`);

      if (!resp.good) {
        throw new Error('could not get the meetings list');
      }

      let respData = JSON.parse(resp.data);

      this.setPartial({
        loading: LoadStates.Succeeded,
        availableMeetings: respData,
      });
    } catch (error) {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  getFilteredMeetings() {
    // returns availableMeetings without any matching document meetings
    const filteredMeetings = this.state.availableMeetings.filter((ad) => {
      return this.props.document.series.every((ud) => ud.id !== ad.id);
    });
    return orderBy(filteredMeetings, ['name'], ['asc']);
  }

  async handleAssociateMeeting() {
    const { selectedMeetingId, loading } = this.state;
    const { document, documentUpdated } = this.props;

    if (loading === LoadStates.Loading || isEmpty(selectedMeetingId)) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.create(
        `series/${selectedMeetingId}/documents/${document.id}`
      );
      if (!resp.good) {
        throw new Error('Error associating document to meeting.');
      }
      this.setPartial({
        loading: LoadStates.Succeeded,
        selectedMeetingId: '',
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.SUCCESS,
        alertMsg: Localizer.get('Successfully added to meeting.'),
      });
      documentUpdated();
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.DANGER,
        alertMsg: Localizer.get('Error adding to meeting. Please try again.'),
      });
    }
    // auto-close the alert
    setTimeout(() => {
      this.setPartial({ showAlert: false, alertMsg: '' });
    }, 2000);
  }

  async handleRemoveMeeting() {
    const { selectedMeetingId, loading } = this.state;
    const { document, documentUpdated } = this.props;

    if (loading === LoadStates.Loading || isEmpty(selectedMeetingId)) {
      return;
    }
    this.setPartial({ loading: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.delete(
        `series/${selectedMeetingId}/documents/${document.id}`
      );

      if (!isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      } else if (!resp.good) {
        throw new Error('Error removing meeting. Please try again.');
      }

      this.setPartial({
        loading: LoadStates.Succeeded,
        selectedMeetingId: '',
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.SUCCESS,
        alertMsg: Localizer.get('Successfully removed meeting.'),
      });
      documentUpdated();
    } catch (error) {
      console.error(error);
      this.setPartial({
        loading: LoadStates.Failed,
        showAlert: true,
        alertStyle: ALERT_STYLE_TYPE.DANGER,
        alertMsg: Localizer.get(error.message),
      });
    }
    // auto-close the alert
    setTimeout(() => {
      this.setPartial({ showAlert: false, alertMsg: '' });
    }, 2000);
  }

  handleTabSelect(selectedTab: TAB_GROUP_TYPE) {
    this.setPartial({
      selectedTab,
      selectedMeetingId: '',
    });
  }

  handleClose() {
    this.props.onClosed();
  }

  performRender() {
    const {
      loading,
      selectedTab,
      selectedMeetingId,
      showAlert,
      alertStyle,
      alertMsg,
    } = this.state;
    const { show, document } = this.props;
    const filteredMeetings = this.getFilteredMeetings();

    return (
      <GenericModal
        show={show}
        modalTitle={Localizer.get('Associate Document')}
        onCloseClicked={() => this.handleClose()}
        hasCloseButton={true}
        closeButtonType="close"
        closeButtonDisable={loading === LoadStates.Loading}
        bodyClassName="associate-document-meeting-modal"
      >
        <form noValidate>
          <p className="name">
            <FaFilePdf className="icon" />
            {document.fileName}
          </p>
          <p className="meeting">
            <FaChalkboard className="icon" />
            {!isEmpty(document.series)
              ? document.series.map((assoc, index) =>
                  index + 1 === document.series.length
                    ? assoc.name
                    : assoc.name + ', '
                )
              : '– –'}
          </p>
          <Tabs
            id="meeting-group-type"
            activeKey={selectedTab}
            onSelect={(tab) => this.handleTabSelect(tab)}
          >
            <Tab
              eventKey={TAB_GROUP_TYPE.ADD_MEETING}
              title={Localizer.get('Add to Meeting')}
            >
              <div className="d-flex align-items-center mt-2">
                <FormGroup controlId="allMeetings" className="w-100">
                  <ControlLabel>
                    {Localizer.get('Choose a meeting to add to')}
                  </ControlLabel>
                  <FormControl
                    value={selectedMeetingId}
                    componentClass="select"
                    onChange={(e: any) =>
                      this.setPartial({ selectedMeetingId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      – –
                    </option>
                    {filteredMeetings.map((meeting) => (
                      <option key={meeting.id} value={meeting.id}>
                        {meeting.name}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
                <Button
                  bsStyle="success"
                  className="mt-1 ml-1"
                  onClick={() => this.handleAssociateMeeting()}
                  disabled={isEmpty(selectedMeetingId)}
                >
                  <FaPlus />
                  <span className="ml-1">{Localizer.get('Add')}</span>
                </Button>
              </div>
            </Tab>
            <Tab
              eventKey={TAB_GROUP_TYPE.REMOVE_MEETING}
              title={Localizer.get('Remove from Meeting')}
            >
              <div className="d-flex align-items-center mt-2">
                <FormGroup controlId="documentMeetings" className="w-100">
                  <ControlLabel>
                    {Localizer.get('Choose a meeting to remove from')}
                  </ControlLabel>
                  <FormControl
                    value={selectedMeetingId}
                    componentClass="select"
                    onChange={(e: any) =>
                      this.setPartial({ selectedMeetingId: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      – –
                    </option>
                    {!isEmpty(document.series) &&
                      document.series.map((assoc) => (
                        <option
                          key={assoc.id}
                          value={assoc.id}
                          defaultChecked={false}
                        >
                          {assoc.name}
                        </option>
                      ))}
                  </FormControl>
                </FormGroup>
                <Button
                  bsStyle="danger"
                  className="mt-1 ml-1"
                  onClick={() => this.handleRemoveMeeting()}
                  disabled={isEmpty(selectedMeetingId)}
                >
                  Remove
                </Button>
              </div>
            </Tab>
          </Tabs>
          {showAlert && (
            <Animated in>
              <Alert
                onDismiss={() => {
                  this.setPartial({ showAlert: false, alertMsg: '' });
                }}
                bsStyle={alertStyle}
              >
                {Localizer.get(alertMsg)}
              </Alert>
            </Animated>
          )}
        </form>
      </GenericModal>
    );
  }
}

export default AssociateDocumentToMeetingModal;
