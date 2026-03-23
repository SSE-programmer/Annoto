import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { EThemeType, ThemeService } from '@shared/services/theme.service';
import { ThemeSwitchComponent } from '@shared/ui/theme-switch/theme-switch.component';

@Component({
    selector: 'an-header',
    imports: [
        ThemeSwitchComponent
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
    private readonly themeService = inject(ThemeService);

    protected readonly isDarkThemeSignal = computed(() => {
        return this.themeService.colorThemeSignal() === EThemeType.DARK;
    });

    protected toggleTheme(): void {
        const nextTheme = this.isDarkThemeSignal() ? EThemeType.LIGHT : EThemeType.DARK;

        this.themeService.toggleColorTheme(nextTheme);
    }
}
