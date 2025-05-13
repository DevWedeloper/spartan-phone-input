import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  linkedSignal,
  signal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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
import { CountryCode, getCountryCallingCode } from 'libphonenumber-js';
import { filter, take } from 'rxjs';
import { HlmCountryListComponent } from './hlm-country-list.component';
import { HlmFlagComponent } from './hlm-flag.component';
import { HlmPhoneNumberComponent } from './hlm-phone-number.component';

type ImplicitState = {
  status: 'implicit';
  countryCode: CountryCode;
};

type ExplicitState = {
  status: 'explicit';
  countryCode: CountryCode | undefined;
};

export type Status = State['status'];
export type State = ImplicitState | ExplicitState;

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
        data-testid="country-code-trigger"
        variant="outline"
        brnPopoverTrigger
        hlmBtn
        class="flex gap-1 rounded-s-lg rounded-e-none border-r-0 px-3 focus:z-10"
        [disabled]="disabled()"
        type="button"
        (click)="onTouched()"
      >
        <hlm-flag [countryCode]="state()?.countryCode" />
        <ng-icon
          hlm
          size="sm"
          class="-mr-2 opacity-50"
          name="lucideChevronsUpDown"
        />
        <span class="sr-only">Select country calling code</span>
      </button>
      <div hlmPopoverContent class="w-[300px] p-0" *brnPopoverContent="let ctx">
        <hlm-country-list [(state)]="state" />
      </div>
    </brn-popover>
    <hlm-phone-number
      [(phoneNumber)]="phoneNumber"
      [status]="state()?.status"
      [countryCode]="state()?.countryCode"
      [disabled]="disabled()"
      (derivedPhoneStateChange)="state.set($event)"
      (focusChange)="onTouched()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneInputComponent implements ControlValueAccessor {
  initialCountryCode = input<CountryCode>();

  initialCountryCode$ = toObservable(this.initialCountryCode).pipe(
    filter(Boolean),
    take(1),
  );

  private firstValidCountryCode = toSignal(this.initialCountryCode$);

  protected state = linkedSignal<CountryCode | undefined, State | undefined>({
    source: this.firstValidCountryCode,
    computation: (value) =>
      value ? { status: 'implicit', countryCode: value } : undefined,
  });

  protected phoneNumber = linkedSignal<State | undefined, string | undefined>({
    source: this.state,
    computation: (current, previous) =>
      previous?.source?.status === 'explicit' && current?.status === 'implicit'
        ? undefined
        : previous?.value,
  });

  protected disabled = signal(false);

  private parsedPhoneNumber = computed(() => {
    const state = this.state();
    const raw = this.phoneNumber() || '';

    // Remove all spaces (\s) and dashes (-)
    const cleaned = raw.replace(/[\s-]/g, '');

    if (state && state.status === 'implicit') {
      const countryCallingCode = getCountryCallingCode(state.countryCode);
      return `+${countryCallingCode}${cleaned}`;
    } else {
      return cleaned;
    }
  });

  constructor() {
    effect(() => this.onChange(this.parsedPhoneNumber()));
  }

  private onChange: (phoneNumber: string | undefined) => void = () => {};
  protected onTouched: () => void = () => {};

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
