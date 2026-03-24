import { FormControl, FormGroup, Validators } from '@angular/forms';
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
        content: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(5000)]}),
    });

    if (post) {
        form.patchValue(post);
    }

    return form;
}
