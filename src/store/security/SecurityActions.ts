import isEmpty from 'lodash/isEmpty';
import SecurityActionTypes from './SecurityActionTypes';
import SecurityAppApiService from '../../api/SecurityAppApiService';

//** Security App Actions */
export function setSessionId(sessionId: string) {
  return (dispatch, state) => {
    dispatch({ type: SecurityActionTypes.SetSessionId, value: sessionId });
  };
}

export function resetSecurityStore() {
  return async (dispatch, state) => {
    dispatch({
      type: SecurityActionTypes.ResetSecurityStore,
    });
  };
}

export function setIsSecurityMode(isSecurityMode: boolean) {
  return async (dispatch, state) => {
    dispatch({
      type: SecurityActionTypes.SetIsSecurityMode,
      value: isSecurityMode,
    });
  };
}

export function initSecurityApp(isSecuredSeries, seriesId) {
  return async (dispatch, state) => {
    dispatch({
      type: SecurityActionTypes.SetIsSecurityAppLoading,
      value: true,
    });

    if (!isSecuredSeries) {
      dispatch({
        type: SecurityActionTypes.SetIsSecurityCheckDone,
        value: true,
      });
      dispatch({
        type: SecurityActionTypes.SetIsSecurityAppLoading,
        value: false,
      });
      dispatch({
        type: SecurityActionTypes.SetShowSecurityOverlay,
        value: false,
      });

      return false;
    }

    dispatch({
      type: SecurityActionTypes.SetShowSecurityOverlay,
      value: true,
    });

    dispatch({
      type: SecurityActionTypes.SetIsSecurityAppLoading,
      value: true,
    });

    // Internal service sets errors and app fail
    const isSecurityAppOn = await SecurityAppApiService.getIsSecurityAppOn(
      seriesId
    );

    await SecurityAppApiService.pingSecurityAppInterval(isSecurityAppOn);

    dispatch({
      type: SecurityActionTypes.SetIsSecurityCheckDone,
      value: true,
    });

    dispatch({
      type: SecurityActionTypes.SetIsSecurityAppLoading,
      value: false,
    });

    await dispatch(checkCanHideSecurityOverlay());
  };
}

export function setShowSecurityOverlay(show) {
  return async (dispatch, state) => {
    dispatch({
      type: SecurityActionTypes.SetShowSecurityOverlay,
      value: show,
    });
  };
}

export function checkCanHideSecurityOverlay() {
  return async (dispatch, state) => {
    const {
      isSecurityAppLoading,
      isSecurityAppOn,
      isSecurityCheckDone,
      securityErrors,
      securityViolations,
    } = state().security.toJS();

    switch (true) {
      case isSecurityAppLoading:
        dispatch({
          type: SecurityActionTypes.SetShowSecurityOverlay,
          value: true,
        });
        return;
      case isSecurityAppOn &&
        isSecurityCheckDone &&
        isEmpty(securityErrors) &&
        isEmpty(securityViolations):
        dispatch({
          type: SecurityActionTypes.SetShowSecurityOverlay,
          value: false,
        });
        return;
      case !isEmpty(securityErrors):
      case !isEmpty(securityViolations):
        dispatch({
          type: SecurityActionTypes.SetShowSecurityOverlay,
          value: true,
        });
        return;
      default:
        return;
    }
  };
}

export function notifySecurityAppSlideChanged(payload) {
  return async (dispatch, state) => {
    const {
      isSecurityMode,
      isSecurityAppOn,
      securityErrors,
    } = state().security.toJS();

    if (!isSecurityMode || !isSecurityAppOn || !isEmpty(securityErrors)) {
      return;
    }
    await SecurityAppApiService.postSecurityMonitoring(payload);
  };
}

export function acknowledgeSecurityViolation(violation) {
  return async (dispatch, state) => {
    dispatch({
      type: SecurityActionTypes.RemoveSecurityViolation,
      value: violation.eventType,
    });

    // Check if can hide overlay
    dispatch(checkCanHideSecurityOverlay());
  };
}

export function setSecurityAppMonitoring({ isMonitoring, isLive }) {
  return async (dispatch, state) => {
    await SecurityAppApiService.toggleSecurityMonitoring({
      isMonitoring,
      isLive,
    });

    dispatch({
      type: SecurityActionTypes.SetIsSecurityAppMonitoring,
      value: isMonitoring,
    });
  };
}

export function shutDownSecurityApp(isSecuredSeries) {
  return async (dispatch, state) => {
    if (!isSecuredSeries) {
      dispatch({
        type: SecurityActionTypes.ResetSecurityStore,
        value: true,
      });
      return;
    }

    await SecurityAppApiService.shutdownSecurityApp();
  };
}

export function startDocumentMonitoring(seriesId: number, documentId: number) {
  return async (dispatch, state) => {
    const {
      isSecurityMode,
      isSecurityAppOn,
      securityErrors,
    } = state().security.toJS();

    if (!isSecurityMode || !isSecurityAppOn || !isEmpty(securityErrors)) {
      return;
    }
    const payload = SecurityAppApiService.prepSecurityAppPayloadForDocuments(
      seriesId,
      documentId,
      true
    );
    await SecurityAppApiService.postSecurityMonitoring(payload);
  };
}

export function stopDocumentMonitoring(seriesId: number, documentId: number) {
  return async (dispatch, state) => {
    const {
      isSecurityMode,
      isSecurityAppOn,
      securityErrors,
    } = state().security.toJS();

    if (!isSecurityMode || !isSecurityAppOn || !isEmpty(securityErrors)) {
      return;
    }

    const payload = SecurityAppApiService.prepSecurityAppPayloadForDocuments(
      seriesId,
      documentId,
      false
    );
    await SecurityAppApiService.postSecurityMonitoring(payload);
  };
}

export function changedCourseTabsStopMonitoring(seriesId: number) {
  return async (dispatch, state) => {
    const {
      isSecurityMode,
      isSecurityAppOn,
      securityErrors,
      isSecurityAppMonitoring,
    } = state().security.toJS();

    if (
      !isSecurityMode ||
      !isSecurityAppOn ||
      !isEmpty(securityErrors) ||
      !isSecurityAppMonitoring
    ) {
      return;
    }

    const lastPayload = SecurityAppApiService.getLastSecurityAppPostPayload();
    lastPayload.isMonitoring = false;
    lastPayload.isLive = false;
    await SecurityAppApiService.postSecurityMonitoring(lastPayload);

    dispatch({
      type: SecurityActionTypes.SetIsSecurityAppMonitoring,
      value: false,
    });
  };
}
