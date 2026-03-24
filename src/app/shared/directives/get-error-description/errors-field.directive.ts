import {
    booleanAttribute,
    computed,
    Directive,
    effect,
    ElementRef,
    inject,
    input,
    Renderer2,
    signal,
} from '@angular/core';
import { AbstractControl, NgControl, NgModel, ValidationErrors } from '@angular/forms';
import { EMPTY, merge, Observable, Subscription } from 'rxjs';
import { VALIDATION_ERRORS_MESSAGES } from '@shared/constants/validation-errors-messages.constant';

@Directive({
    selector: '[anErrorsField]',
    standalone: true,
})
export class ErrorsFieldDirective {
    private readonly _hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly _renderer = inject(Renderer2);
    private readonly _ngControl = inject(NgControl, { optional: true, self: true });

    public readonly customErrorMessages = input<Record<string, string | ((...args: any[]) => string)>>({});

    public readonly control = input<AbstractControl | NgModel | null | undefined>(undefined);
    public readonly showAllErrors = input(false, { transform: booleanAttribute });
    public readonly splitSign = input('\n');

    private readonly _controlTickSignal = signal(0);
    private readonly _resolvedControlSignal = computed<AbstractControl | null>(() => {
        const controlInput = this.control();

        if (controlInput instanceof NgModel) {
            return controlInput.control;
        }

        return controlInput ?? this._ngControl?.control ?? null;
    });

    private readonly _watchControlChangesEffect = effect((onCleanup) => {
        const control = this._resolvedControlSignal();

        this._controlTickSignal.set(0);

        if (!control) {
            return;
        }

        const streams: Observable<unknown>[] = [];

        if (control.valueChanges) {
            streams.push(control.valueChanges);
        }

        if (control.statusChanges) {
            streams.push(control.statusChanges);
        }

        const controlSubscription: Subscription = (streams.length ? merge(...streams) : EMPTY)
            .subscribe(() => this._controlTickSignal.update(v => v + 1));

        onCleanup(() => controlSubscription.unsubscribe());
    });

    private readonly _errorText = computed<string>(() => {
        this._controlTickSignal();

        const control = this._resolvedControlSignal();

        if (!control || !control.errors || control.valid || (!control.touched && !control.dirty)) {
            return '';
        }

        const errors = control.errors as ValidationErrors;
        const parts: string[] = [];

        for (const errorType in errors) {
            const message = this._buildErrorMessage(errorType, errors[errorType]);

            if (!this.showAllErrors()) {
                return message;
            }

            parts.push(message);
        }

        return parts.join(this.splitSign());
    });

    private readonly _syncTextEffect = effect(() => {
        this._renderer.setProperty(this._hostRef.nativeElement, 'textContent', this._errorText());
    });

    private _buildErrorMessage(errorType: string, params: unknown): string {
        const customMessages = this.customErrorMessages();
        const messageValue = (
            customMessages[errorType]
            || VALIDATION_ERRORS_MESSAGES[errorType]
            || VALIDATION_ERRORS_MESSAGES['general']
        );

        if (typeof messageValue === 'function') {
            return (messageValue as (...args: unknown[]) => string)(params);
        }

        return messageValue;
    }
}
