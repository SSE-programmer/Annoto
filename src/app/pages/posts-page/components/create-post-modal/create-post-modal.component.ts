import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CreatePostModalService } from '@pages/posts-page/components/create-post-modal/create-post-modal.service';
import { IPost } from '@shared/services/http/posts-http/models';
import { ReactiveFormsModule } from '@angular/forms';
import { ErrorsFieldDirective } from '@shared/directives/get-error-description/errors-field.directive';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconCrossComponent } from '@shared/ui/icons/icon-cross/icon-cross.component';

export interface IConfig {
    onSave?: () => void;
    post?: IPost;
}

@Component({
    selector: 'an-create-post-modal',
    imports: [
        ReactiveFormsModule,
        ErrorsFieldDirective,
        ButtonComponent,
        IconCrossComponent
    ],
    providers: [CreatePostModalService],
    templateUrl: './create-post-modal.component.html',
    styleUrl: './create-post-modal.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePostModalComponent {
    protected readonly createPostModalService = inject(CreatePostModalService);

    protected readonly form = this.createPostModalService.form;

    protected readonly isPostSaving = this.createPostModalService.isPostSaving;

    protected savePost() {
        this.createPostModalService.savePost();
    }

    protected close() {
        this.createPostModalService.close();
    }
}
