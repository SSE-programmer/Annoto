import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePostModalComponent, IConfig } from './create-post-modal.component';
import { DynamicModalConfig } from '@shared/components/dynamic-modal/dynamic-modal-config';

describe('CreatePostModalComponent', () => {
    let component: CreatePostModalComponent;
    let fixture: ComponentFixture<CreatePostModalComponent>;

    beforeEach(async () => {
        const modalConfig = new DynamicModalConfig<IConfig>();
        modalConfig.modalName = 'CreatePostModalComponentTest';
        modalConfig.data = {};

        await TestBed.configureTestingModule({
            imports: [CreatePostModalComponent],
            providers: [
                { provide: DynamicModalConfig, useValue: modalConfig },
            ],
        })
            .compileComponents();

        fixture = TestBed.createComponent(CreatePostModalComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
