import {
  ChangeDetectionStrategy,
  Component,
  inject,
  model,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { BrnCommandImports } from '@spartan-ng/brain/command';
import { BrnDialogRef } from '@spartan-ng/brain/dialog';
import { HlmCommandImports } from '@spartan-ng/ui-command-helm';
import { HlmIconDirective } from '@spartan-ng/ui-icon-helm';
import { HlmScrollAreaDirective } from '@spartan-ng/ui-scrollarea-helm';
import {
  CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { HlmCountrySelectOptionComponent } from './hlm-country-select-option.component';

@Component({
  selector: 'hlm-country-list',
  imports: [
    BrnCommandImports,
    HlmCommandImports,
    NgIcon,
    HlmIconDirective,
    HlmScrollAreaDirective,
    NgScrollbarModule,
    HlmCountrySelectOptionComponent,
  ],
  providers: [
    provideIcons({
      lucideSearch,
    }),
  ],
  template: `
    <hlm-command class="w-auto">
      <hlm-command-search>
        <ng-icon hlm name="lucideSearch" />
        <input
          type="text"
          hlm-command-search-input
          placeholder="Search country..."
        />
      </hlm-command-search>

      <hlm-command-list>
        <ng-scrollbar hlm visibility="hover" class="h-72">
          <hlm-command-group>
            @for (country of countries; track $index) {
              <button
                hlm-command-item
                [value]="country.countryName"
                (selected)="onSelectedCountryCode(country.countryCode)"
              >
                <hlm-country-select-option
                  [countryCode]="country.countryCode"
                  [countryName]="country.countryName"
                  [countryCallingCode]="country.countryCallingCode"
                  [selectedCountryCode]="selectedCountryCode()"
                />
              </button>
            }
          </hlm-command-group>
        </ng-scrollbar>
      </hlm-command-list>

      <div *brnCommandEmpty hlmCommandEmpty>No country found.</div>
    </hlm-command>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HlmCountryListComponent {
  private readonly _brnDialogRef = inject(BrnDialogRef);

  selectedCountryCode = model<CountryCode | undefined>(undefined);

  protected countries = getCountries()
    .map((country) => ({
      countryCode: country,
      countryCallingCode: '+' + getCountryCallingCode(country),
      countryName:
        new Intl.DisplayNames(['en'], { type: 'region' }).of(country) ?? '',
    }))
    .sort((a, b) =>
      a.countryName.localeCompare(b.countryName, undefined, {
        sensitivity: 'base',
      }),
    );

  protected onSelectedCountryCode(countryCode: CountryCode): void {
    this.selectedCountryCode.set(countryCode);
    this._brnDialogRef.close();
  }
}
