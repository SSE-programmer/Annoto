import { ChangeDetectionStrategy, Component, inject, } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import { ButtonComponent } from '@shared/ui/button/button.component';


export const ANNOTATION_MODAL_NAME = 'annotation-modal';

export interface IAnnotationModalData {
    mode: 'create' | 'edit';
    initialColor?: PresetColor;
    initialText?: string;
    onSave: (color: string, text: string) => void;
}

interface IAnnotationForm {
    color: FormControl<PresetColor>;
    text: FormControl<string>;
}

type PresetColor = typeof PRESET_COLORS[number];

const PRESET_COLORS = [
    '#f03e3e',
    '#e8590c',
    '#f59f00',
    '#37b24d',
    '#1098ad',
    '#4263eb',
    '#7048e8',
    '#ae3ec9',
] as const;

@Component({
    selector: 'an-annotation-create-modal',
    standalone: true,
    imports: [FormsModule, ButtonComponent, ReactiveFormsModule],
    templateUrl: './annotation-create-modal.component.html',
    styleUrl: './annotation-create-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnotationCreateModalComponent {
    private readonly config = inject<DynamicModalConfig<IAnnotationModalData>>(DynamicModalConfig);
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly fb = inject(FormBuilder);

    protected readonly presetColors = PRESET_COLORS;

    protected readonly form = this.fb.group<IAnnotationForm>({
        color: this.fb.nonNullable.control<PresetColor>(this.config.data.initialColor ?? PRESET_COLORS[0]),
        text: this.fb.nonNullable.control(this.config.data.initialText ?? '', [Validators.required, Validators.minLength(1)])
    });

    protected readonly title = this.config.data.mode === 'edit' ? 'Редактирование аннотации' : 'Новая аннотация';

    protected get canSave(): boolean {
        return this.form.valid;
    }

    protected onSave(): void {
        this.form.markAllAsTouched();

        if (!this.canSave) {
            return;
        }

        const { color, text } = this.form.getRawValue();

        this.config.data.onSave(color, text.trim());
        this.dynamicModalService.closeModal(ANNOTATION_MODAL_NAME);
    }

    protected onCancel(): void {
        this.dynamicModalService.closeModal(ANNOTATION_MODAL_NAME);
    }
}
