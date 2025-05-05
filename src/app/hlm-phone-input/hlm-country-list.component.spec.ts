import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlmCountryListComponent } from './hlm-country-list.component';

describe('HlmCountryListComponent', () => {
  let component: HlmCountryListComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HlmCountryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HlmCountryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
