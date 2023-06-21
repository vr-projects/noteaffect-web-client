import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import {
  BsArrowClockwise,
  BsExclamationTriangle,
  BsCheck,
  BsPlay,
} from 'react-icons/bs';
import { FaDownload } from 'react-icons/fa';
import { SrUiComponent, WaitSpinner, Animated } from 'react-strontium';
import ISecurityError from '../../models/ISecurityError';
import ISecurityViolation from '../../models/ISecurityViolation';
import { SECURITY_OVERLAY } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import AppMappers from '../../mappers/AppMappers';
import SecurityAppApiService from '../../api/SecurityAppApiService';
import ICourse from '../../models/ICourse';
import * as SecurityActions from '../../store/security/SecurityActions';
import { getDownloadPresentationViewerRoute } from '../../services/LinkService';
import Link from '../controls/Link';

interface IConnectedSecurityOverlayProps extends DispatchProp<any> {
  showSecurityOverlay: boolean;
  isSecurityMode: boolean;
  isSecurityAppOn: boolean;
  isSecurityCheckDone: boolean;
  isSecurityAppLoading: boolean;
  isSecurityAppMonitoring: boolean;
  isOnLivePresentationView: boolean;
  securityErrors: ISecurityError[];
  securityViolations: ISecurityViolation[];
}

interface ISecurityOverlayProps {
  series: ICourse | null;
  routesToMonitor: string[];
}

interface ISecurityOverlayState {}

class SecurityOverlay extends SrUiComponent<
  IConnectedSecurityOverlayProps & ISecurityOverlayProps,
  ISecurityOverlayState
