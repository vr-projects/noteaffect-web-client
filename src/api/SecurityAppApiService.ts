import isNumber from 'lodash/isNumber';
import isUndefined from 'lodash/isUndefined';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import { runtime } from 'react-strontium';
import ServiceReduxConnectionServices from '../services/ServiceReduxConnectionServices';
import PromiseUtil from '../utilities/PromiseUtil';
import ISecurityAppPostPayload, {
  ResourceTypes,
} from '../models/ISecurityAppPostPayload';
import Dispatcher from '../utilities/Dispatcher';
import SecurityActionTypes from '../store/security/SecurityActionTypes';
import SecurityInternalErrorCodes from '../enums/SecurityInternalErrorCodes';
import SecurityAppServerErrorCodes from '../enums/SecurityAppServerErrorCodes';
import SecurityAppError from '../services/SecurityAppErrorService';
import SecurityError from '../services/SecurityErrorService';
import { CUSTOM_SECURITY_APP_ERRORS } from '../version/versionConstants';
import Localizer from '../utilities/Localizer';
import * as UAParserUtil from '../utilities/UAParserUtil';

const isSafari = UAParserUtil.getIsSafari();
const SECURITY_APP_BASE_URL = isSafari
  ? `${process.env.SECURITY_APP_API_BASE_URL_SAFARI}:${process.env.SECURITY_APP_API_PORT_SAFARI}`
  : `${process.env.SECURITY_APP_API_BASE_URL}:${process.env.SECURITY_APP_API_PORT}`;
const MAX_INIT_APP_RETRIES = 4; // 2
const INIT_APP_PING_DELAY = 5000; // 5000
const RUNNING_APP_PING_INTERVAL = 1000; // 1000
const MAX_APP_PING_RETRIES = 10; // 10
let RUNNING_APP_PING_RETRIES = 10; // 10, decrements

/**
 * Class housing methods to communicate with both internal NoteAffect web-server
 * and Security App endpoints
 */
class SecurityApiServiceClass {
  /**
   * Method checks to see if app is running, and launches app if not
   * Step 1 - check if app is already running
   * Step 2 - if app not running, allow to start for 5 seconds, then hit ping endpoint
   * Step 3 - allow app 5 more seconds and hit ping endpoint
   * Pings once every 5 seconds for 2x before quits
   * @param seriesId
   * @param remainingRetryAttempts
   */
  async getIsSecurityAppOn(seriesId: number, remainingRetryAttempts?: number) {
    remainingRetryAttempts = isNumber(remainingRetryAttempts)
      ? --remainingRetryAttempts
      : MAX_INIT_APP_RETRIES;
    let newSecurityAppError;

    try {
      const initAppResp = await fetch(`${SECURITY_APP_BASE_URL}/ping`);

      // IF server is off
      if (!initAppResp.ok) {
        const errorJson = await initAppResp.json();

        newSecurityAppError = new SecurityAppError(
          errorJson.isError,
          errorJson.errors
        );
        throw newSecurityAppError;
      }

      const initAppJson = await initAppResp.json();

      // If Security App server returns isError
      if (initAppJson.isError) {
        newSecurityAppError = new SecurityAppError(
          initAppJson.isError,
          initAppJson.errors
        );
        throw newSecurityAppError;
      }

      // Reset all errors
      Dispatcher.dispatch({
        type: SecurityActionTypes.RemoveAllSecurityErrors,
      });

      Dispatcher.dispatch({
        type: SecurityActionTypes.SetIsSecurityAppOn,
        value: true,
      });
      return initAppJson;
    } catch (error) {
      // Allow 2 retries, timed out at 5000 ms
      //** Launch Security App on first failure */
      if (remainingRetryAttempts === MAX_INIT_APP_RETRIES) {
        this.launchSecurityApp(seriesId);
      }

      if (remainingRetryAttempts > 0) {
        //** Allow app to start in 5 seconds, then retry ping */
        return await PromiseUtil.promiseTimeout(
          () => this.getIsSecurityAppOn(seriesId, remainingRetryAttempts),
          INIT_APP_PING_DELAY
        );
      }

      //** On final attempt, Dispatch errors to Redux store */
      if (remainingRetryAttempts === 0) {
        // For default errors, construct new Security App error to match shape returned from server
        // Dispatch and set errors here
        this.dispatchSetErrors(error);
        Dispatcher.dispatch({
          type: SecurityActionTypes.SetIsSecurityAppOn,
          value: false,
        });

        return false;
      }
    }
  }

