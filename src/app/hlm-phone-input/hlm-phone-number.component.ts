import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';
import { maskitoPhoneOptionsGenerator } from '@maskito/phone';
import { HlmInputDirective } from '@spartan-ng/ui-input-helm';
import { AsYouType } from 'libphonenumber-js';
import metadata from 'libphonenumber-js/min/metadata';

@Component({
  selector: 'hlm-phone-number',
  imports: [FormsModule, MaskitoDirective, HlmInputDirective],
  template: `
    <input
      class="rounded-s-none rounded-e-lg"
      hlmInput
      [maskito]="maskitoOptions"
      placeholder="Enter a phone number"
      type="tel"
      [(ngModel)]="phoneNumber"
      [disabled]="disabled()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmPhoneNumberComponent {
  phoneNumber = model<string | undefined>();
  disabled = input.required<boolean>();

  private selectedCountry = computed(() => {
    const phoneNumber = this.phoneNumber() || '';
    const formatter = new AsYouType();

    formatter.input(phoneNumber);

    return formatter.getCountry();
  });

  selectedCountryChange = outputFromObservable(
    toObservable(this.selectedCountry),
  );

  protected maskitoOptions: MaskitoOptions = maskitoPhoneOptionsGenerator({
    metadata,
    strict: false,
  });
}
