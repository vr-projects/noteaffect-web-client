import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { BsFillExclamationTriangleFill, BsBellFill } from 'react-icons/bs';
import { FaCheck } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import isEmpty from 'lodash/isEmpty';
import { Alert, Table, Button } from 'react-bootstrap';
import { SrUiComponent, LoadStates, ApiHelpers } from 'react-strontium';
import DateFormatUtil from '../../../utilities/DateFormatUtil';
import ErrorUtil from '../../../utilities/ErrorUtil';
import Localizer from '../../../utilities/Localizer';
import ISecurityReport from '../../../models/ISecurityReport';
import AppMappers from '../../../mappers/AppMappers';
import IImmutableObject from '../../../interfaces/IImmutableObject';
import IUserInformation from '../../../interfaces/IUserInformation';
import * as CoursesActions from '../../../store/courses/CoursesActions';

export enum SecurityReportType {
  Presentation = 'presentation',
  Documents = 'documents',
}

interface IConnectedSecurityReportProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ISecurityReportProps {
  seriesId: number;
  reportType: SecurityReportType;
  securityReport: ISecurityReport[];
  onShouldUpdate: () => void;
}

interface ISecurityReportState {
  saveState: LoadStates;
}

enum ACKNOWLEDGE_BUTTON_STATES {
  SAVING = 'saving',
  SUCCESS = 'success',
  ERROR = 'error',
  DEFAULT = 'default',
  NEED_TO_ACKNOWLEDGE = 'need-to-acknowledge',
  NONE_TO_ACKNOWLEDGE = 'none-to-acknowledge',
}

class SecurityReport extends SrUiComponent<
  IConnectedSecurityReportProps & ISecurityReportProps,
  ISecurityReportState
