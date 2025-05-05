import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HlmFlagComponent } from './hlm-flag.component';

describe('HlmFlagComponent', () => {
  let component: HlmFlagComponent;
  let fixture: ComponentFixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HlmFlagComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HlmFlagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
