import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
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
import metadata from 'libphonenumber-js/min/metadata';
import { combineLatest, map, merge, scan, share, Subject, take } from 'rxjs';
import { HlmCountryListComponent } from './hlm-country-list.component';
import { HlmFlagComponent } from './hlm-flag.component';
import { HlmPhoneNumberComponent } from './hlm-phone-number.component';
import { maskitoGetCountryFromNumber } from './masks';

export type Status = 'implicit' | 'explicit';

export type State = {
  status: Status;
  countryCode?: CountryCode;
  phoneNumber?: string;
};

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
        <hlm-flag [countryCode]="countryCode()" />
        <ng-icon
          hlm
          size="sm"
          class="-mr-2 opacity-50"
          name="lucideChevronsUpDown"
        />
        <span class="sr-only">Select country calling code</span>
      </button>
      <div hlmPopoverContent class="w-[300px] p-0" *brnPopoverContent="let ctx">
        <hlm-country-list
          [countryCode]="countryCode()"
          (countryCodeChange)="setCountryCode($event)"
        />
      </div>
    </brn-popover>
    <hlm-phone-number
      [phoneNumber]="phoneNumber()"
      [status]="status()"
      [countryCode]="countryCode()"
      [disabled]="disabled()"
      (phoneNumberChange)="setPhoneNumber($event)"
      (focusChange)="onTouched()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneInputComponent implements ControlValueAccessor {
  initialCountryCode = input<CountryCode>();
  defaultCountryCode = input<CountryCode>();

  private initialCountryCode$ = toObservable(this.initialCountryCode).pipe(
    take(1),
  );

  private defaultCountryCode$ = toObservable(this.defaultCountryCode).pipe(
    take(1),
  );

  protected disabled = signal(false);

  private setCountryCode$ = new Subject<CountryCode | undefined>();
  private setPhoneNumber$ = new Subject<string | undefined>();

  private initialCountryCodeInputs$ = combineLatest([
    this.initialCountryCode$,
    this.defaultCountryCode$,
  ]).pipe(
    map(([initialCountryCode, defaultCountryCode]) => {
      if (defaultCountryCode) {
        return { countryCode: defaultCountryCode, mode: 'default' };
      } else if (initialCountryCode) {
        return { countryCode: initialCountryCode, mode: 'initial' };
      } else {
        return { countryCode: undefined, mode: undefined };
      }
    }),
  );

  private countryCode$ = this.setCountryCode$.pipe(
    map((countryCode) => ({
      status: 'implicit' as const,
      countryCode,
    })),
  );

  private phoneNumber$ = this.setPhoneNumber$.pipe(
    map((phoneNumber) => {
      const countryCode = maskitoGetCountryFromNumber(
        phoneNumber || '',
        metadata,
      );

      if (phoneNumber?.startsWith('+') || phoneNumber === '') {
        return {
          status: 'explicit' as const,
          countryCode,
          phoneNumber: phoneNumber,
        };
      }

      return { phoneNumber };
    }),
  );

  private state$ = combineLatest([
    this.initialCountryCodeInputs$,
    merge(this.countryCode$, this.phoneNumber$),
  ]).pipe(
    scan(
      (state, [initialInputs, partial]) => {
        const updated = {
          ...state,
          ...partial,
          index: state.index + 1,
        };

        // Prioritize country code of the initial form value over the initial country code input
        if (
          updated.index === 1 &&
          !updated.countryCode &&
          !updated.phoneNumber &&
          initialInputs.countryCode
        ) {
          updated.countryCode = initialInputs.countryCode;
          updated.status = 'implicit';
        }

        // Reset the phone number when a country code is selected
        if (state.status === 'explicit' && partial.status === 'implicit') {
          updated.phoneNumber = undefined;
        }

        return updated;
      },
      {
        status: 'explicit',
        countryCode: undefined,
        phoneNumber: undefined,
        index: 0,
      } as State & { index: number },
    ),
    map(({ index, ...rest }) => rest),
    share(),
  );

  private parsedPhoneNumber$ = this.state$.pipe(
    map(({ status, countryCode, phoneNumber }) => {
      const raw = phoneNumber || '';

      // Remove all spaces (\s) and dashes (-)
      const cleaned = raw.replace(/[\s-]/g, '');

      if (status === 'implicit') {
        const countryCallingCode = countryCode
          ? getCountryCallingCode(countryCode)
          : '';
        return `+${countryCallingCode}${cleaned}`;
      } else {
        return cleaned;
      }
    }),
  );

  private state = toSignal(this.state$, {
    initialValue: {
      status: 'explicit',
      countryCode: undefined,
      phoneNumber: undefined,
    },
  });

  protected status = computed(() => this.state().status);
  protected countryCode = computed(() => this.state().countryCode);
  protected phoneNumber = computed(() => this.state().phoneNumber);

  constructor() {
    this.parsedPhoneNumber$
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.onChange(value));
  }

  private onChange: (phoneNumber: string | undefined) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: unknown): void {
    const newValue = (() => {
      if (typeof value === 'string') {
        // Convert programmatically set empty string to undefined,
        // since empty strings are used to clear input and trigger 'explicit' mode
        return value === '' ? undefined : value;
      }
      return undefined;
    })();
    this.setPhoneNumber(newValue);
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

  protected setCountryCode(countryCode: CountryCode): void {
    // Only set the country code if it's different to avoid resetting the phone number
    if (this.countryCode() !== countryCode) {
      this.setCountryCode$.next(countryCode);
    }
  }

  protected setPhoneNumber(phoneNumber: string | undefined): void {
    this.setPhoneNumber$.next(phoneNumber);
  }
}
