import { Injectable } from '@angular/core';
import { POST_CONTENT_LIST_PREVIEW_LENGTH } from '@shared/constants/post-content.constants';
import { defer, Observable, of, throwError } from 'rxjs';
import { emulateHttpDelay } from '@shared/operators/emulate-http-delay.operator';
import { ICreatePostDto, IPost, IPostSummary, IUpdatePostDto } from './models';


const STORAGE_POSTS_KEY = 'posts:collection';

@Injectable({ providedIn: 'root' })
export class PostsHttpService {
    public getPosts(): Observable<IPostSummary[]> {
        return defer(() =>
            of(this._readPostsFromStorage().map(post => this._toSummary(post))).pipe(emulateHttpDelay()),
        );
    }

    public getPostById(postId: string): Observable<IPost> {
        return defer(() => {
            const post = this._readPostsFromStorage().find(item => item.id === postId);

            if (!post) {
                return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
            }

            return of(post).pipe(emulateHttpDelay());
        });
    }

    public createPost(dto: ICreatePostDto): Observable<IPost> {
        return defer(() => {
            const now = new Date().toISOString();
            const posts = this._readPostsFromStorage();
            const content = dto.content.trim();
            const newPost: IPost = {
                id: this._generateId(),
                title: dto.title.trim(),
                content,
                contentPreview: this._buildPostContentPreview(content),
                createdAt: now,
                updatedAt: now,
            };

            posts.push(newPost);
            this._writePostsToStorage(posts);

            return of(newPost).pipe(emulateHttpDelay());
        });
    }

    public updatePost(postId: string, dto: IUpdatePostDto): Observable<IPost> {
        return defer(() => {
            const posts = this._readPostsFromStorage();
            const postIndex = posts.findIndex(item => item.id === postId);

            if (postIndex === -1) {
                return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
            }

            const currentPost = posts[postIndex];
            const content = dto.content !== undefined ? dto.content.trim() : currentPost.content;
            const updatedPost: IPost = {
                ...currentPost,
                title: dto.title !== undefined ? dto.title.trim() : currentPost.title,
                content,
                contentPreview: this._buildPostContentPreview(content),
                updatedAt: new Date().toISOString(),
            };

            posts[postIndex] = updatedPost;
            this._writePostsToStorage(posts);

            return of(updatedPost).pipe(emulateHttpDelay());
        });
    }

    public deletePost(postId: string): Observable<void> {
        return defer(() => {
            const posts = this._readPostsFromStorage();
            const filteredPosts = posts.filter(item => item.id !== postId);

            if (filteredPosts.length === posts.length) {
                return throwError(() => new Error(`Post with id "${ postId }" was not found`)).pipe(emulateHttpDelay());
            }

            this._writePostsToStorage(filteredPosts);

            return of(void 0).pipe(emulateHttpDelay());
        });
    }

    private _readPostsFromStorage(): IPost[] {
        const serializedPosts = localStorage.getItem(STORAGE_POSTS_KEY);

        if (!serializedPosts) {
            return [];
        }

        try {
            const parsed = JSON.parse(serializedPosts) as unknown;

            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .filter(this._isRawPostRecord)
                .map(raw => this._normalizePost(raw));
        } catch {
            return [];
        }
    }

    private _writePostsToStorage(posts: IPost[]): void {
        localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
    }

    private _toSummary(post: IPost): IPostSummary {
        return {
            id: post.id,
            title: post.title,
            contentPreview: post.contentPreview,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
    }

    private _normalizePost(raw: unknown): IPost {
        const post = raw as Partial<IPost>;

        return {
            id: post.id as string,
            title: post.title as string,
            content: post.content as string,
            contentPreview: this._buildPostContentPreview(post.content as string),
            createdAt: post.createdAt as string,
            updatedAt: post.updatedAt as string,
        };
    }

    private _isRawPostRecord(value: unknown): boolean {
        if (typeof value !== 'object' || value === null) {
            return false;
        }

        const post = value as Partial<IPost>;

        return typeof post.id === 'string'
            && typeof post.title === 'string'
            && typeof post.content === 'string'
            && typeof post.createdAt === 'string'
            && typeof post.updatedAt === 'string';
    }

    private _generateId(): string {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }

        return `${ Date.now() }-${ Math.random().toString(16).slice(2) }`;
    }

    private _buildPostContentPreview(fullContent: string): string {
        return fullContent.slice(0, POST_CONTENT_LIST_PREVIEW_LENGTH);
    }
}
