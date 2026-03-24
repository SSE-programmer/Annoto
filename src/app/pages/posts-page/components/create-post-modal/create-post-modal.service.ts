import { inject, Injectable, signal } from '@angular/core';
import { getCreateOrUpdatePostForm } from '@shared/forms/create-or-update-post/create-or-update-post.form';
import { defer, finalize, of, switchMap, tap } from 'rxjs';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';
import { IConfig } from './create-post-modal.component';

@Injectable()
export class CreatePostModalService {
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly dynamicModalConfig = inject<DynamicModalConfig<IConfig>>(DynamicModalConfig<IConfig>);
    public readonly form = getCreateOrUpdatePostForm();
    private readonly postsHttpService = inject(PostsHttpService);


    private readonly _isPostSaving = signal(false);
    public readonly isPostSaving = this._isPostSaving.asReadonly();

    public savePost() {
        this.form.markAsTouched();

        if (this.form.invalid) {
            return;
        }

        const data = this.form.getRawValue();

        defer(() => {
            this._isPostSaving.set(true);

            return of(null);
        })
            .pipe(
                switchMap(() => this.postsHttpService.createPost(data).pipe(
                        tap({
                            next: () => {
                                this.dynamicModalConfig.data.onSave?.();
                                this.close();
                            },
                            error: () => {
                                // TODO toastr
                            }
                        }),
                        finalize(() => {
                            this._isPostSaving.set(false);
                        })
                    )
                )
            )
            .subscribe();
    }

    public close() {
        this.dynamicModalService.closeModal(this.dynamicModalConfig.modalName);
    }
}
