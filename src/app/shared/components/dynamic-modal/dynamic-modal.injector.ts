import { InjectionToken, Injector, Type } from '@angular/core';

interface IOptions {
    optional: boolean;
    host: boolean;
    skipSelf: boolean;
}

export class DynamicModalInjector implements Injector {
    constructor(
        private _parentInjector: Injector,
        private _additionalTokens: WeakMap<any, any>,
    ) {
    }

    public get<T>(
        token: Type<T> | InjectionToken<T>,
        notFoundValue?: T,
        options?: IOptions
    ): T;

    public get(token: any, notFoundValue?: any): any;

    public get(token: any, notFoundValue?: any, options?: IOptions) {
        const value = this._additionalTokens.get(token);

        if (value) {
            return value;
        }

        return this._parentInjector.get<any>(token, notFoundValue, options);
    }
}
