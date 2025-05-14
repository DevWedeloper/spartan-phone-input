import type { MaskitoOptions } from '@maskito/core';
import type { CountryCode, MetadataJson } from 'libphonenumber-js/core';

import { maskitoPhoneNonStrictOptionsGenerator } from './phone-mask-non-strict';
import { maskitoPhoneStrictOptionsGenerator } from './phone-mask-strict';

export function maskitoPhoneOptionsGenerator({
  countryIsoCode,
  metadata,
  strict = true,
  separator = '-',
  countryCode,
}: {
  countryIsoCode?: CountryCode;
  metadata: MetadataJson;
  strict?: boolean;
  separator?: string;
  countryCode?: CountryCode;
}): Required {
  return strict && countryIsoCode
    ? maskitoPhoneStrictOptionsGenerator({
        countryIsoCode,
        metadata,
        separator,
        countryCode,
      })
    : maskitoPhoneNonStrictOptionsGenerator({
        defaultIsoCode: countryIsoCode,
        metadata,
        separator,
        countryCode,
      });
}
