/**
 * One component for both Individual (External - at /rsvp/registration) and Distro (Internal - at /app/rsvp/distro-registration)
 * Individual (External) enter from unauthenticated url /rsvp/registration
 * Distro (Internal) enter from authenticated url /app/rsvp/distro-registration
 */
import React from 'react';
import isNull from 'lodash/isNull';
import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import {
  Button,
  Image,
  Form,
  FormGroup,
  ControlLabel,
  MenuItem,
  ButtonToolbar,
  Dropdown,
  Alert,
  Well,
} from 'react-bootstrap';
import {
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegQuestionCircle,
  FaChevronDown,
} from 'react-icons/fa';
import {
  SrUiComponent,
  ApiHelpers,
  Animated,
  LoadStates,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import RsvpResponses from '../../enums/RsvpResponses';
import RsvpSVG from '../../svgs/rsvp.svg';
import { getLogInUrl } from 'services/LinkService';
import DateFormatUtil from '../../utilities/DateFormatUtil';
import { loadingDashString } from '../../services/DashLoadingService';

interface IRsvpRegistrationProps {
  seriesId: string;
  code: string;
  isDistro: boolean;
  ready: boolean;
  userId?: string;
  rsvp?: RsvpResponses;
  seriesUserId?: string;
}

interface IMeetingDetails {
  displayId: string;
  id: number;
  name: string;
  presenter: string;
  presenterTimezone: string;
  location: string;
  start: number;
  end: number;
}

enum API_FLOW {
  WILL_DO_CALLS = 'WILL_DO_CALLS',
  WILL_GET = 'WILL_GET',
  DID_GET = 'DID_GET',
  WILL_PATCH = 'WILL_PATCH',
  DID_PATCH = 'DID_PATCH',
  DID_DO_CALLS = 'DID_DO_CALLS',
}

enum ERROR_TYPE {
  GET = 'GET_ERROR',
  PATCH = 'PATCH_ERROR',
  GET_PATCH = 'GET_PATCH_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED_ERROR',
}

interface IRsvpRegistrationState {
  loading: LoadStates;
  selectedRsvpResponse: RsvpResponses;
  dropdownTouched: boolean;
  meetingDetails: IMeetingDetails;
  apiFlow: API_FLOW;
  errorType: ERROR_TYPE;
  showConfirmButton: boolean;
}

const ResponsesOptions = {
  [RsvpResponses.Accept]: {
    value: RsvpResponses.Accept,
    label: 'Yes, I will attend',
    icon: () => <FaRegCheckCircle className="text-success" />,
  },
  [RsvpResponses.Decline]: {
    value: RsvpResponses.Decline,
    label: 'No, I will not attend',
    icon: () => <FaRegTimesCircle className="text-danger" />,
  },
  [RsvpResponses.Tentative]: {
    value: RsvpResponses.Tentative,
    label: 'Tentative',
    icon: () => <FaRegQuestionCircle className="text-warning" />,
  },
};

class RsvpRegistration extends SrUiComponent<
  IRsvpRegistrationProps,
  IRsvpRegistrationState
> {
  initialState() {
    const { rsvp } = this.props;

    return {
      loading: LoadStates.Unloaded,
      selectedRsvpResponse:
        isNumber(Number(rsvp)) &&
        Object.values(RsvpResponses).includes(Number(rsvp))
          ? Number(rsvp)
          : null,
      dropdownTouched: false,
      meetingDetails: {
        id: null,
        displayId: null,
        name: null,
        presenter: null,
        presenterTimezone: null,
        start: null,
        end: null,
        location: null,
      },
      apiFlow: null,
      errorType: null,
      showConfirmButton: false,
    };
  }

  onComponentMounted() {
    const { rsvp, isDistro } = this.props;
    const shouldPreselectOnLoad = !isDistro;

    this.handleResponseSelect(rsvp, shouldPreselectOnLoad);
    this.onLoadAPICalls();
  }

  /**
   * Method gets meeting details, and submits response on load if is on rsvp/registration route outside of app
   */
  async onLoadAPICalls() {
    this.setPartial({ apiFlow: API_FLOW.WILL_DO_CALLS });
    await this.getMeetingDetails();
    await this.handleExternalSubmitResponseOnLoad();
  }

  /**
   * Method handles preselencting RSVP type on load, and also for handling user selection from dropdown
   * @param value RsvpResponses, need to be Number()
   * @param isNonDistroOnLoad to handle touched flags on non-distro, rsvp/registration to prepopulate answers on page load
   */
  handleResponseSelect(value: RsvpResponses, isNonDistroOnLoad?: boolean) {
    this.setPartial({
      selectedRsvpResponse: Number(value),
      dropdownTouched: isNonDistroOnLoad ? false : true,
      showConfirmButton: isNonDistroOnLoad ? false : true,
    });
  }

  /**
   * Method guards calling from /rsvp/registration to submit rsvp response on page load
   */
  async handleExternalSubmitResponseOnLoad() {
    const { isDistro } = this.props;
    const { errorType } = this.state;

    if (isDistro || errorType === ERROR_TYPE.UNAUTHORIZED) {
      return;
    }
    await this.handleSubmitResponse();
  }

  /**
   * Component receives either userId or seriesUserId depneding on parent component
   * <ExternalRsvpRegistrationGuard> passes the optional userId on the query string
   * - userId defined for already registered users
   * - userId undefined for users who have not created an account, but are in the invitations table
   * <RsvpRegistrationGuard> passes the required seriesUserId
   * - this is passed along the query params via the special DistroInvitation and DistroLogin backend pages
   * - this is required for the meeting details API call, and is the id in the series_users table
   */
  getAdjustedSeriesUserId() {
    const { userId, seriesUserId, isDistro } = this.props;

    if (!isDistro) {
      return userId;
    }

    if (isDistro && !isUndefined(seriesUserId)) {
      return seriesUserId;
    }

    return userId;
  }

  /**
   * Method gets meeting details to display in the card
   * Method also acts as authentication/authorization guard to ensure the user has been invited to the meeting
   * On 401 errors, triggers display of unuauthorized messages
   */
  async getMeetingDetails() {
    const { seriesId, code } = this.props;
    const adjustedSeriesUserId = this.getAdjustedSeriesUserId();

    this.setState({
      loading: LoadStates.Loading,
      apiFlow: API_FLOW.WILL_GET,
    });

    try {
      const apiUrl = `series/${seriesId}/users${
        !isUndefined(adjustedSeriesUserId) ? `/${adjustedSeriesUserId}` : ''
      }/rsvp?code=${code}`;

      const rsvpGetResp = await ApiHelpers.read(apiUrl);

      if (!rsvpGetResp.good) {
        if (rsvpGetResp.errors.includes(401)) {
          throw new Error(ERROR_TYPE.UNAUTHORIZED);
        }
        throw new Error(ERROR_TYPE.GET);
      }

      // The default SrWebApiConnection does not handle parsing out responseData while CustomApiConnection does
      // Depending on which connection is used when this component is called causes the JSON object's structure to vary
      // The following two lines is to be able to handle setting meeting details either way.
      let meetingDetails = JSON.parse(rsvpGetResp.data);
      meetingDetails = meetingDetails.responseData || meetingDetails;

      this.setPartial({
        meetingDetails,
        loading: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error.message);

      this.setPartial({
        loading: LoadStates.Failed,
        errorType: error.message,
      });
    } finally {
      this.setState({ apiFlow: API_FLOW.DID_GET });
    }
  }

  /**
   * Method submits chosen rsvp answer, both on page load for non-distro/external and for user selected responses
   */
  async handleSubmitResponse() {
    const { seriesId, code } = this.props;
    const { selectedRsvpResponse } = this.state;
    const adjustedSeriesUserId = this.getAdjustedSeriesUserId();

    this.setState({
      loading: LoadStates.Loading,
      apiFlow: API_FLOW.WILL_PATCH,
    });

    try {
      const apiUrl = `series/${seriesId}/users${
        !isUndefined(adjustedSeriesUserId) ? `/${adjustedSeriesUserId}` : ''
      }/rsvp`;
      const payload = {
        rsvp: selectedRsvpResponse,
        code,
      };
      const rsvpResp = await ApiHelpers.update(apiUrl, payload);

      if (!rsvpResp.good) {
        throw new Error('Error sending rsvp');
      }

      this.setState({
        loading: LoadStates.Succeeded,
      });
    } catch (error) {
      console.error(error);
      const { errorType } = this.state;

      this.setState({
        loading: LoadStates.Failed,
        errorType: isNull(errorType) ? ERROR_TYPE.PATCH : ERROR_TYPE.GET_PATCH,
      });
    } finally {
      this.setPartial({
        apiFlow: API_FLOW.DID_PATCH,
        showConfirmButton: false,
      });
    }
  }

  /**
   * Method creates selectable options for dropdown
   * @param code: RsvpResponses
   */
  getResponseItemJsx(code: RsvpResponses) {
    if (!Object.values(RsvpResponses).includes(code)) {
      return <span>{Localizer.get('Choose an option:')}</span>;
    }
    return (
      <>
        {ResponsesOptions[code].icon()}
        <span className="ml-1">
          {Localizer.get(ResponsesOptions[code].label)}
        </span>
      </>
    );
  }

  /**
   * Method handles internal and external redirect
   * - Distro flow assumes already in application, so redirects to dashboard
   * - External Non-Distro is outside app, so redirects to Login page, and provides returnUrl to redirect to dashboard after login
   */
  handleGoToMeetings() {
    const { isDistro } = this.props;

    if (!isDistro) {
      const loginRedirectToDashboard = getLogInUrl('dashboard', false);
      window.location.replace(loginRedirectToDashboard);
      return;
    }

    this.navigate('dashboard');
  }

  /**
   * Method provides dynamic title text according to API flow and error types
   */
  getRsvpTitle() {
    const { isDistro } = this.props;
    const { apiFlow, errorType } = this.state;

    switch (true) {
      case apiFlow === API_FLOW.WILL_DO_CALLS:
      case apiFlow === API_FLOW.WILL_GET:
        return Localizer.get('Loading data...');
      case apiFlow === API_FLOW.WILL_PATCH:
        return Localizer.get('Saving RSVP data...');
      case apiFlow === API_FLOW.DID_PATCH &&
        (errorType === ERROR_TYPE.PATCH || errorType === ERROR_TYPE.GET_PATCH):
        return Localizer.get('There was an error saving your RSVP.');
      case apiFlow === API_FLOW.DID_PATCH:
        return Localizer.get('Thanks! Your RSVP has been recorded.');
      case isDistro &&
        apiFlow === API_FLOW.DID_GET &&
        errorType === ERROR_TYPE.UNAUTHORIZED:
      case !isDistro && errorType === ERROR_TYPE.UNAUTHORIZED:
        return Localizer.get('RSVP Unauthorized');
      case isDistro && apiFlow === API_FLOW.DID_GET:
        return Localizer.get('Please choose your RSVP type:');
      default:
        return Localizer.get('Please choose your RSVP type:');
    }
  }

  performRender() {
    const { ready } = this.props;
    const {
      loading,
      selectedRsvpResponse,
      meetingDetails,
      meetingDetails: {
        displayId,
        name,
        presenter,
        presenterTimezone,
        start,
        end,
        location,
      },
      errorType,
      showConfirmButton,
    } = this.state;
    if (!ready) return null;
    const hasMeetingDetails = !isNull(meetingDetails);
    const title = this.getRsvpTitle();
    const patchError =
      errorType === ERROR_TYPE.GET_PATCH || errorType === ERROR_TYPE.PATCH;
    const unauthorizedError = errorType === ERROR_TYPE.UNAUTHORIZED;
    const hasMajorError = patchError || unauthorizedError;

    return (
      <div className="rsvp-registration rsvp-page">
        <Animated in>
          <div className="rsvp-grid">
            <div className="rsvp-title-container rsvp-grid-item">
              <h1
                className={`rsvp-title ${
                  loading === LoadStates.Failed ? 'text-danger' : ''
                }`}
              >
                {title}
              </h1>
            </div>
            <div
              className={`rsvp-card-container rsvp-grid-item ${
                patchError || unauthorizedError ? 'patch-error' : ''
              }`}
            >
              {!hasMajorError ? (
                <div className="rsvp-card">
                  {/* Form */}
                  <div className="rsvp-response">
                    <Form inline noValidate>
                      <FormGroup
                        className="w-100"
                        controlId="formMeetingDetails"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <ControlLabel className="mr-3">
                            {Localizer.get('My Response:')}
                          </ControlLabel>

                          <ButtonToolbar className="meeting-response-dropdown-container flex-grow d-flex">
                            <Dropdown
                              id="meeting-response-dropdown"
                              onSelect={(value) =>
                                this.handleResponseSelect(value)
                              }
                              className="flex-grow d-flex"
                              disabled={loading === LoadStates.Loading}
                            >
                              <Dropdown.Toggle
                                noCaret
                                bsStyle={'default'}
                                className="dropdown-toggle-btn flex-grow d-flex justify-content-start"
                              >
                                {this.getResponseItemJsx(selectedRsvpResponse)}
                                <FaChevronDown className="ml-auto" />
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {Object.keys(ResponsesOptions).map((key) => (
                                  <MenuItem
                                    key={`response-${key}`}
                                    eventKey={ResponsesOptions[key].value}
                                  >
                                    {this.getResponseItemJsx(
                                      ResponsesOptions[key].value
                                    )}
                                  </MenuItem>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          </ButtonToolbar>
                        </div>
                      </FormGroup>
                    </Form>
                    <Well className="p-1">
                      <span>
                        {Localizer.get(
                          'Meeting will be accessible from your NoteAffect Dashboard regardless of RSVP response'
                        )}
                      </span>
                    </Well>
                  </div>

                  {/* Metadata */}
                  <div className="rsvp-metadata">
                    {errorType !== ERROR_TYPE.GET ? (
                      <>
                        <p className="rsvp-metadata-item">
                          <strong>{Localizer.get('Details:')}</strong>
                          <span className="ml-2">
                            {loadingDashString(
                              !hasMeetingDetails,
                              `${name} (${displayId})`
                            )}
                          </span>
                        </p>
                        <p className="rsvp-metadata-item">
                          <strong>{Localizer.get('Presenter:')}</strong>
                          <span className="ml-2">
                            {loadingDashString(!hasMeetingDetails, presenter)}
                          </span>
                        </p>
                        <p className="rsvp-metadata-item">
                          <strong>{Localizer.get('Start:')}</strong>
                          <span className="ml-2">
                            {loadingDashString(
                              !hasMeetingDetails,
                              `${DateFormatUtil.getUnixToGivenTimezone(
                                start,
                                presenterTimezone
                              )} (${DateFormatUtil.getUnixToGivenTimezoneAbbr(
                                start,
                                presenterTimezone
                              )})`
                            )}
                          </span>
                        </p>
                        <p className="rsvp-metadata-item">
                          <strong>{Localizer.get('End:')}</strong>
                          <span className="ml-2">
                            {loadingDashString(
                              !hasMeetingDetails,
                              `${DateFormatUtil.getUnixToGivenTimezone(
                                end,
                                presenterTimezone
                              )} (${DateFormatUtil.getUnixToGivenTimezoneAbbr(
                                end,
                                presenterTimezone
                              )})`
                            )}
                          </span>
                        </p>
                        <p className="rsvp-metadata-item">
                          <strong>{Localizer.get('Location:')}</strong>
                          <span className="ml-2">
                            {loadingDashString(!hasMeetingDetails, location)}
                          </span>
                        </p>
                      </>
                    ) : (
                      <Alert bsStyle="warning">
                        {Localizer.get(
                          'There was an error getting your meeting details. You can still RSVP to this meeting, but you will have to log in to see the meeting details.'
                        )}
                      </Alert>
                    )}
                  </div>

                  {/* Submit Button*/}
                  <div className="rsvp-actions d-flex justify-content-between">
                    {showConfirmButton && (
                      <Button
                        className="ml-auto align-self-center"
                        disabled={
                          isNull(selectedRsvpResponse) ||
                          loading === LoadStates.Loading
                        }
                        bsStyle="info"
                        onClick={() => this.handleSubmitResponse()}
                      >
                        {Localizer.get('Confirm')}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="error-card">
                  {patchError && (
                    <>
                      <h3>{Localizer.get('Error Saving your RSVP')}</h3>
                      <p>{Localizer.get('Please try again later.')}</p>
                      <p>
                        {Localizer.get(
                          'If this error persists, contact the meeting presenter.'
                        )}
                      </p>
                    </>
                  )}
                  {unauthorizedError && (
                    <>
                      <h3>
                        {Localizer.get(
                          'You are unauthorized to RSVP to this meeting.'
                        )}
                      </h3>
                      <p>
                        {Localizer.get(
                          'Reach out to the meeting presenter if you are supposed to be able to RSVP to this meeting.'
                        )}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="rsvp-image-container rsvp-grid-item fa fa-spin">
              <Image
                src={RsvpSVG.toString()}
                className="rsvp-image fa fa-spin"
              />
            </div>

            {/* Registered Actions */}
            <div className="registered-actions-container rsvp-grid-item">
              <hr className="breaker" />

              <div className="registered-actions">
                <Button
                  bsStyle="link"
                  className="align-self-end na-btn-reset-width"
                  disabled={loading === LoadStates.Loading}
                  onClick={() => this.handleGoToMeetings()}
                >
                  {Localizer.get('Show all my upcoming meetings')}
                </Button>
              </div>
            </div>
          </div>
        </Animated>
      </div>
    );
  }
}

export default RsvpRegistration;
