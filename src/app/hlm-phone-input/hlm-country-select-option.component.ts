import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck } from '@ng-icons/lucide';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { CountryCode } from 'libphonenumber-js';
import { HlmFlagComponent } from './hlm-flag.component';

@Component({
  selector: 'hlm-country-select-option',
  imports: [NgClass, NgIcon, HlmIconDirective, HlmFlagComponent],
  providers: [provideIcons({ lucideCheck })],
  host: {
    class: 'flex w-full items-center gap-2',
  },
  template: `
    <hlm-flag [countryCode]="countryCode()" />
    <span class="flex-1 text-sm">{{ countryName() }}</span>
    <span class="text-foreground/50 text-sm">
      {{ countryCallingCode() }}
    </span>
    <ng-icon
      hlm
      size="sm"
      class="ml-auto"
      [ngClass]="
        countryCode() === selectedCountryCode() ? 'opacity-100' : 'opacity-0'
      "
      name="lucideCheck"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmCountrySelectOptionComponent {
  countryCode = input.required<CountryCode>();
  countryName = input.required<string | undefined>();
  countryCallingCode = input.required<string>();
  selectedCountryCode = input.required<CountryCode | undefined>();

  countryCodeChange = output<CountryCode>();
}
