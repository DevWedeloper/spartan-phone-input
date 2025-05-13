import type { MaskitoPostprocessor } from '@maskito/core';
import type { CountryCode, MetadataJson } from 'libphonenumber-js/core';

import { cutPhoneByValidLength } from '../utils';

const MIN_LENGTH = 3;
export function phoneLengthPostprocessorGenerator(
  metadata: MetadataJson,
  countryCode?: CountryCode,
): MaskitoPostprocessor {
  return ({ value, selection }) => ({
    value:
      value.length > MIN_LENGTH
        ? cutPhoneByValidLength({ phone: value, metadata, countryCode })
        : value,
    selection,
  });
}
