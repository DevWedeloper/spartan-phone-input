import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmPhoneInputComponent } from './hlm-phone-input/hlm-phone-input.component';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, HlmPhoneInputComponent],
  template: `
    <div class="flex h-screen items-center justify-center">
      <form [formGroup]="form">
        <hlm-phone-input
          formControlName="phoneNumber"
          [initialCountryCode]="'PH'"
        />
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private fb = inject(FormBuilder);

  protected form = this.fb.nonNullable.group({
    phoneNumber: ['+12125554567', [Validators.required]],
  });

  constructor() {
    // this.form.valueChanges.subscribe(console.log);
  }
}
