import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function concertTimeOrderValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const date = String(control.get('date')?.value ?? '').trim();
        const startTime = String(control.get('startTime')?.value ?? '').trim();
        const endTime = String(control.get('endTime')?.value ?? '').trim();

        if (!date || !startTime || !endTime) {
            return null;
        }

        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return null;
        }

        return end > start ? null : { endBeforeStart: true };
    };
}
