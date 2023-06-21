enum SecurityActionTypes {
  SetShowSecurityOverlay = 'SecurityApp.SetShowSecurityOverlay',
  SetIsSecurityCheckDone = 'SecurityApp.SetIsSecurityCheckDone',
  SetIsSecurityMode = 'SecurityApp.SetIsSecurityMode',
  SetIsSecurityAppOn = 'SecurityApp.SetIsSecurityAppOn',
  SetIsSecurityAppLoading = 'SecurityApp.SetIsSecurityAppLoading',
  SetSecurityError = 'SecurityApp.SetSecurityError',
  RemoveSecurityError = 'SecurityApp.RemoveSecurityError',
  RemoveAllSecurityErrors = 'SecurityApp.RemoveAllSecurityErrors',
  SetSecurityViolation = 'SecurityApp.SetSecurityViolation',
  RemoveSecurityViolation = 'SecurityApp.RemoveSecurityViolation',
  RemoveAllSecurityViolations = 'SecurityApp.RemoveAllSecurityViolations',
  SetSessionId = 'SecurityApp.SetSessionId',
  ResetSecurityStore = 'SecurityApp.ResetSecurityStore',
  SetIsSecurityAppMonitoring = 'SecurityApp.SetIsSecurityAppMonitoring',
}

export default SecurityActionTypes;
