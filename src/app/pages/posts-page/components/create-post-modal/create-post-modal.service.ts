import { computed, inject, Injectable, signal } from '@angular/core';
import { getCreateOrUpdatePostForm } from '@shared/forms/create-or-update-post/create-or-update-post.form';
import { defer, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';
import { IConfig } from './create-post-modal.component';
import { IPost } from '@shared/services/http/posts-http/models';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class CreatePostModalService {
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly dynamicModalConfig = inject<DynamicModalConfig<IConfig>>(DynamicModalConfig);
    private readonly postsHttpService = inject(PostsHttpService);

    public readonly form = getCreateOrUpdatePostForm(this.dynamicModalConfig.data?.post);

    private readonly _isPostSaving = signal(false);
    public readonly isPostSaving = this._isPostSaving.asReadonly();

    private get _contentControl() {
        return this.form.controls.content;
    }

    private readonly _isContentChanged$ = this._contentControl.valueChanges.pipe(
        startWith(this._contentControl.getRawValue()),
        map((content) => {
            return content !== this._contentControl.defaultValue;
        }),
    );

    private readonly _isContentChangedSignal = toSignal(this._isContentChanged$, { initialValue: false })

    public readonly annotationsWillBeRemovedSignal = computed(() => {
        return this.isEditingPost() && this._isContentChangedSignal();
    });

    public readonly isEditingPost = signal<IPost | undefined>(this.dynamicModalConfig.data.post)
        .asReadonly();

    public savePost(): void {
        this.form.markAsTouched();

        if (this.form.invalid) {
            return;
        }

        const { title, content } = this.form.getRawValue();
        const existing = this.dynamicModalConfig.data.post;

        if (existing && this.annotationsWillBeRemovedSignal()) {
            localStorage.removeItem(this._annotationKeyForPost(existing.id));
        }

        const request$ = existing
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

    private _annotationKeyForPost(postId: string): string {
        return `post-detail:${ postId }`;
    }
}