> {
  initialState() {
    return {
      saveState: LoadStates.Unloaded,
    };
  }

  async handleAcknowledgeClick() {
    const { securityReport, seriesId, onShouldUpdate, dispatch } = this.props;
    const { saveState } = this.state;
    if (saveState === LoadStates.Loading) return;

    this.setPartial({
      saveState: LoadStates.Loading,
    });

    const promises = securityReport
      .filter((violation) => !violation.acknowledged)
      .map((violation) => {
        return ApiHelpers.update(`security/${violation.id}/acknowledge`, {
          Acknowledged: true,
        });
      });

    await Promise.all(promises)
      .then((responses) => {
        const allGood = responses.every((res) => res.good);

        if (!allGood) {
          throw new Error(
            Localizer.get(
              'There was an error acknowledging security violations'
            )
          );
        }

        responses.forEach((res) => {
          ErrorUtil.handleAPIErrors(
            res,
            'There was an error acknowledging certain violations'
          );
        });

        this.setPartial({
          saveState: LoadStates.Succeeded,
        });

        setTimeout(async () => {
          await dispatch(CoursesActions.getUpdatedCourse(seriesId, true));
          await onShouldUpdate();
        }, 1000);
      })
      .catch((error) => {
        console.error(error);
        this.setPartialAsync({
          saveState: LoadStates.Failed,
        });
      });
  }

  getButtonState(): ACKNOWLEDGE_BUTTON_STATES {
    const { securityReport } = this.props;
    const { saveState } = this.state;
    const hasUnacknowledged = !isEmpty(
      securityReport.filter((report) => !report.acknowledged)
    );

    switch (true) {
      case !hasUnacknowledged:
        return ACKNOWLEDGE_BUTTON_STATES.NONE_TO_ACKNOWLEDGE;
      case hasUnacknowledged && saveState === LoadStates.Unloaded:
        return ACKNOWLEDGE_BUTTON_STATES.NEED_TO_ACKNOWLEDGE;
      case saveState === LoadStates.Succeeded:
        return ACKNOWLEDGE_BUTTON_STATES.SUCCESS;
      case saveState === LoadStates.Failed:
        return ACKNOWLEDGE_BUTTON_STATES.ERROR;
      case saveState === LoadStates.Loading:
        return ACKNOWLEDGE_BUTTON_STATES.SAVING;
      default:
        return ACKNOWLEDGE_BUTTON_STATES.DEFAULT;
    }
  }

  getAcknowledgeButtonStyle(saveState: ACKNOWLEDGE_BUTTON_STATES) {
    switch (saveState) {
      case ACKNOWLEDGE_BUTTON_STATES.SUCCESS:
        return 'success';
      case ACKNOWLEDGE_BUTTON_STATES.ERROR:
        return 'danger';
      case ACKNOWLEDGE_BUTTON_STATES.NEED_TO_ACKNOWLEDGE:
      case ACKNOWLEDGE_BUTTON_STATES.SAVING:
        return 'warning';
      case ACKNOWLEDGE_BUTTON_STATES.DEFAULT:
      case ACKNOWLEDGE_BUTTON_STATES.NONE_TO_ACKNOWLEDGE:
      default:
        return 'default';
    }
  }

  getAcknowledgeButtonText(saveState: ACKNOWLEDGE_BUTTON_STATES): string {
    switch (saveState) {
      case ACKNOWLEDGE_BUTTON_STATES.NONE_TO_ACKNOWLEDGE:
        return 'None to Acknowledge';
      case ACKNOWLEDGE_BUTTON_STATES.SUCCESS:
        return 'Success';
      case ACKNOWLEDGE_BUTTON_STATES.ERROR:
        return 'Error';
      case ACKNOWLEDGE_BUTTON_STATES.SAVING:
        return 'Saving...';
      case ACKNOWLEDGE_BUTTON_STATES.NEED_TO_ACKNOWLEDGE:
      case ACKNOWLEDGE_BUTTON_STATES.DEFAULT:
      default:
        return 'Acknowledge';
    }
  }

  getAcknowledgeButtonDisabled(saveState: ACKNOWLEDGE_BUTTON_STATES): boolean {
    switch (saveState) {
      case ACKNOWLEDGE_BUTTON_STATES.DEFAULT:
      case ACKNOWLEDGE_BUTTON_STATES.NEED_TO_ACKNOWLEDGE:
        return false;
      case ACKNOWLEDGE_BUTTON_STATES.SUCCESS:
      case ACKNOWLEDGE_BUTTON_STATES.NONE_TO_ACKNOWLEDGE:
      case ACKNOWLEDGE_BUTTON_STATES.SAVING:
      case ACKNOWLEDGE_BUTTON_STATES.ERROR:
        return true;
    }
  }

  getAcknowledgeButtonIcon(saveState: ACKNOWLEDGE_BUTTON_STATES) {
    switch (saveState) {
      case ACKNOWLEDGE_BUTTON_STATES.SUCCESS:
        return <FaCheck />;
      case ACKNOWLEDGE_BUTTON_STATES.NONE_TO_ACKNOWLEDGE:
        return null;
      case ACKNOWLEDGE_BUTTON_STATES.SAVING:
        return <ImSpinner2 className="spinner-spin" />;
      case ACKNOWLEDGE_BUTTON_STATES.ERROR:
        return <BsFillExclamationTriangleFill />;
      case ACKNOWLEDGE_BUTTON_STATES.DEFAULT:
      case ACKNOWLEDGE_BUTTON_STATES.NEED_TO_ACKNOWLEDGE:
      default:
        return <BsBellFill />;
    }
  }

  performRender() {
    const { saveState } = this.state;
    const { reportType, userInformation, securityReport } = this.props;
    const userTimezone = userInformation.toJS().timezone;

    const acknowledgeButtonState = this.getButtonState();
    const acknowledgeButtonStyle = this.getAcknowledgeButtonStyle(
      acknowledgeButtonState
    );
    const acknowledgeButtonText = this.getAcknowledgeButtonText(
      acknowledgeButtonState
    );
    const acknowledgeButtonDisabled = this.getAcknowledgeButtonDisabled(
      acknowledgeButtonState
    );
    const acknowledgeButtonIcon = this.getAcknowledgeButtonIcon(
      acknowledgeButtonState
    );

    return (
      <>
        {saveState === LoadStates.Failed && (
          <Alert bsStyle="danger">
            {Localizer.get(
              'There was an error saving your Acknowledgement. Reload the page and try again.'
            )}
          </Alert>
        )}

        <div className="security-report">
          <div className="d-flex justify-content-between align-items-center">
            <h2>{Localizer.get('Security Events:')}</h2>
            <Button
              bsStyle={acknowledgeButtonStyle}
              className="align-self-center"
              disabled={acknowledgeButtonDisabled}
              onClick={() => this.handleAcknowledgeClick()}
            >
              {acknowledgeButtonIcon}
              <span className="ml-1">{acknowledgeButtonText}</span>
            </Button>
          </div>
          <hr />
          <Table responsive className="report-table">
            <thead>
              <tr>
                <th>{Localizer.get('Status')}</th>
                <th>{Localizer.get('Date')}</th>
                <th>{Localizer.get('Participant')}</th>
                <th>{Localizer.get('Security Event')}</th>
                {reportType === SecurityReportType.Presentation && (
                  <th>{Localizer.get('Presentation / Segment')}</th>
                )}
                {reportType === SecurityReportType.Documents && (
                  <th>{Localizer.get('Document')}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {!isEmpty(securityReport) ? (
                securityReport.map((report, index) => (
                  <tr key={`report-${index}`}>
                    <td className="whitespace-nowrap">
                      {report.acknowledged && (
                        <>
                          <FaCheck className="text-success" />
                          <span className="ml-1">
                            {Localizer.get('Acknowledged')}
                          </span>
                        </>
                      )}
                      {!report.acknowledged && (
                        <>
                          {saveState === LoadStates.Loading && (
                            <>
                              <ImSpinner2 className="spinner-spin" />
                              <span className="ml-1">
                                {Localizer.get('Saving...')}
                              </span>
                            </>
                          )}
                          {saveState === LoadStates.Unloaded && (
                            <>
                              <BsBellFill className="text-warning" />
                              <span className="ml-1">
                                {Localizer.get('Unacknowledged')}
                              </span>
                            </>
                          )}
                          {saveState === LoadStates.Succeeded && (
                            <>
                              <FaCheck className="text-default" />
                              <span className="ml-1">
                                {Localizer.get('Successfully saved!')}
                              </span>
                            </>
                          )}
                          {saveState === LoadStates.Failed && (
                            <>
                              <BsFillExclamationTriangleFill className="text-danger" />
                              <span className="ml-1">
                                {Localizer.get('Error')}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {report.dateOccurred
                        ? DateFormatUtil.getUnixToGivenTimezone(
                            report.dateOccurred,
                            userTimezone,
                            'MM/DD/YYYY, h:mm A'
                          )
                        : '– –'}
                    </td>
                    <td>{report.participant ? report.participant : '– –'}</td>
                    <td>{report.eventType ? report.eventType : '– –'}</td>

                    {reportType === SecurityReportType.Presentation && (
                      <td>
                        {report.lectureName ? report.lectureName : '– –'} /{' '}
                        {report.slide ? report.slide.toString() : '– –'}
                      </td>
                    )}
                    {reportType === SecurityReportType.Documents && (
                      <td>
                        {report.resourceType === 'UserFile'
                          ? report.userFilename
                          : '– –'}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <Alert bsStyle="info" className="mb-0">
                      {Localizer.get(
                        'There are no security violations for this'
                      )}
                      <span>&#32;</span>
                      {reportType === SecurityReportType.Documents
                        ? 'document.'
                        : 'presentation.'}
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </>
    );
  }
}

export default connect<IConnectedSecurityReportProps, {}, ISecurityReportProps>(
  AppMappers.AppMapper
)(SecurityReport);
