import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { IPost } from '@shared/services/http/posts-http/models';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import {
    CreatePostModalComponent,
    IConfig,
} from '@pages/posts-page/components/create-post-modal/create-post-modal.component';
import {
    ConfirmDialogModalComponent,
    IConfirmDialogData,
} from '@shared/components/confirm-dialog-modal/confirm-dialog-modal.component';
import { catchError, distinctUntilChanged, finalize, map, merge, of, Subject, switchMap, tap } from 'rxjs';
import { MODAL_WIDTH_MD } from '@shared/constants/modal-config';

@Injectable()
export class PostDetailPageService {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly postsHttpService = inject(PostsHttpService);
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly destroyRef = inject(DestroyRef);

    private readonly _reloadPost$ = new Subject<void>();

    private readonly _isPostLoadingSignal = signal(true);
    public readonly isPostLoadingSignal = this._isPostLoadingSignal.asReadonly();

    private readonly _post$ = merge(
        this.route.paramMap.pipe(
            map(paramMap => paramMap.get('id')),
            distinctUntilChanged(),
        ),
        this._reloadPost$.pipe(
            map(() => this.route.snapshot.paramMap.get('id')),
        ),
    ).pipe(
        tap(() => this._isPostLoadingSignal.set(true)),
        switchMap(id => {
            if (!id) {
                return of(null).pipe(finalize(() => this._isPostLoadingSignal.set(false)));
            }

            return this.postsHttpService.getPostById(id).pipe(
                catchError(() => of(null)),
                finalize(() => this._isPostLoadingSignal.set(false)),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
    );

    public readonly postSignal = toSignal(this._post$, { initialValue: null as IPost | null });

    public openEditPostModal(post: IPost): void {
        this.dynamicModalService.open<IConfig>(CreatePostModalComponent, {
            modalName: CreatePostModalComponent.name,
            width: '1200px',
            data: {
                post,
                onSave: () => this._reloadPost$.next(),
            },
        });
    }

    public openDeletePostConfirm(post: IPost): void {
        this.dynamicModalService.open<IConfirmDialogData>(ConfirmDialogModalComponent, {
            modalName: ConfirmDialogModalComponent.name,
            width: MODAL_WIDTH_MD,
            data: {
                message: 'Вы действительно хотите удалить статью?',
                confirmLabel: 'Да',
                cancelLabel: 'Нет',
                onConfirm: () => {
                    this.postsHttpService.deletePost(post.id).subscribe({
                        next: () => {
                            this.dynamicModalService.closeModal(ConfirmDialogModalComponent.name, true);
                            void this.router.navigate(['/']);
                        },
                        error: () => {
                            // TODO toastr
                        },
                    });
                },
            },
        });
    }
}
