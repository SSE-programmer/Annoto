import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { vi } from 'vitest';
import {
    POST_CONTENT_LIST_PREVIEW_LENGTH,
    POST_CONTENT_MAX_LENGTH,
} from '@shared/constants/post-content.constants';
import { PostsHttpService } from './posts-http.service';
import { IPost, IPostSummary } from './models';

describe('PostsHttpService', () => {
    let service: PostsHttpService;
    const storage: Record<string, string> = {};
    const STORAGE_POSTS_KEY = 'posts:collection';

    beforeEach(() => {
        Object.keys(storage).forEach(key => delete storage[key]);

        vi.spyOn(Math, 'random').mockReturnValue(0);
        const localStorageMock = {
            getItem: (key: string) => storage[key] ?? null,
            setItem: (key: string, value: string) => {
                storage[key] = value;
            },
            removeItem: (key: string) => {
                delete storage[key];
            },
            clear: () => {
                Object.keys(storage).forEach(key => delete storage[key]);
            },
            key: (index: number) => Object.keys(storage)[index] ?? null,
            get length() {
                return Object.keys(storage).length;
            },
        } satisfies Storage;

        Object.defineProperty(globalThis, 'localStorage', {
            value: localStorageMock,
            configurable: true,
        });

        TestBed.configureTestingModule({});
        service = TestBed.inject(PostsHttpService);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns empty array when storage is empty', async () => {
        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toEqual([]);
    });

    it('creates post with trimmed fields, contentPreview and persists it', async () => {
        const createdPost = await firstValueFrom(service.createPost({
            title: '  New title  ',
            content: '  New content  ',
        }));

        expect(createdPost.id).toBeTruthy();
        expect(createdPost.title).toBe('New title');
        expect(createdPost.content).toBe('New content');
        expect(createdPost.contentPreview).toBe('New content');
        expect(createdPost.createdAt).toBeTruthy();
        expect(createdPost.updatedAt).toBeTruthy();

        const posts = await firstValueFrom(service.getPosts());
        expect(posts).toHaveLength(1);
        const listItem = posts[0] as IPostSummary & { content?: string };
        expect(listItem.title).toBe('New title');
        expect(listItem.contentPreview).toBe('New content');
        expect(listItem.content).toBeUndefined();
    });

    it('getPosts returns summaries without full content', async () => {
        const full: IPost = {
            id: 'post-1',
            title: 'T',
            content: 'Full body text here',
            contentPreview: 'Full body text here',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([full]);

        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toEqual([
            {
                id: 'post-1',
                title: 'T',
                contentPreview: 'Full body text here',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
        ]);
    });

    it('truncates contentPreview to POST_CONTENT_LIST_PREVIEW_LENGTH on create', async () => {
        const longContent = 'x'.repeat(POST_CONTENT_MAX_LENGTH + 50);
        const createdPost = await firstValueFrom(service.createPost({
            title: 'Long',
            content: longContent,
        }));

        expect(createdPost.content.length).toBe(POST_CONTENT_MAX_LENGTH + 50);
        expect(createdPost.contentPreview.length).toBe(POST_CONTENT_LIST_PREVIEW_LENGTH);
        expect(createdPost.contentPreview).toBe('x'.repeat(POST_CONTENT_LIST_PREVIEW_LENGTH));
    });

    it('returns post by id when it exists', async () => {
        const seededPost: IPost = {
            id: 'post-1',
            title: 'Seed title',
            content: 'Seed content',
            contentPreview: 'Seed content',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([seededPost]);

        const post = await firstValueFrom(service.getPostById('post-1'));

        expect(post).toEqual(seededPost);
    });

    it('normalizes legacy storage rows without contentPreview field', async () => {
        storage[STORAGE_POSTS_KEY] = JSON.stringify([
            {
                id: 'legacy-1',
                title: 'Legacy',
                content: 'Hello legacy',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
        ]);

        const full = await firstValueFrom(service.getPostById('legacy-1'));
        expect(full.contentPreview).toBe('Hello legacy');

        const list = await firstValueFrom(service.getPosts());
        expect(list[0].contentPreview).toBe('Hello legacy');
    });

    it('throws when post by id is missing', async () => {
        await expect(firstValueFrom(service.getPostById('missing-id')))
            .rejects
            .toThrow('was not found');
    });

    it('updates post fields, contentPreview and refreshes updatedAt', async () => {
        const seededPost: IPost = {
            id: 'post-1',
            title: 'Initial title',
            content: 'Initial content',
            contentPreview: 'Initial content',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([seededPost]);

        const updatedPost = await firstValueFrom(service.updatePost('post-1', {
            id: 'post-1',
            title: '  Updated title  ',
            content: '  Updated content  ',
        }));

        expect(updatedPost.title).toBe('Updated title');
        expect(updatedPost.content).toBe('Updated content');
        expect(updatedPost.contentPreview).toBe('Updated content');
        expect(updatedPost.createdAt).toBe('2026-01-01T10:00:00.000Z');
        expect(updatedPost.updatedAt).not.toBe('2026-01-01T10:00:00.000Z');
    });

    it('deletes post by id', async () => {
        const firstPost: IPost = {
            id: 'post-1',
            title: 'One',
            content: 'First',
            contentPreview: 'First',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        const secondPost: IPost = {
            id: 'post-2',
            title: 'Two',
            content: 'Second',
            contentPreview: 'Second',
            createdAt: '2026-01-01T10:00:00.000Z',
            updatedAt: '2026-01-01T10:00:00.000Z',
        };
        storage[STORAGE_POSTS_KEY] = JSON.stringify([firstPost, secondPost]);

        await firstValueFrom(service.deletePost('post-1'));

        const posts = await firstValueFrom(service.getPosts());
        expect(posts).toEqual([
            {
                id: 'post-2',
                title: 'Two',
                contentPreview: 'Second',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
        ]);
    });

    it('returns empty list for invalid storage payload', async () => {
        storage[STORAGE_POSTS_KEY] = '{invalid-json';

        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toEqual([]);
    });

    it('filters out invalid post records from storage array', async () => {
        storage[STORAGE_POSTS_KEY] = JSON.stringify([
            {
                id: 'post-1',
                title: 'Valid',
                content: 'Record',
                createdAt: '2026-01-01T10:00:00.000Z',
                updatedAt: '2026-01-01T10:00:00.000Z',
            },
            {
                id: 'post-2',
                title: 'Broken',
            }
        ]);

        const posts = await firstValueFrom(service.getPosts());

        expect(posts).toHaveLength(1);
        expect(posts[0].id).toBe('post-1');
        expect(posts[0].contentPreview).toBe('Record');
    });
});
