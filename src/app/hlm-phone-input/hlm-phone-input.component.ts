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
import {
  distinctUntilChanged,
  filter,
  map,
  merge,
  scan,
  share,
  Subject,
  take,
} from 'rxjs';
import { HlmCountryListComponent } from './hlm-country-list.component';
import { HlmFlagComponent } from './hlm-flag.component';
import { HlmPhoneNumberComponent } from './hlm-phone-number.component';
import { maskitoGetCountryFromNumber } from './masks';

type Action = 'initial' | 'select' | 'type';

export type Status = 'implicit' | 'explicit';

export type State = {
  status: Status;
  countryCode?: CountryCode;
  phoneNumber?: string;
  action?: Action;
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

  private initialCountryCode$ = toObservable(this.initialCountryCode).pipe(
    filter(Boolean),
    take(1),
  );

  protected disabled = signal(false);

  private setCountryCode$ = new Subject<CountryCode | undefined>();
  private setPhoneNumber$ = new Subject<string | undefined>();

  private countryCode$ = merge(
    this.initialCountryCode$.pipe(
      map((countryCode) => ({ countryCode, action: 'initial' as const })),
    ),
    this.setCountryCode$.pipe(
      map((countryCode) => ({ countryCode, action: 'select' as const })),
    ),
  );

  private setCountryCodeStream$ = this.countryCode$.pipe(
    map(({ countryCode, action }) => ({
      status: 'implicit' as const,
      countryCode,
      action,
    })),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  private setPhoneNumberStream$ = this.setPhoneNumber$.pipe(
    map((phoneNumber) => {
      const countryCode = maskitoGetCountryFromNumber(
        phoneNumber || '',
        metadata,
      );

      if (phoneNumber?.startsWith('+') || phoneNumber === '') {
        return {
          status: 'explicit' as const,
          countryCode,
          phoneNumber: phoneNumber as string | undefined,
          action: 'type' as const,
        };
      }

      return { phoneNumber, action: 'type' as const };
    }),
    distinctUntilChanged(
      (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
    ),
  );

  private state$ = merge(
    this.setCountryCodeStream$,
    this.setPhoneNumberStream$,
  ).pipe(
    scan((state, partial) => ({ ...state, ...partial }), {
      status: 'explicit',
      countryCode: undefined,
      phoneNumber: undefined,
      action: 'initial',
    } as State),
    scan((previous, current) => {
      // Prioritize country code of the initial form value over the initial country code input
      if (current.action === 'initial' && previous.countryCode !== undefined) {
        return previous;
      }

      // Reset the phone number when a country code is selected
      if (previous.status === 'explicit' && current.status === 'implicit') {
        return {
          status: current.status,
          countryCode: current.countryCode,
          phoneNumber: undefined,
        };
      }

      return current;
    }),
    share(),
  );

  private parsedPhoneNumber$ = this.state$
    .pipe(
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
    )
    .pipe(distinctUntilChanged());

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

  writeValue(value: string | undefined): void {
    this.setPhoneNumber(value);
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
