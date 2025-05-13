import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as flags from 'country-flag-icons/string/3x2';
import { CountryCode } from 'libphonenumber-js';

@Component({
  selector: 'hlm-flag',
  template: `
    <span
      data-testid="country-code-trigger-flag"
      class="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg]:size-full"
      [innerHTML]="flag()"
    ></span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmFlagComponent {
  private sanitizer = inject(DomSanitizer);

  countryCode = input.required<CountryCode | undefined>();

  protected flag = computed(() => {
    const code = this.countryCode();
    if (!code) {
      return null;
    }

    const titleTag = `<title>${code}</title>`;

    const svg = flags[code].replace(/<svg([^>]*)>/, `<svg$1>${titleTag}`);

    return this.sanitizer.bypassSecurityTrustHtml(svg);
  });
}
