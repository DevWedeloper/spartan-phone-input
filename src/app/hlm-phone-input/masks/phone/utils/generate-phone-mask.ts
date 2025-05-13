import type { MaskitoMaskExpression } from '@maskito/core';

import { TEMPLATE_FILLER } from '../constants';

export function generatePhoneMask({
  value,
  template,
}: {
  value: string;
  template: string;
}): MaskitoMaskExpression {
  return [
    ...(template
      ? template
          .split('')
          .map((сhar) =>
            сhar === TEMPLATE_FILLER || /\d/.test(сhar) ? /\d/ : сhar,
          )
      : new Array(value.length).fill(/\d/)),
  ];
}