> {
  constructor(props) {
    super(props);
    this.onWindowBlurred = this.onWindowBlurred.bind(this);
    this.onWindowFocused = this.onWindowFocused.bind(this);
  }

  checkReady(props) {
    const { isSecurityMode, isSecurityAppOn, isSecurityCheckDone } = props;

    return isSecurityMode && isSecurityAppOn && isSecurityCheckDone;
  }

  getIsMonitoredRoute() {
    const onMonitoredRoute = this.props.routesToMonitor.some((route) =>
      window.location.href.includes(route)
    );
    return onMonitoredRoute;
  }

  onComponentMounted() {
    window.addEventListener('blur', this.onWindowBlurred);
    window.addEventListener('focus', this.onWindowFocused);
  }

  componentWillUnmount() {
    window.removeEventListener('blur', this.onWindowBlurred);
    window.removeEventListener('focus', this.onWindowFocused);
  }

  onWindowBlurred() {
    const { dispatch, isOnLivePresentationView } = this.props;
    if (!this.checkReady(this.props) || !this.getIsMonitoredRoute()) return;
    dispatch(SecurityActions.setShowSecurityOverlay(true));
    dispatch(
      SecurityActions.setSecurityAppMonitoring({
        isMonitoring: false,
        isLive: isOnLivePresentationView,
      })
    );
  }

  onWindowFocused() {
    const { dispatch, isOnLivePresentationView } = this.props;
    if (!this.checkReady(this.props) || !this.getIsMonitoredRoute()) return;
    dispatch(
      SecurityActions.setSecurityAppMonitoring({
        isMonitoring: true,
        isLive: isOnLivePresentationView,
      })
    );
    dispatch(SecurityActions.checkCanHideSecurityOverlay());
  }

  async shutdownSecurityAppReloadWindow() {
    await SecurityAppApiService.shutdownSecurityApp();
    window.location.reload();
  }

  async acknowledgeSecurityViolation(violation: ISecurityViolation) {
    this.props.dispatch(
      SecurityActions.acknowledgeSecurityViolation(violation)
    );
  }

  performRender() {
    const {
      showSecurityOverlay,
      isSecurityAppOn,
      isSecurityAppLoading,
      securityErrors,
      securityViolations,
      isSecurityAppMonitoring,
    } = this.props;

    if (!showSecurityOverlay) {
      return null;
    }

    return (
      <div className="security-overlay">
        {isSecurityAppLoading ? (
          <div className="security-overlay-loader">
            <WaitSpinner />
          </div>
        ) : (
          <div className="security-overlay-wrapper">
            <Animated in>
              <section className="security-overlay-error-container">
                <h2 className="security-warning-title">
                  {Localizer.getFormatted(SECURITY_OVERLAY.PRESENTATION_VIEWER)}
                </h2>

                {/* Blurred Browser Message */}
                {isEmpty(securityErrors) &&
                  isEmpty(securityViolations) &&
                  isSecurityAppOn &&
                  !isSecurityAppMonitoring && (
                    <section className="security-warning-help">
                      <p>
                        {Localizer.get(
                          'Click on the screen or button below to continue viewing the presentation'
                        )}
                      </p>
                      <Button
                        bsStyle="success"
                        className="security-action-button"
                      >
                        <BsPlay />
                        <span className="ml-1">
                          {Localizer.get('Continue')}
                        </span>
                      </Button>
                    </section>
                  )}

                {/* Errors */}
                {!isEmpty(securityErrors) && (
                  <>
                    {securityErrors.map((err, idx) => (
                      <p
                        className="security-warning-error"
                        key={`${err.errorCode}-${idx}`}
                      >
                        <BsExclamationTriangle className="security-warning-icon" />
                        <span className="security-warning-message">
                          {err.errorDesc}
                        </span>
                      </p>
                    ))}

                    {/* Not Running Reload explanation */}
                    <section className="security-warning-help">
                      <p className="security-warning-help-message">
                        {Localizer.getFormatted(
                          SECURITY_OVERLAY.HELP_MESSAGE_1
                        )}
                      </p>
                      <p className="security-warning-help-message">
                        {Localizer.getFormatted(
                          SECURITY_OVERLAY.HELP_MESSAGE_2
                        )}
                      </p>
                      <Button
                        bsStyle="success"
                        className="security-action-button"
                        onClick={() => this.shutdownSecurityAppReloadWindow()}
                      >
                        <BsArrowClockwise />
                        <span className="ml-1">
                          {Localizer.get('Reload Presentation Viewer')}
                        </span>
                      </Button>
                    </section>

                    {/* Download Explanation */}
                    <section className="security-warning-help">
                      <p className="security-warning-help-message">
                        {Localizer.getFormatted(
                          SECURITY_OVERLAY.DOWNLOAD_INSTRUCTIONS
                        )}
                      </p>

                      <Link
                        className="btn btn-warning security-action-button"
                        href={getDownloadPresentationViewerRoute()}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FaDownload />
                        <span className="ml-1">
                          {Localizer.get('Download Presentation Viewer')}
                        </span>
                      </Link>
                    </section>
                  </>
                )}

                {/* Violations */}
                {!isEmpty(securityViolations) && (
                  <>
                    <p className=" security-warning-error">
                      <BsExclamationTriangle className="security-warning-icon" />
                      <span className="security-warning-message">
                        {Localizer.get('Security Violations Detected')}
                      </span>
                    </p>

                    {securityViolations.map((violation, idx) => (
                      <section
                        key={`${violation.eventDate}-${violation.eventMethod}-${idx}`}
                        className="security-warning-help"
                      >
                        <p className="security-warning-help-message">
                          {Localizer.get('Violation Type:')}&nbsp;
                          <strong>{violation.eventType}</strong>
                        </p>

                        <p className="security-warning-help-message">
                          {Localizer.get(
                            'You have violated the security policies for this meeting.'
                          )}
                        </p>
                        <Button
                          bsStyle="success"
                          className="security-action-button mt-2"
                          onClick={() =>
                            this.acknowledgeSecurityViolation(violation)
                          }
                        >
                          <BsCheck />
                          <span className="ml-1">
                            {Localizer.get('Acknowledge')}
                          </span>
                        </Button>
                      </section>
                    ))}
                  </>
                )}
              </section>
            </Animated>
          </div>
        )}
      </div>
    );
  }
}

export default connect<
  IConnectedSecurityOverlayProps,
  () => void,
  ISecurityOverlayProps
>(AppMappers.AppMapper)(SecurityOverlay);
