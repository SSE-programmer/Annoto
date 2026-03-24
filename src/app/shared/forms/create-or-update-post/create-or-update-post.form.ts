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
        id: new FormControl('', { nonNullable: true }),
        title: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
        content: new FormControl('', {
            nonNullable: true,
            validators: [Validators.maxLength(POST_CONTENT_MAX_LENGTH)],
        }),
    });

    if (post) {
        form.patchValue(post);
    }

    return form;
}
