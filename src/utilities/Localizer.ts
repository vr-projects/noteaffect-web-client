import { runtime } from 'react-strontium';
import { defineMessages } from 'react-intl';
import VersionService from '../version/versionService';
import { ALL_VERSION_KEYS } from '../version/versionConstants';

// const svc = runtime.services.get('versionService') as VersionService;
/**
 * This class is not instantiated, and directly calls the public static getFormatted method
 */
export default class Localizer {
  /**
   * Method calls wrapper around int.formatMessage to get access to versioned text in corpLanguage.ts or edLanguage.ts
   * Wrapper implementation of format.js
   * @param id ALL_VERSION_KEYS ensure id passed in is in enums
   * @param defaultMessage string
   */

  public static getFormatted(
    id: ALL_VERSION_KEYS,
    defaultMessage?: string
  ): string {
    const definedMessage = defineMessages({
      [id]: {
        id,
        defaultMessage: defaultMessage ? defaultMessage : 'default message',
      },
    });
    const svc = runtime.services.get('versionService') as VersionService;
    return svc.intlFormatter(definedMessage[id]);
  }

  public static get(str: string) {
    return str;
  }
}
