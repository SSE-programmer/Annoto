import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { ButtonComponent } from './button.component';

@Component({
    standalone: true,
    imports: [ButtonComponent],
    template: `
        <an-button
            [label]="label"
            [ariaLabel]="ariaLabel"
            [disabled]="disabled"
            [loading]="loading"
            [loadingPosition]="loadingPosition"
            [outlined]="outlined"
            [dashed]="dashed"
            [severity]="severity"
            [size]="size"
            [type]="type"
        >
            <ng-template #iconLeft><span class="test-icon-left">L</span></ng-template>
            <ng-template #iconRight><span class="test-icon-right">R</span></ng-template>
            <ng-template #loadingIndicator><span class="test-loading-indicator">Loading</span></ng-template>
        </an-button>
    `,
})
class TestHostComponent {
    public label = 'Save';
    public ariaLabel: string | null = null;
    public disabled = false;
    public loading = false;
    public loadingPosition: 'left' | 'right' = 'right';
    public outlined = false;
    public dashed = false;
    public severity: 'primary' | 'secondary' = 'primary';
    public size: 'small' | 'normal' = 'normal';
    public type: 'button' | 'submit' | 'reset' = 'button';
}

describe('ButtonComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let host: TestHostComponent;

    const getButtonDebug = () => fixture.debugElement.query(By.directive(ButtonComponent));
    const getButtonInstance = () => getButtonDebug().componentInstance as ButtonComponent;
    const getNativeButton = () => fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestHostComponent],
        }).compileComponents();
    });

    const createComponent = (): void => {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
    };

    it('creates component instance', () => {
        createComponent();
        fixture.detectChanges();

        expect(getButtonInstance()).toBeTruthy();
    });

    it('uses label as fallback aria-label', () => {
        createComponent();
        fixture.detectChanges();

        const button = getNativeButton();
        expect(button.getAttribute('aria-label')).toBe('Save');
    });

    it('uses explicit aria-label when provided', () => {
        createComponent();
        host.ariaLabel = 'Submit form';
        fixture.detectChanges();

        expect(getNativeButton().getAttribute('aria-label')).toBe('Submit form');
    });

    it('renders css classes for state and variants', () => {
        createComponent();
        host.loading = true;
        host.outlined = true;
        host.dashed = true;
        host.severity = 'secondary';
        host.size = 'small';
        fixture.detectChanges();

        const classes = getNativeButton().className;
        expect(classes).toContain('an-button-secondary');
        expect(classes).toContain('an-button-small');
        expect(classes).toContain('an-button-loading');
        expect(classes).toContain('an-button-outlined');
        expect(classes).toContain('an-button-dashed');
    });

    it('emits click when enabled and not loading', () => {
        createComponent();
        fixture.detectChanges();

        const emitSpy = vi.spyOn(getButtonInstance().onClick, 'emit');

        getNativeButton().click();

        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('does not emit click when disabled', () => {
        createComponent();
        host.disabled = true;
        fixture.detectChanges();
        const emitSpy = vi.spyOn(getButtonInstance().onClick, 'emit');

        getNativeButton().click();

        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('does not emit click when loading', () => {
        createComponent();
        host.loading = true;
        fixture.detectChanges();
        const emitSpy = vi.spyOn(getButtonInstance().onClick, 'emit');

        getNativeButton().click();

        expect(emitSpy).not.toHaveBeenCalled();
    });

    it('renders custom loading indicator on the right when loading', () => {
        createComponent();
        host.loading = true;
        host.loadingPosition = 'right';
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.querySelector('.test-loading-indicator')).toBeTruthy();
        expect(native.querySelector('.test-icon-right')).toBeFalsy();
    });

    it('renders custom loading indicator on the left when loadingPosition is left', () => {
        createComponent();
        host.loading = true;
        host.loadingPosition = 'left';
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.querySelector('.test-loading-indicator')).toBeTruthy();
        expect(native.querySelector('.test-icon-left')).toBeFalsy();
    });

    it('renders projected icons when not loading', () => {
        createComponent();
        host.loading = false;
        fixture.detectChanges();

        const native = fixture.nativeElement as HTMLElement;
        expect(native.querySelector('.test-icon-left')).toBeTruthy();
        expect(native.querySelector('.test-icon-right')).toBeTruthy();
    });
});
