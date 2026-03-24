import { inject, Injectable, signal } from '@angular/core';
import { getCreateOrUpdatePostForm } from '@shared/forms/create-or-update-post/create-or-update-post.form';
import { defer, finalize, of, switchMap, tap } from 'rxjs';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';
import { IConfig } from './create-post-modal.component';
import { IPost } from '@shared/services/http/posts-http/models';

@Injectable()
export class CreatePostModalService {
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly dynamicModalConfig = inject(DynamicModalConfig<IConfig>);
    private readonly postsHttpService = inject(PostsHttpService);

    public readonly form = getCreateOrUpdatePostForm(this.dynamicModalConfig.data?.post);

    private readonly _isPostSaving = signal(false);
    public readonly isPostSaving = this._isPostSaving.asReadonly();

    public get editingPost(): IPost | undefined {
        return this.dynamicModalConfig.data?.post;
    }

    public savePost(): void {
        this.form.markAsTouched();

        if (this.form.invalid) {
            return;
        }

        const { title, content } = this.form.getRawValue();
        const existing = this.dynamicModalConfig.data?.post;

        const request$ = existing?.id
            ? this.postsHttpService.updatePost(existing.id, { id: existing.id, title, content })
            : this.postsHttpService.createPost({ title, content });

        defer(() => {
            this._isPostSaving.set(true);

            return of(null);
        })
            .pipe(
                switchMap(() => request$.pipe(
                    tap({
                        next: () => {
                            this.dynamicModalConfig.data.onSave?.();
                            this.close();
                        },
                        error: () => {
                            // TODO toastr
                        },
                    }),
                    finalize(() => {
                        this._isPostSaving.set(false);
                    }),
                )),
            )
            .subscribe();
    }

    public close(): void {
        this.dynamicModalService.closeModal(this.dynamicModalConfig.modalName);
    }
}
