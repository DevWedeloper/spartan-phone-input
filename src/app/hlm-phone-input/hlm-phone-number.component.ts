import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { AsYouType, CountryCode } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/min/metadata';
import { filter } from 'rxjs';
import { Status } from './hlm-phone-input.component';
import {
  maskitoPhoneOptionsGeneratorExplicit,
  maskitoPhoneOptionsGeneratorImplicit,
} from './masks';

@Component({
  selector: 'hlm-phone-number',
  imports: [FormsModule, MaskitoDirective, HlmInputDirective],
  template: `
    <input
      class="rounded-s-none rounded-e-lg"
      hlmInput
      [maskito]="maskitoOptions()"
      placeholder="Enter a phone number"
      type="tel"
      [(ngModel)]="phoneNumber"
      [disabled]="disabled()"
      (focus)="focusChange.emit()"
    />
    <!-- TODO: switch autocomplete depending on status -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneNumberComponent {
  phoneNumber = model<string | undefined>();
  status = input.required<Status | undefined>();
  countryCode = input.required<CountryCode | undefined>();
  disabled = input.required<boolean>();
  focusChange = output();

  // TODO: Improve logic as its currently hard to follow
  private derivedPhoneState = computed(() => {
    const currentCountryCode = this.countryCode();
    const phoneNumber = this.phoneNumber();
    const formatter = new AsYouType();

    formatter.input(phoneNumber || '');

    const countryCode = formatter.getCountry();

    // console.log({
    //   currentCountryCode,
    //   currentEval: phoneNumber?.startsWith('+') || phoneNumber === '',
    //   newEval: !currentCountryCode && (phoneNumber?.startsWith('+') || !phoneNumber)
    // });

    if (phoneNumber?.startsWith('+') || phoneNumber === '') {
      return {
        status: 'explicit' as const,
        countryCode,
      };
    }

    return undefined;
  });

  derivedPhoneStateChange = outputFromObservable(
    toObservable(this.derivedPhoneState).pipe(filter(Boolean)),
  );

  // TODO: Try to reflect changes when switching from implicit to explicit (copy paste of number)
  protected maskitoOptions = computed(() => {
    const status = this.status();
    const countryCode = this.countryCode();

    switch (status) {
      case 'implicit':
        return maskitoPhoneOptionsGeneratorImplicit({
          metadata,
          strict: false,
          countryCode,
        });
      default:
        return maskitoPhoneOptionsGeneratorExplicit({
          metadata,
          strict: false,
        });
    }
  });
}
