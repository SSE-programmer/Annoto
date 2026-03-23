import { effect, Injectable, signal } from '@angular/core';

export enum EThemeType {
    LIGHT = 'light',
    DARK = 'dark',
}

const DEFAULT_THEME = EThemeType.LIGHT;
const STORAGE_THEME_FIELD_NAME = 'theme:color';
const THEME_PREFIX = 'an-theme-';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly _colorThemeSignal = signal<EThemeType>(this._loadInitialThemeState());

    public readonly colorThemeSignal = this._colorThemeSignal.asReadonly();

    private readonly _colorThemeChangeEffect = effect(() => {
        const theme = this._colorThemeSignal();

        localStorage.setItem(STORAGE_THEME_FIELD_NAME, theme);
        this._applyThemeToBody(theme);
    });

    public toggleColorTheme(theme: EThemeType): void {
        this._colorThemeSignal.update(() => theme);
    }

    private _loadInitialThemeState(): EThemeType {
        const saved = localStorage.getItem(STORAGE_THEME_FIELD_NAME);
        const foundedTheme = Object
            .values(EThemeType)
            .find((theme: EThemeType) => theme === saved);

        if (foundedTheme) {
            return foundedTheme;
        }

        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? EThemeType.DARK : DEFAULT_THEME;
    }

    private _applyThemeToBody(theme: EThemeType): void {
        const classList = document.body.classList;

        Array.from(classList)
            .filter(className => className.startsWith(THEME_PREFIX))
            .forEach(className => classList.remove(className));

        classList.add(`${ THEME_PREFIX }${ theme }`);
        localStorage.setItem(STORAGE_THEME_FIELD_NAME, theme.toString());
    }
}
