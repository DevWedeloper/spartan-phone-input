import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlmPhoneNumberComponent } from './hlm-phone-number.component';

describe('HlmPhoneNumberComponent', () => {
  let component: HlmPhoneNumberComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HlmPhoneNumberComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HlmPhoneNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
