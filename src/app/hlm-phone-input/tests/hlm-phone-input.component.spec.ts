import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {
  DisabledInputTestComponent,
  WithInitialCountryCodeTestComponent,
  WithoutInitialValueTestComponent,
  WithValidInitialValueTestComponent,
} from './phone-input';

describe('HlmPhoneNumberComponent', () => {
  beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  const setupWithoutInitialValue = async () => {
    const { fixture } = await render(WithoutInitialValueTestComponent);

    return {
      user: userEvent.setup(),
      fixture,
      countryCodeTrigger: screen.getByTestId('country-code-trigger'),
      phoneInput: screen.getByPlaceholderText('Enter a phone number'),
      countryCodeTriggerFlag: screen.getByTestId('country-code-trigger-flag'),
    };
  };

  const setupWithValidInitialValue = async () => {
    const { fixture } = await render(WithValidInitialValueTestComponent);

    return {
      user: userEvent.setup(),
      fixture,
      countryCodeTrigger: screen.getByTestId('country-code-trigger'),
      phoneInput: screen.getByPlaceholderText('Enter a phone number'),
      countryCodeTriggerFlag: screen.getByTestId('country-code-trigger-flag'),
    };
  };

  const setupDisabled = async () => {
    const { fixture } = await render(DisabledInputTestComponent);

    return {
      user: userEvent.setup(),
      fixture,
      countryCodeTrigger: screen.getByTestId('country-code-trigger'),
      phoneInput: screen.getByPlaceholderText('Enter a phone number'),
      countryCodeTriggerFlag: screen.getByTestId('country-code-trigger-flag'),
    };
  };

  const setupWithInitialCountryCode = async () => {
    const { fixture } = await render(WithInitialCountryCodeTestComponent);

    return {
      user: userEvent.setup(),
      fixture,
      countryCodeTrigger: screen.getByTestId('country-code-trigger'),
      phoneInput: screen.getByPlaceholderText('Enter a phone number'),
      countryCodeTriggerFlag: screen.getByTestId('country-code-trigger-flag'),
    };
  };

  describe('form', () => {
    it('marks form as touched when country selector is clicked', async () => {
      const { fixture, countryCodeTrigger } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(cmpInstance.form.touched).toBe(false);

      await userEvent.click(countryCodeTrigger);

      expect(cmpInstance.form.touched).toBe(true);
    });

    it('marks form as touched when phone input is focused', async () => {
      const { fixture, phoneInput } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(cmpInstance.form.touched).toBe(false);

      phoneInput.focus();

      expect(cmpInstance.form.touched).toBe(true);
    });
  });

  describe('formatting & validation', () => {
    it('prepends "+" when typing digits only', async () => {
      const { user, fixture, phoneInput } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      await user.type(phoneInput, '1234567');

      expect(cmpInstance.form.value.phoneNumber).toBe('+1234567');
    });

    it('preserves "+" when user types it manually as the first character', async () => {
      const { user, fixture, phoneInput } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();
      await user.type(phoneInput, '+1234567');

      expect(cmpInstance.form.value.phoneNumber).toBe('+1234567');
    });

    it('blocks invalid characters', async () => {
      const { user, phoneInput } = await setupWithoutInitialValue();

      await user.type(phoneInput, 'abc');

      expect((phoneInput as HTMLInputElement).value).not.toContain('abc');
    });

    it('formats input when number includes country code', async () => {
      const { user, phoneInput } = await setupWithoutInitialValue();

      await user.type(phoneInput, '12125554567');

      expect(phoneInput).toHaveValue('+1 212 555-4567');
    });

    it('formats input when country is selected and number is typed', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      await user.type(phoneInput, '2125554567');

      expect(phoneInput).toHaveValue('212 555-4567');
    });
  });

  describe('typing a phone number', () => {
    it('sets correct form value and flag when typing a phone number', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      await user.type(phoneInput, '12125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });

    it('clears form value and flag when input is cleared', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      await user.type(phoneInput, '12125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      await user.clear(phoneInput);

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();
    });

    it('sets correct form value and flag when clearing the input', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithValidInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      await user.clear(phoneInput);

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();
    });
  });

  describe('country selection via dropdown', () => {
    it('sets correct form value and flag when selecting a country', async () => {
      const { user, fixture, countryCodeTrigger, countryCodeTriggerFlag } =
        await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');
    });

    it('does not submit the form when opening/closing the dropdown', async () => {
      const { user, fixture, countryCodeTrigger } =
        await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      jest.spyOn(cmpInstance, 'onSubmit');

      // open
      await user.click(countryCodeTrigger);

      expect(cmpInstance.onSubmit).not.toHaveBeenCalled();
    });

    it('updates form value and flag when a different country is selected', async () => {
      const { user, fixture, countryCodeTrigger } =
        await setupWithValidInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('Canada'));

      expect(within(countryCodeTrigger).getByTitle('CA')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');
    });

    it('preserves form value and flag when the same country is reselected', async () => {
      const { user, fixture, countryCodeTrigger } =
        await setupWithValidInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });
  });

  describe('initial render behavior', () => {
    it('shows no flag if no initial value or default is set', async () => {
      const { countryCodeTriggerFlag } = await setupWithoutInitialValue();

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
    });

    it('shows default flag when configured via input', async () => {
      const { fixture, countryCodeTrigger } =
        await setupWithInitialCountryCode();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');
    });

    // TODO
    it('prefers form value (country code) over default flag if both are present', async () => {});

    it('sets flag based on initial form value', async () => {
      const { fixture, countryCodeTrigger } =
        await setupWithValidInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });

    it('disables phone input and country selector when component is disabled', async () => {
      const { countryCodeTrigger, phoneInput } = await setupDisabled();

      expect(countryCodeTrigger).toBeDisabled();
      expect(phoneInput).toBeDisabled();
    });
  });

  describe('two-action flows', () => {
    // select country -> type phone number (without +)
    it('sets correct form value and flag when a country is selected and a phone number is typed without +', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');

      await user.type(phoneInput, '2125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });

    // select country -> type phone number (with +)
    it('sets correct form value and flag when a country is selected and a phone number is typed with +', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');

      await user.type(phoneInput, '+14165554567');

      expect(within(countryCodeTrigger).getByTitle('CA')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+14165554567');
    });

    // select country -> paste phone number
    it('sets correct form value and flag when a country is selected and a phone number is pasted', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');

      phoneInput.focus();
      await user.paste('+14165554567');

      expect(within(countryCodeTrigger).getByTitle('CA')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+14165554567');
    });

    // type phone number -> select same country
    it('sets correct form value and flag when a phone number is typed and the same country is selected', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      await user.type(phoneInput, '+12125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });

    // type phone number -> select different country
    it('sets correct form value and flag when a phone number is typed and a different country is selected', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      await user.type(phoneInput, '+12125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('Canada'));

      expect(within(countryCodeTrigger).getByTitle('CA')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');
    });

    // clear input -> select country
    it('sets correct form value and flag when input is cleared and a new country is selected', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithValidInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      await user.clear(phoneInput);

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');
    });
  });

  describe('three-action flows', () => {
    // select country -> type phone number (without +) -> select same country
    it('sets correct form value and flag when selecting a country, typing a number without +, and selecting the same country again', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');

      await user.type(phoneInput, '2125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // close
      await user.click(document.documentElement);

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');
    });

    // select country -> type phone number (without +) -> select different country
    it('sets correct form value and flag when selecting a country, typing a number without +, and selecting a different country', async () => {
      const {
        user,
        fixture,
        countryCodeTrigger,
        phoneInput,
        countryCodeTriggerFlag,
      } = await setupWithoutInitialValue();
      const cmpInstance = fixture.componentInstance;

      expect(countryCodeTriggerFlag.querySelector('svg')).toBeNull();
      expect(cmpInstance.form.value.phoneNumber).toBeFalsy();

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('United States'));

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+1');

      await user.type(phoneInput, '2125554567');

      expect(within(countryCodeTrigger).getByTitle('US')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+12125554567');

      // close
      await user.click(document.documentElement);

      // open
      await user.click(countryCodeTrigger);

      await user.click(screen.getByTestId('Afghanistan'));

      expect(within(countryCodeTrigger).getByTitle('AF')).toBeInTheDocument();
      expect(cmpInstance.form.value.phoneNumber).toBe('+932125554567');
    });
  });
});
