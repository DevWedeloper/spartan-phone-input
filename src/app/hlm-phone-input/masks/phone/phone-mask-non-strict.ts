import type { MaskitoOptions } from '@maskito/core';
import { MASKITO_DEFAULT_OPTIONS } from '@maskito/core';
import type { CountryCode, MetadataJson } from 'libphonenumber-js/core';
import { AsYouType } from 'libphonenumber-js/core';

import {
  phoneLengthPostprocessorGenerator,
  validatePhonePreprocessorGenerator,
} from './processors';
import { generatePhoneMask, getPhoneTemplate, selectTemplate } from './utils';

export function maskitoPhoneNonStrictOptionsGenerator({
  defaultIsoCode,
  metadata,
  separator = '-',
  countryCode,
}: {
  defaultIsoCode?: CountryCode;
  metadata: MetadataJson;
  separator?: string;
  countryCode?: CountryCode;
}): Required {
  const formatter = new AsYouType(defaultIsoCode, metadata);
  let currentTemplate = '';
  let currentPhoneLength = 0;

  return {
    ...MASKITO_DEFAULT_OPTIONS,
    mask: ({ value }) => {
      if (value.startsWith('+')) {
        return /^([+0-9][0-9]*)$/;
      }

      const newTemplate = getPhoneTemplate(
        formatter,
        value,
        separator,
        countryCode,
      );
      const newPhoneLength = value.replaceAll(/\D/g, '').length;

      currentTemplate = selectTemplate({
        currentTemplate,
        newTemplate,
        currentPhoneLength,
        newPhoneLength,
      });
      currentPhoneLength = newPhoneLength;

      return currentTemplate.length === 1
        ? [/\d/]
        : generatePhoneMask({ value, template: currentTemplate });
    },
    preprocessors: [
      validatePhonePreprocessorGenerator({
        countryIsoCode: defaultIsoCode,
        metadata,
        countryCode,
      }),
    ],
    postprocessors: [phoneLengthPostprocessorGenerator(metadata, countryCode)],
  };
}
