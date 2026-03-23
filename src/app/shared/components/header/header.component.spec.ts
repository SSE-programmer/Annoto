import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { EThemeType, ThemeService } from '@shared/services/theme.service';
import { ThemeSwitchComponent } from '@shared/ui/theme-switch/theme-switch.component';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
    let component: HeaderComponent;
    let fixture: ComponentFixture<HeaderComponent>;
    const colorThemeSignal = signal<EThemeType>(EThemeType.LIGHT);
    const themeServiceMock = {
        colorThemeSignal: colorThemeSignal.asReadonly(),
        toggleColorTheme: vi.fn((theme: EThemeType) => colorThemeSignal.set(theme)),
    };

    beforeEach(async () => {
        themeServiceMock.toggleColorTheme.mockClear();
        colorThemeSignal.set(EThemeType.LIGHT);

        await TestBed.configureTestingModule({
            imports: [HeaderComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(HeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render site title', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.site-title')?.textContent?.trim()).toBe('Annoto');
    });

    it('should pass dark mode state to theme switch', () => {
        colorThemeSignal.set(EThemeType.DARK);
        fixture.detectChanges();

        const themeSwitchComponent = fixture.debugElement.query(By.directive(ThemeSwitchComponent)).componentInstance as ThemeSwitchComponent;
        expect(themeSwitchComponent.isDarkMode()).toBe(true);
    });

    it('should toggle theme on themeChange event', () => {
        const themeSwitchComponent = fixture.debugElement.query(By.directive(ThemeSwitchComponent)).componentInstance as ThemeSwitchComponent;

        themeSwitchComponent.themeChange.emit(true);

        expect(themeServiceMock.toggleColorTheme).toHaveBeenCalledWith(EThemeType.DARK);
    });
});
