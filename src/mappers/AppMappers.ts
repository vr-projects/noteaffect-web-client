import * as AppReducer from '../store/app/AppReducer';
import * as SecurityReducer from '../store/security/SecurityReducer';
import * as PresentationReducer from '../store/presentation/PresentationReducer';

export default class AppMappers {
  public static AppMapper = (state) => {
    return {
      // security-app
      showSecurityOverlay: SecurityReducer.getShowSecurityOverlay(state),
      isSecurityCheckDone: SecurityReducer.getIsSecurityCheckDone(state),
      isSecurityMode: SecurityReducer.getIsSecurityMode(state),
      isSecurityAppOn: SecurityReducer.getIsSecurityAppOn(state),
      isSecurityAppLoading: SecurityReducer.getIsSecurityAppLoading(state),
      isSecurityAppMonitoring: SecurityReducer.getIsSecurityAppMonitoring(
        state
      ),
      securityErrors: SecurityReducer.getSecurityErrors(state),
      securityViolations: SecurityReducer.getSecurityViolations(state),
      sessionId: SecurityReducer.getSessionId(state),
      isOnLivePresentationView: PresentationReducer.getIsOnLivePresentationView(
        state
      ),
      // non-security-app
      menu: AppReducer.getMenu(state),
      userInformation: AppReducer.getUserInformation(state),
      userPermissions: AppReducer.getUserPermissions(state),
      appEnvironment: AppReducer.getAppEnvironment(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
      isEduVersion: AppReducer.getIsEduVersion(state),
      logoUrl: AppReducer.getAppLogoUrl(state),
      isPresentationFullscreen: AppReducer.getIsPresentationFullscreen(state),
      storeLoading: AppReducer.getIsStoreLoading(state),
    };
  };
  public static SecureMapper = (state) => {
    return {
      isSecurityMode: SecurityReducer.getIsSecurityMode(state),
      sessionId: SecurityReducer.getSessionId(state),
    };
  };
  public static VersionMapper = (state) => {
    return {
      lexicon: AppReducer.getAppEnvironmentLexicon(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
      isEduVersion: AppReducer.getIsEduVersion(state),
    };
  };
  public static ClientVersionMapper = (state) => {
    return {
      clientData: AppReducer.getClientData(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
      isEduVersion: AppReducer.getIsEduVersion(state),
    };
  };
  public static ClientUserVersionMapper = (state) => {
    return {
      clientData: AppReducer.getClientData(state),
      userInformation: AppReducer.getUserInformation(state),
      userPermissions: AppReducer.getUserPermissions(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
      isEduVersion: AppReducer.getIsEduVersion(state),
    };
  };
  public static UserVersionMapper = (state) => {
    return {
      userInformation: AppReducer.getUserInformation(state),
      userPermissions: AppReducer.getUserPermissionsJS(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
      isEduVersion: AppReducer.getIsEduVersion(state),
    };
  };
  public static UserMapper = (state) => {
    return {
      userInformation: AppReducer.getUserInformation(state),
      userPermissions: AppReducer.getUserPermissions(state),
    };
  };
  public static ClientDataMapper = (state) => {
    return {
      clientData: AppReducer.getClientData(state),
      isCorpVersion: AppReducer.getIsCorpVersion(state),
    };
  };
}
