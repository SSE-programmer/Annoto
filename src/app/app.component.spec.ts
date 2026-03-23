import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { EThemeType, ThemeService } from '@shared/services/theme.service';
import { signal } from '@angular/core';

describe('App', () => {
    let fixture: ComponentFixture<AppComponent>;
    const colorThemeSignal = signal<EThemeType>(EThemeType.LIGHT);
    const themeServiceMock = {
        colorThemeSignal: colorThemeSignal.asReadonly(),
        toggleColorTheme: (theme: EThemeType) => colorThemeSignal.set(theme),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                { provide: ThemeService, useValue: themeServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
    });

    it('should create the app', () => {
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('should render layout sections', () => {
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('an-header')).toBeTruthy();
        expect(compiled.querySelector('main.main')).toBeTruthy();
        expect(compiled.querySelector('router-outlet')).toBeTruthy();
        expect(compiled.querySelector('an-footer')).toBeTruthy();
    });
});
