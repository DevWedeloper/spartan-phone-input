import {
  ChangeDetectionStrategy,
  Component,
  effect,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronsUpDown } from '@ng-icons/lucide';
import {
  BrnPopoverComponent,
  BrnPopoverContentDirective,
  BrnPopoverTriggerDirective,
} from '@spartan-ng/brain/popover';
import { HlmButtonDirective } from '@spartan-ng/ui-button-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmPopoverContentDirective } from '@spartan-ng/ui-popover-helm';
import { CountryCode } from 'libphonenumber-js';
import { HlmCountryListComponent } from './hlm-country-list.component';
import { HlmFlagComponent } from './hlm-flag.component';
import { HlmPhoneNumberComponent } from './hlm-phone-number.component';

@Component({
  selector: 'hlm-phone-input',
  imports: [
    BrnPopoverComponent,
    BrnPopoverTriggerDirective,
    BrnPopoverContentDirective,
    HlmPopoverContentDirective,
    HlmButtonDirective,
    NgIcon,
    HlmIconDirective,
    HlmFlagComponent,
    HlmCountryListComponent,
    HlmPhoneNumberComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: HlmPhoneInputComponent,
      multi: true,
    },
    provideIcons({ lucideChevronsUpDown }),
  ],
  host: {
    class: 'flex',
  },
  template: `
    <brn-popover sideOffset="5">
      <button
        variant="outline"
        brnPopoverTrigger
        hlmBtn
        class="flex gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10"
        [disabled]="disabled()"
      >
        <hlm-flag [countryCode]="selectedCountry()" />
        <ng-icon
          hlm
          size="sm"
          class="-mr-2 opacity-50"
          name="lucideChevronsUpDown"
        />
        <span class="sr-only">Select country calling code</span>
      </button>
      <div hlmPopoverContent class="w-[300px] p-0" *brnPopoverContent="let ctx">
        <hlm-country-list [(selectedCountryCode)]="selectedCountry" />
      </div>
    </brn-popover>
    <hlm-phone-number
      [(phoneNumber)]="phoneNumber"
      [disabled]="disabled()"
      (selectedCountryChange)="selectedCountry.set($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneInputComponent implements ControlValueAccessor {
  protected selectedCountry = model<CountryCode | undefined>(undefined);

  protected phoneNumber = linkedSignal<
    CountryCode | undefined,
    string | undefined
  >({
    source: this.selectedCountry,
    // If we already had a phone value and its country changed, reset.
    computation: (current, previous) =>
      previous && previous.source && previous.source !== current
        ? undefined
        : previous?.value,
  });

  protected disabled = signal(false);

  constructor() {
    effect(() => {
      const raw = this.phoneNumber();
      // Remove all spaces (\s) and dashes (-)
      const cleaned = raw ? raw.replace(/[\s-]/g, '') : undefined;
      this.onChange(cleaned);
    });
  }

  private onChange: (phoneNumber: string | undefined) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | undefined): void {
    this.phoneNumber.set(value);
  }

  registerOnChange(fn: (phoneNumber: string | undefined) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}
