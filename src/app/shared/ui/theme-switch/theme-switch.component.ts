import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
    selector: 'an-theme-switch',
    imports: [],
    templateUrl: './theme-switch.component.html',
    styleUrl: './theme-switch.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeSwitchComponent {
    public readonly isDarkMode = input(false, { transform: booleanAttribute });
    public readonly themeChange = output<boolean>();

    protected readonly nextThemeLabelSignal = computed(() => {
        return `Toggle ${(this.isDarkMode() ? 'light' : 'dark')} mode`;
    });

    protected readonly screenReaderModeLabelSignal = computed(() => {
        return this.isDarkMode() ? 'Dark mode' : 'Light mode';
    });

    public onToggle(): void {
        this.themeChange.emit(!this.isDarkMode());
    }
}
