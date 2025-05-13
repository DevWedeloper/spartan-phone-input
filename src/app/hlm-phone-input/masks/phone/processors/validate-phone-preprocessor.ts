import type { MaskitoPreprocessor } from '@maskito/core';
import { getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode, MetadataJson } from 'libphonenumber-js/core';
import {
  AsYouType,
  parsePhoneNumber,
  validatePhoneNumberLength,
} from 'libphonenumber-js/core';

export function validatePhonePreprocessorGenerator({
  countryIsoCode,
  metadata,
  countryCode,
}: {
  countryIsoCode?: CountryCode;
  metadata: MetadataJson;
  countryCode?: CountryCode;
}): MaskitoPreprocessor {
  return ({ elementState, data }) => {
    const { selection, value } = elementState;

    // handling autocomplete
    if (value && !value.startsWith('+') && !data) {
      const formatter = new AsYouType(
        { defaultCountry: countryIsoCode },
        metadata,
      );

      const callingCode = (() => {
        if (!countryCode) {
          console.warn('countryCode is undefined, using default "+"');
          return '+';
        }
        return `+${getCountryCallingCode(countryCode)}`;
      })();

      // ^0+      → match one or more zeros at the start
      // (?=\d)   → but only if they're followed by at least one digit
      // replace with "" (i.e., remove them)
      const stripped = value.replace(/^0+(?=\d)/, '');

      const phone = callingCode + stripped;

      formatter.input(phone);
      const numberValue = formatter.getNumberValue() ?? '';

      formatter.reset();

      return {
        elementState: {
          value:
            formatter.input(numberValue).split(' ').slice(1).join(' ') || value,
          selection,
        },
      };
    }

    try {
      const validationError = validatePhoneNumberLength(
        data,
        { defaultCountry: countryIsoCode },
        metadata,
      );

      if (!validationError || validationError === 'TOO_SHORT') {
        // handle paste-event with different code, for example for 8 / +7
        const phone = countryIsoCode
          ? parsePhoneNumber(data, countryIsoCode, metadata)
          : parsePhoneNumber(data, metadata);

        const { nationalNumber, countryCallingCode } = phone;

        return {
          elementState: {
            selection,
            value: '',
          },
          data: `+${countryCallingCode} ${nationalNumber}`,
        };
      }
    } catch {
      return { elementState };
    }

    return { elementState };
  };
}
