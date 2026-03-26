import { FormControl, FormGroup, Validators } from '@angular/forms';
import { POST_CONTENT_MAX_LENGTH } from '@shared/constants/post-content.constants';
import { IPost } from '@shared/services/http/posts-http/models';

export interface ICreateOrUpdatePostForm {
    id: FormControl<string>;
    title: FormControl<string>;
    content: FormControl<string>;
}

export function getCreateOrUpdatePostForm(post?: IPost): FormGroup<ICreateOrUpdatePostForm> {
    const form = new FormGroup<ICreateOrUpdatePostForm>({
        id: new FormControl(post?.id ?? '', { nonNullable: true }),
        title: new FormControl(post?.title ?? '', {
            nonNullable: true,
            validators: [Validators.required, Validators.maxLength(100)]
        }),
        content: new FormControl(post?.content ?? '', {
            nonNullable: true,
            validators: [Validators.maxLength(POST_CONTENT_MAX_LENGTH)],
        }),
    });

    return form;
}
