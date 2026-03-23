import { IPost } from '@shared/services/http/posts-http/models/IPost';

export interface IUpdatePostDto extends Pick<IPost, 'id' | 'title' | 'content'>{}
