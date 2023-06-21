/**
 * * This class service defines the Intl context of the browser language
 * * and is a wrapper implementation of format.js.
 * * The correct version Ed or Corp is read from the backend
 * * Version strings are formatted programmatically with Localizer.js
 * * The intlFormatter getReturns format.js formatMessage API for the Localizer to use for string versioning
 */
import { IAppService } from 'react-strontium';
import { createIntlCache, createIntl, IntlCache, IntlShape } from 'react-intl';
import merge from 'lodash/merge';

import SharedLanguage from './sharedLanguage';
import CorpLanguage from './corpLanguage';
import EdLanguage from './edLanguage';

const isCorpVersion = window.appEnvironment.client.lexicon === 'corp';

interface IMsgObject {
  id: string;
  defaultMessage?: string;
}

class VersionService implements IAppService {
  initialize() {}
  handles(): string[] {
    return [];
  }
  receiveMessage() {}

  // // Uncomment below for multilingual suppoprt
  // private localeLang: string = window.navigator.language.slice(0, 2) || 'en';
  private localeLang: string = 'en';
  private versionLang: any = isCorpVersion
    ? merge(SharedLanguage, CorpLanguage)
    : merge(SharedLanguage, EdLanguage);
  private cache: IntlCache = createIntlCache();
  private intl: IntlShape = createIntl(
    {
      locale: this.localeLang,
      messages: { ...this.versionLang[this.localeLang] },
    },
    this.cache
  );

  public intlFormatter(msgObj: IMsgObject): string {
    return this.intl.formatMessage(msgObj);
  }
}

export default VersionService;
