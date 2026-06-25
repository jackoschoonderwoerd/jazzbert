import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function optionalUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = String(control.value ?? '').trim();

        if (!value) {
            return null;
        }

        try {
            const url = new URL(value);

            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return { url: true };
            }

            return null;
        } catch {
            return { url: true };
        }
    };
}
