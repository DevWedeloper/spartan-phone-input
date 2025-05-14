import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HlmPhoneInputComponent } from '../hlm-phone-input.component';

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <hlm-phone-input formControlName="phoneNumber" />
    </form>
  `,
})
export class WithoutInitialValueTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string | undefined>(undefined),
  });

  onSubmit() {}
}

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form">
      <hlm-phone-input formControlName="phoneNumber" />
    </form>
  `,
})
export class WithValidInitialValueTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string>('+12125554567'),
  });
}

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form">
      <hlm-phone-input formControlName="phoneNumber" />
    </form>
  `,
})
export class DisabledInputTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string>({
      value: '+12125554567',
      disabled: true,
    }),
  });
}

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form">
      <hlm-phone-input
        formControlName="phoneNumber"
        [initialCountryCode]="'US'"
      />
    </form>
  `,
})
export class WithInitialCountryCodeTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string | undefined>(undefined),
  });
}

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form">
      <hlm-phone-input
        formControlName="phoneNumber"
        [initialCountryCode]="'AF'"
      />
    </form>
  `,
})
export class InitialValueWithDifferentCountryTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string>('+12125554567'),
  });
}

@Component({
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <form [formGroup]="form">
      <hlm-phone-input
        formControlName="phoneNumber"
        [initialCountryCode]="'US'"
      />
    </form>
  `,
})
export class InvalidInitialValueWithCountryTestComponent {
  form = new FormGroup({
    phoneNumber: new FormControl<string>('+1'),
  });
}
