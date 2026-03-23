import { delay, Observable, OperatorFunction, pipe } from 'rxjs';


export function emulateHttpDelay<T>(): OperatorFunction<T, T> {
    const delayMs = Math.random() * 1000;

    return pipe(delay(delayMs));
}