  // Dispatch proper Store events on error
  /**
   *
   * @param error ISecurityError
   */
  private dispatchSetErrors(
    error,
    customErrorCode?: SecurityInternalErrorCodes | SecurityAppServerErrorCodes,
    customErrorDesc?: string
  ) {
    let customError;
    let customApiError;
    // if (!has(error, 'errors') || isEmpty(error.errors)) return;
    if (error instanceof Error) {
      // define undefined errors
      customErrorCode = !isUndefined(customErrorCode)
        ? customErrorCode
        : SecurityInternalErrorCodes.INIT_APP_ERROR;
      customErrorDesc = !isUndefined(customErrorDesc)
        ? customErrorDesc
        : Localizer.getFormatted(
            CUSTOM_SECURITY_APP_ERRORS.INITIALIZATION_ERROR
          );

      customError = new SecurityError(customErrorCode, customErrorDesc);
      customApiError = new SecurityAppError(true, [customError]);
    } else {
      // already custom made from custom SecurityAppErrors constructed in try block
      customApiError = error;
    }

    customApiError.errors.forEach((securityAppError) => {
      const { errorCode, errorDesc } = securityAppError;
      Dispatcher.dispatch({
        type: SecurityActionTypes.SetSecurityError,
        value: {
          errorCode,
          errorDesc,
        },
      });
    });

    Dispatcher.dispatch({
      type: SecurityActionTypes.SetShowSecurityOverlay,
      value: true,
    });
    return;
  }

  private clearPingSecurityAppInterval: any;
  public async pingSecurityAppInterval(isSecurityAppOn) {
    if (!isSecurityAppOn) {
      return false;
    }
    return await new Promise((resolve) => {
      this.clearPingSecurityAppInterval = setInterval(
        () => resolve(this.pingSecurityApp()),
        RUNNING_APP_PING_INTERVAL
      );
    });
  }

  async pingSecurityApp() {
    let newSecurityError;
    let newSecurityAppError;

    try {
      const pingSecurityAppResp = await fetch(`${SECURITY_APP_BASE_URL}/ping`);

      if (!pingSecurityAppResp.ok) {
        const errorJson = await pingSecurityAppResp.json();

        newSecurityAppError = new SecurityAppError(
          errorJson.isError,
          errorJson.errors
        );
        throw newSecurityAppError;
      }

      const pingSecurityAppJson = await pingSecurityAppResp.json();

      // If Security App server returns isError
      if (pingSecurityAppJson.isError) {
        newSecurityError = new SecurityError(
          SecurityInternalErrorCodes.INIT_APP_ERROR,
          'There was an error running the Presentation Viewer'
        );
        newSecurityAppError = new SecurityAppError(true, [newSecurityError]);
        throw newSecurityAppError;
      }

      // Handle Security App Violations, throw shield
      if (pingSecurityAppJson.isViolation) {
        this.getSecurityViolations();
      }

      // Recover within 10 attempts, hide shield by removing errors
      if (RUNNING_APP_PING_RETRIES < MAX_APP_PING_RETRIES) {
        Dispatcher.dispatch({
          type: SecurityActionTypes.RemoveSecurityError,
          value: SecurityInternalErrorCodes.PING_ERROR,
        });

        Dispatcher.dispatch({
          type: SecurityActionTypes.SetIsSecurityAppLoading,
          value: false,
        });
      }

      // Reset pingIntervalRetry on successful recovery
      RUNNING_APP_PING_RETRIES = MAX_APP_PING_RETRIES;

      return pingSecurityAppJson;
    } catch (error) {
      RUNNING_APP_PING_RETRIES--;

      // Show loader overlay when re-pinging
      if (RUNNING_APP_PING_RETRIES <= MAX_APP_PING_RETRIES) {
        // set loading, show overlay with loader
        Dispatcher.dispatch({
          type: SecurityActionTypes.SetIsSecurityAppLoading,
          value: true,
        });
      }

      if (RUNNING_APP_PING_RETRIES === 0) {
        // Dispatch errors, pass in custom or default errors
        this.dispatchSetErrors(
          error,
          SecurityInternalErrorCodes.PING_ERROR,
          Localizer.getFormatted(
            CUSTOM_SECURITY_APP_ERRORS.PING_ERROR_LOST_CONNECTION
          )
        );

        Dispatcher.dispatch({
          type: SecurityActionTypes.SetIsSecurityAppLoading,
          value: false,
        });
        // ** Stop interval ping call, show errors
        clearInterval(this.clearPingSecurityAppInterval);
      }

      return false;
    }
  }

