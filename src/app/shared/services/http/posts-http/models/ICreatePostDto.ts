import { IPost } from '@shared/services/http/posts-http/models/IPost';

export interface ICreatePostDto extends Pick<IPost, 'title' | 'content'>{}
