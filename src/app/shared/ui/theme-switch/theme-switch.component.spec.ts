import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSwitchComponent } from './theme-switch.component';
import { vi } from 'vitest';

describe('ThemeSwitchComponent', () => {
    let component: ThemeSwitchComponent;
    let fixture: ComponentFixture<ThemeSwitchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ThemeSwitchComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ThemeSwitchComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should reflect current mode in checkbox and aria label', () => {
        fixture.componentRef.setInput('isDarkMode', true);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        const checkbox = compiled.querySelector('input[role="switch"]') as HTMLInputElement;

        expect(checkbox.checked).toBe(true);
        expect(checkbox.getAttribute('aria-label')).toContain('light');
    });

    it('should emit opposite mode on toggle', () => {
        const emitSpy = vi.spyOn(component.themeChange, 'emit');
        fixture.componentRef.setInput('isDarkMode', false);
        fixture.detectChanges();

        component.onToggle();

        expect(emitSpy).toHaveBeenCalledWith(true);
    });
});
