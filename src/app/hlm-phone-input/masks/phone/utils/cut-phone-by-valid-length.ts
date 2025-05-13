import { getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode, MetadataJson } from 'libphonenumber-js/core';
import { validatePhoneNumberLength } from 'libphonenumber-js/core';

export function cutPhoneByValidLength({
  phone,
  metadata,
  countryCode,
}: {
  phone: string;
  metadata: MetadataJson;
  countryCode?: CountryCode;
}): string {
  const callingCode = (() => {
    if (!countryCode) {
      console.warn('countryCode is undefined, using default "+"');
      return '+';
    }
    return `+${getCountryCallingCode(countryCode)}`;
  })();

  const newPhone = callingCode + ' ' + phone;

  const validationResult = validatePhoneNumberLength(newPhone, metadata);

  if (validationResult === 'TOO_LONG') {
    return cutPhoneByValidLength({
      phone: phone.slice(0, phone.length - 1),
      metadata,
      countryCode,
    });
  }

  return phone;
}
