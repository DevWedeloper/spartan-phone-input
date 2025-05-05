import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlmPhoneInputComponent } from './hlm-phone-input.component';

describe('HlmPhoneInputComponent', () => {
  let component: HlmPhoneInputComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HlmPhoneInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HlmPhoneInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
