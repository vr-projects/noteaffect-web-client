import UAParser from 'ua-parser-js';

export const getIsMacOs = () => {
  const detect = new UAParser();
  return detect.getOS().name.includes('Mac OS');
};

export const getIsWindowsOs = () => {
  const detect = new UAParser();
  return detect.getOS().name.includes('Windows');
};

export const getIsSafari = () => {
  const detect = new UAParser();
  return detect.getResult().browser.name.includes('Safari');
};

export const getIsChrome = () => {
  const detect = new UAParser();
  return detect.getResult().browser.name.includes('Chrome');
};
