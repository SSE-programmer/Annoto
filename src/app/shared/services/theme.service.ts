import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, RendererFactory2, signal } from '@angular/core';

export enum EThemeType {
    LIGHT = 'light',
    DARK = 'dark',
}

const DEFAULT_THEME = EThemeType.LIGHT;
const STORAGE_THEME_FIELD_NAME = 'theme:color';
const THEME_PREFIX = 'an-theme-';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private readonly document = inject(DOCUMENT);
    private readonly rendererFactory = inject(RendererFactory2);

    private readonly _colorThemeSignal = signal<EThemeType>(this._loadInitialThemeState());
    public readonly colorThemeSignal = this._colorThemeSignal.asReadonly();

    private readonly _colorThemeChangeEffect = effect(() => {
        const theme = this._colorThemeSignal();

        localStorage.setItem(STORAGE_THEME_FIELD_NAME, theme);
        this._applyThemeToBody(theme);
    });

    private readonly _bodyRenderer = this.rendererFactory.createRenderer(this.document.body, null);

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

        return this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches
            ? EThemeType.DARK
            : DEFAULT_THEME;
    }

    private _applyThemeToBody(theme: EThemeType): void {
        const body = this.document.body;

        if (!body) {
            return;
        }

        for (const className of Array.from(body.classList)) {
            if (className.startsWith(THEME_PREFIX)) {
                this._bodyRenderer.removeClass(body, className);
            }
        }

        this._bodyRenderer.addClass(body, `${ THEME_PREFIX }${ theme }`);
    }
}
