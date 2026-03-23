import {
    ApplicationConfig, inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ThemeService } from '@shared/services/theme.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideZonelessChangeDetection(),
        provideAppInitializer(() => void inject(ThemeService)),
    ]
};
