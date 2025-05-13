import { getCountryCallingCode } from 'libphonenumber-js';
import type { AsYouType, CountryCode } from 'libphonenumber-js/core';

export function getPhoneTemplate(
  formatter: AsYouType,
  value: string,
  separator: string,
  countryCode?: CountryCode,
): string {
  const callingCode = (() => {
    if (!countryCode) {
      console.warn('countryCode is undefined, using default "+"');
      return '+';
    }
    return `+${getCountryCallingCode(countryCode)}`;
  })();

  formatter.input(callingCode + value.replaceAll(/[^\d+]/g, ''));

  const initialTemplate = formatter.getTemplate();
  const split = initialTemplate.split(' ').slice(1);
  const template =
    split.length > 1
      ? `${split.slice(0, 1).join(' ')} ${split.slice(1).join(separator)}`
      : split.join('');

  formatter.reset();

  return template.trim();
}
