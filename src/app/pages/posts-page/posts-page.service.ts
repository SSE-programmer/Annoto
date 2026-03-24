import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostsHttpService } from '@shared/services/http/posts-http/posts-http.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, finalize, switchMap, tap } from 'rxjs';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';
import {
    CreatePostModalComponent,
    IConfig
} from '@pages/posts-page/components/create-post-modal/create-post-modal.component';

@Injectable()
export class PostsPageService {
    private readonly postsHttpService = inject(PostsHttpService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly router = inject(Router);

    private readonly _isPostsLoadingSignal = signal(false);
    public readonly isPostsLoadingSignal = this._isPostsLoadingSignal.asReadonly();

    private _updatePosts$ = new BehaviorSubject(null);
    private readonly _posts$ = this._updatePosts$.pipe(
        tap(() => this._isPostsLoadingSignal.set(true)),
        switchMap(() => this.postsHttpService.getPosts().pipe(
                finalize(() => this._isPostsLoadingSignal.set(false)),
                takeUntilDestroyed(this.destroyRef)
            )
        )
    );

    public readonly postsSignal = toSignal(this._posts$, { initialValue: [] });

    public openCreatePostModal() {
        this.dynamicModalService.open<IConfig>(CreatePostModalComponent, {
            modalName: CreatePostModalComponent.name,
            width: '1200px',
            data: {
                onSave: () => this._updatePosts$.next(null)
            }
        });
    }

    public goToPostPage(postId: string): void {
        void this.router.navigate(['post', postId]);
    }
}