  /**
   * Method calls internal NoteAffect web-sever endpoint for redirect of app resource
   * Works similar to Broadcaster app launch functionality
   * @param seriesId
   */
  public launchSecurityApp(seriesId: number) {
    document.location.assign(`/api/security/${seriesId}/start`);
  }

  // Track last monitoring object sent
  private lastSecurityAppPostPayload: ISecurityAppPostPayload;
  public getLastSecurityAppPostPayload() {
    return this.lastSecurityAppPostPayload;
  }
  /**
   * Helper method for Presentation actions to prepare payload
   * to send up to Security App /setMonitoring endpoint on slide changes
   * and other security monitoring actions
   * for method postSecurityMonitoring
   * @param seriesId
   * @param lectureId
   * @param slideNumber
   */
  prepSecurityAppPayloadForPresentations(
    seriesId = null,
    lectureId = null,
    slideNumber = null,
    isLive = false
  ): ISecurityAppPostPayload {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const sessionId = svc.getStoreSessionId();
    const userId = svc.getUserInformation().get('id');

    const securityAppPostPayload = {
      isMonitoring: true,
      isLive,
      id: sessionId,
      context: {
        userId: userId,
        contextDet: {
          seriesId: seriesId,
          resourceType: ResourceTypes.Slide,
          item: {
            lectureId: lectureId,
            slide: !isNumber(slideNumber) ? 1 : slideNumber,
          },
        },
      },
    };

    this.lastSecurityAppPostPayload = securityAppPostPayload;

    return securityAppPostPayload;
  }

  /**
   * Set security monitoring payload for viewing PDFs
   * @param seriesId number
   * @param documentId number
   */
  prepSecurityAppPayloadForDocuments(
    seriesId: number,
    documentId: number,
    isMonitoring: boolean
  ) {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const sessionId = svc.getStoreSessionId();
    const userId = svc.getUserInformation().get('id');

    const securityAppPostPayload = {
      isMonitoring,
      isLive: false,
      id: sessionId,
      context: {
        userId: userId,
        contextDet: {
          seriesId: seriesId,
          resourceType: ResourceTypes.UserFile,
          item: {
            userFileId: documentId,
          },
        },
      },
    };

    this.lastSecurityAppPostPayload = securityAppPostPayload;

    return securityAppPostPayload;
  }

  /**
   * Method prepares expected object structure when setting isMonitoring to false
   * to stop violation detection when browser tab not in focus
   */
  prepSecurityAppDisableMonitoringPayload(): ISecurityAppPostPayload {
    const svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    const sessionId = svc.getStoreSessionId();
    const userId = svc.getUserInformation().get('id');

    return {
      isMonitoring: false,
      isLive: false,
      id: sessionId,
      context: {
        userId: userId,
        contextDet: {
          seriesId: null,
          resourceType: null,
          item: {
            lectureId: null,
            slide: null,
          },
        },
      },
    };
  }

