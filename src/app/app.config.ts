import {
    ApplicationConfig,
    inject,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection
} from '@angular/core';
import { provideRouter, Router, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { ThemeService } from '@shared/services/theme.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(
            routes,
            withViewTransitions({
                onViewTransitionCreated: ({transition}) => {
                    const router = inject(Router);
                    const targetUrl = router.getCurrentNavigation()?.finalUrl || '';
                    const config = {
                        paths: 'exact',
                        matrixParams: 'exact',
                        fragment: 'ignored',
                        queryParams: 'ignored',
                    } as const;

                    if (router.isActive(targetUrl, config)) {
                        transition.skipTransition();
                    }
                },
            })
        ),
        provideZonelessChangeDetection(),
        provideAppInitializer(() => void inject(ThemeService)),
    ]
};
