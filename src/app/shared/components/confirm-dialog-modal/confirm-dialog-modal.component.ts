import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import { ButtonComponent } from '@shared/ui/button/button.component';

export interface IConfirmDialogData {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
}

@Component({
    selector: 'an-confirm-dialog-modal',
    standalone: true,
    imports: [ButtonComponent],
    templateUrl: './confirm-dialog-modal.component.html',
    styleUrl: './confirm-dialog-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogModalComponent {
    private readonly dynamicModalConfig = inject(DynamicModalConfig<IConfirmDialogData>);
    private readonly dynamicModalService = inject(DynamicModalService);

    protected readonly message = this.dynamicModalConfig.data.message;
    protected readonly confirmLabel = this.dynamicModalConfig.data.confirmLabel ?? 'Да';
    protected readonly cancelLabel = this.dynamicModalConfig.data.cancelLabel ?? 'Нет';

    protected onConfirm(): void {
        this.dynamicModalConfig.data.onConfirm();
    }

    protected onCancel(): void {
        this.dynamicModalService.closeModal(this.dynamicModalConfig.modalName, true);
    }
}
