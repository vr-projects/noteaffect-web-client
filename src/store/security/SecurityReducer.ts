import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import SecurityActionTypes from './SecurityActionTypes';
import SecurityRecord, { initialStore } from './SecurityRecord';
import ISecurityError from '../../models/ISecurityError';
import ISecurityViolation from '../../models/ISecurityViolation';

const initialState = new SecurityRecord();

export default function securityReducer(
  state: SecurityRecord = initialState,
  action: any = {}
) {
  switch (action.type as SecurityActionTypes) {
    case SecurityActionTypes.SetShowSecurityOverlay:
      return state.with({ showSecurityOverlay: action.value });
    case SecurityActionTypes.SetIsSecurityCheckDone:
      return state.with({ isSecurityCheckDone: action.value });
    case SecurityActionTypes.SetIsSecurityMode:
      return state.with({ isSecurityMode: action.value });
    case SecurityActionTypes.SetIsSecurityAppOn:
      return state.with({ isSecurityAppOn: action.value });
    case SecurityActionTypes.SetIsSecurityAppLoading:
      return state.with({ isSecurityAppLoading: action.value });
    case SecurityActionTypes.SetSecurityError:
      const prevSecurityErrors = state.get('securityErrors');
      const convertedSecurityErrors: ISecurityError[] = prevSecurityErrors.toJS();
      // if already has error code, then return original array
      if (
        convertedSecurityErrors.some(
          (error) => error.errorCode === action.value.errorCode
        )
      ) {
        return state;
      }
      // Convert back to Immutable for SecurityRecord store
      const updatedSecurityErrors = Immutable.List([
        ...convertedSecurityErrors,
        action.value,
      ]);
      return state.with({ securityErrors: updatedSecurityErrors });
    case SecurityActionTypes.RemoveSecurityError:
      const existingSecurityErrors = state.get('securityErrors');
      const convertedRemovableSecurityErrors: ISecurityError[] = existingSecurityErrors.toJS();
      const newSecurityErrors = [...convertedRemovableSecurityErrors].filter(
        (securityError: ISecurityError) =>
          securityError.errorCode !== action.value
      );
      const immutableSecurityErrors = Immutable.List<
        IImmutableObject<ISecurityError>
      >(newSecurityErrors);
      return state.with({ securityErrors: immutableSecurityErrors });
    case SecurityActionTypes.RemoveAllSecurityErrors:
      return state.with({ securityErrors: initialStore.securityErrors });
    case SecurityActionTypes.SetSecurityViolation:
      const prevSecurityViolations = state.get('securityViolations');
      const convertedSecurityViolations: ISecurityViolation[] = prevSecurityViolations.toJS();
      if (
        convertedSecurityViolations.some(
          (error) => error.eventType === action.value.eventType
        )
      ) {
        return state;
      }
      // Convert back to Immutable for SecurityRecord store
      const updatedSecurityViolations = Immutable.List([
        ...convertedSecurityViolations,
        action.value,
      ]);
      return state.with({ securityViolations: updatedSecurityViolations });
    case SecurityActionTypes.RemoveSecurityViolation:
      const existingSecurityViolations = state.get('securityViolations');
      const convertedRemovableSecurityViolations: ISecurityViolation[] = existingSecurityViolations.toJS();
      const newSecurityViolations = [
        ...convertedRemovableSecurityViolations,
      ].filter(
        (securityViolation: ISecurityViolation) =>
          securityViolation.eventType !== action.value
      );
      const immutableSecurityViolations = Immutable.List<
        IImmutableObject<ISecurityViolation>
      >(newSecurityViolations);
      return state.with({ securityViolations: immutableSecurityViolations });
    case SecurityActionTypes.RemoveAllSecurityViolations:
      return state.with({
        securityViolations: initialStore.securityViolations,
      });
    case SecurityActionTypes.ResetSecurityStore:
      const sessionId = state.get('sessionId');
      // Note destructuring initialStore doesn't work setting store with state.with
      return state.with({
        isSecurityCheckDone: initialStore.isSecurityCheckDone,
        isSecurityMode: initialStore.isSecurityMode,
        isSecurityAppOn: initialStore.isSecurityAppOn,
        isSecurityAppLoading: initialStore.isSecurityAppLoading,
        isSecurityAppMonitoring: initialStore.isSecurityAppMonitoring,
        securityViolations: initialStore.securityViolations,
        securityErrors: initialStore.securityErrors,
        sessionId: sessionId,
      });
    case SecurityActionTypes.SetSessionId:
      return state.with({ sessionId: action.value });
    case SecurityActionTypes.SetIsSecurityAppMonitoring:
      return state.with({ isSecurityAppMonitoring: action.value });
    default:
      return state;
  }
}

export const getIsSecurityCheckDone = (state) => {
  return state.security.isSecurityCheckDone;
};

export const getIsSecurityMode = (state) => {
  return state.security.isSecurityMode;
};

export const getIsSecurityAppOn = (state) => {
  return state.security.isSecurityAppOn;
};

export const getIsSecurityAppLoading = (state) => {
  return state.security.isSecurityAppLoading;
};

export const getSecurityErrors = (state) => {
  return state.security.securityErrors.toJS();
};

export const getSecurityViolations = (state) => {
  return state.security.securityViolations.toJS();
};

export function getSessionId(state) {
  return state.security.sessionId;
}

export function getIsSecurityAppMonitoring(state) {
  return state.security.isSecurityAppMonitoring;
}

export function getShowSecurityOverlay(state) {
  return state.security.showSecurityOverlay;
}