  /**
   * Method communicates slide changes and other events to the Security App server
   * @param securityAppPostPayload
   */
  async postSecurityMonitoring(securityAppPostPayload) {
    try {
      const postMonitoringResp = await fetch(
        `${SECURITY_APP_BASE_URL}/setMonitoring`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify(securityAppPostPayload),
        }
      );

      if (!postMonitoringResp.ok) {
        throw new Error();
      }

      Dispatcher.dispatch({
        type: SecurityActionTypes.SetIsSecurityAppMonitoring,
        value: securityAppPostPayload.isMonitoring,
      });

      return postMonitoringResp;
    } catch (error) {
      console.error(error);

      Dispatcher.dispatch({
        type: SecurityActionTypes.SetIsSecurityAppMonitoring,
        value: false,
      });

      return false;
    }
  }

  /**
   * Method to turn security monitoring on and off for violation detection
   * @param toggleMonitoringOn
   */
  async toggleSecurityMonitoring({ isMonitoring, isLive }) {
    let payload = !isEmpty(this.lastSecurityAppPostPayload)
      ? { ...this.lastSecurityAppPostPayload }
      : { ...this.prepSecurityAppDisableMonitoringPayload() };
    payload.isMonitoring = isMonitoring;
    payload.isLive = isLive;

    if (!isEmpty(this.lastSecurityAppPostPayload)) {
      this.lastSecurityAppPostPayload = payload;
    }

    await this.postSecurityMonitoring(payload);
  }

  /**
   * Method does GET call to Security App endpoint /getCapturedData
   */
  async getSecurityViolations() {
    Dispatcher.dispatch({
      type: SecurityActionTypes.SetIsSecurityAppLoading,
      value: true,
    });
    Dispatcher.dispatch({
      type: SecurityActionTypes.SetShowSecurityOverlay,
      value: true,
    });

    try {
      const securityViolationsResp = await fetch(
        `${SECURITY_APP_BASE_URL}/getCapturedData`
      );

      const securityViolationsJson = await securityViolationsResp.json();
      const removeDupsSecurityViolations = uniqBy(
        securityViolationsJson.events,
        'eventType'
      );

      // Dispatch each violation
      removeDupsSecurityViolations.forEach((violation) => {
        Dispatcher.dispatch({
          type: SecurityActionTypes.SetSecurityViolation,
          value: violation,
        });
      });
    } catch (error) {
      Dispatcher.dispatch({
        type: SecurityActionTypes.SetSecurityError,
        value: {
          errorCode: SecurityInternalErrorCodes.SET_MONITORING_ERROR,
          errorDesc: Localizer.get(
            'Communication failed with the Presentation Viewer'
          ),
        },
      });
      console.error(error);
    } finally {
      Dispatcher.dispatch({
        type: SecurityActionTypes.SetIsSecurityAppLoading,
        value: false,
      });
    }
  }

  /**
   * Method calls /shutdownApp to stop local app from running
   */
  async shutdownSecurityApp() {
    Dispatcher.dispatch({
      type: SecurityActionTypes.SetIsSecurityAppLoading,
      value: true,
    });

    try {
      const shutdownSecurityAppResp = await fetch(
        `${SECURITY_APP_BASE_URL}/shutdownApp`,
        {
          method: 'POST',
        }
      );

      if (!shutdownSecurityAppResp.ok) {
        throw new Error(shutdownSecurityAppResp.statusText);
      }

      const shutdownSecurityAppJson = await shutdownSecurityAppResp.json();
      if (!shutdownSecurityAppJson) {
        throw new Error('Presentation Viewer returned false for shutdown');
      }
    } catch (error) {
      console.error(error);

      Dispatcher.dispatch({
        type: SecurityActionTypes.SetSecurityError,
        value: {
          errorCode: SecurityInternalErrorCodes.SHUTDOWN_APP_ERROR,
          errorDesc: Localizer.get('Presentation Viewer failed to shut down'),
        },
      });
    } finally {
      // ** Stop interval ping call
      clearInterval(this.clearPingSecurityAppInterval);

      Dispatcher.dispatch({
        type: SecurityActionTypes.ResetSecurityStore,
        value: true,
      });
    }
  }
}

const SecurityAppApiService = new SecurityApiServiceClass();
export default SecurityAppApiService;
