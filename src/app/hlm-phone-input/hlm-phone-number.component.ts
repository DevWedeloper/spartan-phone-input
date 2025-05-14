import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { CountryCode } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/min/metadata';
import { distinctUntilChanged } from 'rxjs';
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
      #phone
      class="rounded-s-none rounded-e-lg"
      hlmInput
      [maskito]="maskitoOptions()"
      placeholder="Enter a phone number"
      type="tel"
      [(ngModel)]="linkedPhoneNumber"
      [disabled]="disabled()"
      (focus)="focusChange.emit()"
    />
    <!-- TODO: switch autocomplete depending on status -->
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneNumberComponent {
  phoneNumber = input.required<string | undefined>();
  status = input.required<Status | undefined>();
  countryCode = input.required<CountryCode | undefined>();
  disabled = input.required<boolean>();
  focusChange = output();

  protected linkedPhoneNumber = linkedSignal(() => this.phoneNumber());

  phoneNumberChange = outputFromObservable(
    toObservable(this.linkedPhoneNumber).pipe(distinctUntilChanged()),
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
