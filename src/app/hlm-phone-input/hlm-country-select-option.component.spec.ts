import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlmCountrySelectOptionComponent } from './hlm-country-select-option.component';

describe('HlmCountrySelectOptionComponent', () => {
  let component: HlmCountrySelectOptionComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HlmCountrySelectOptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HlmCountrySelectOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
