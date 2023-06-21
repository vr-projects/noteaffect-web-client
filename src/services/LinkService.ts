import isUndefined from 'lodash/isUndefined';

export const getSignUpUrl = (returnRoute = '', useWindowQuery = false) => {
  return `${
    window.location.origin
  }/Account/Register?returnurl=%2Fapp/${returnRoute}${
    useWindowQuery ? encodeURIComponent(window.location.search) : ''
  }`;
};

export const getLogInUrl = (returnRoute = '', useWindowQuery = false) => {
  // http://localhost:5000/Account/Login?ReturnUrl=%2Fapp
  return `${
    window.location.origin
  }/Account/Login?returnurl=%2Fapp/${returnRoute}${
    useWindowQuery ? encodeURIComponent(window.location.search) : ''
  }`;
};

/**
 * Method reroutes to http://localhost:5000/Account/DistroLogin?code=0a571fd6ead044c7a6cc6270456d362d&email=ccurtis%2Bdistrolist0%40unicon.net
 * @param email -- needs to be encoded
 * @param code
 */
export const getDistroLogInUrl = (email = undefined, code = undefined) => {
  if (isUndefined(email) || isUndefined(code)) {
    return `${window.location.origin}/Account/DistroLogin${window.location.search}`;
  }

  const encodedEmail = encodeURIComponent(email);
  return `${window.location.origin}/Account/DistroLogin?code=${code}&email=${encodedEmail}`;
};

/**
 * Method reroutes to http://localhost:5000/Account/DistroInvitation?code=0a571fd6ead044c7a6cc6270456d362d&email=ccurtis%2Bdistrolist0%40unicon.net
 * @param email -- needs to be encoded
 * @param code
 */
export const getDistroSignUpUrl = (email = undefined, code = undefined) => {
  if (isUndefined(email) || isUndefined(code)) {
    return `${window.location.origin}/Account/DistroInvitation${window.location.search}`;
  }

  const encodedEmail = encodeURIComponent(email);
  return `${window.location.origin}/Account/DistroInvitation?code=${code}&email=${encodedEmail}`;
};

export const getDownloadBundleRoute = () => {
  return process.env.BUNDLE_DOWNLOAD_ROUTE;
};

export const getDownloadPresentationViewerRoute = () => {
  return process.env.SECURITY_APP_DOWNLOAD_ROUTE;
};
