export default class EmailDomainUtil {
  static isValid(emailDomain): boolean {
    const regexDomainPattern = /^([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
    return regexDomainPattern.test(emailDomain);
  }

  static isForbiddenEmailDomain(emailDomain): boolean {
    const regexForbiddenDomainsPattern = /(noteaffect|gmail|yahoo|hotmail|outlook|comcast|aol|icloud|yandex|live|sina|qq)\./;
    return regexForbiddenDomainsPattern.test(emailDomain);
  }

  static isEmailStrings(emailDomains): boolean {
    const re = /^((([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))((\,|\;)\s)*)+$/m;
    return re.test(String(emailDomains).toLowerCase());
  }
}
