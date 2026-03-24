export interface IPost {
    id: string;
    title: string;
    content: string;
    contentPreview: string;
    createdAt: string;
    updatedAt: string;
}

export type IPostSummary = Omit<IPost, 'content'>;
