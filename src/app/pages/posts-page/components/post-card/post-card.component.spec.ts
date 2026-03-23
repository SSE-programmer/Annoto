import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { IPost } from '@shared/services/http/posts-http/models';

describe('PostCardComponent', () => {
    let component: PostCardComponent;
    let fixture: ComponentFixture<PostCardComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PostCardComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(PostCardComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.componentRef.setInput('post', {
            id: '1',
            title: 'Test title',
            content: 'Test content',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } satisfies IPost);
        fixture.detectChanges();

        expect(component).toBeTruthy();
    });

    it('should render post title and content', () => {
        fixture.componentRef.setInput('post', {
            id: '2',
            title: 'Server authoritative model',
            content: 'Client does not decide final game state.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        } satisfies IPost);
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector('.article-card__title')?.textContent).toContain('Server authoritative model');
        expect(compiled.querySelector('.article-card__text')?.textContent).toContain('Client does not decide final game state.');
    });
});
