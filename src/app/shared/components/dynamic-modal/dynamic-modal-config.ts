export class DynamicModalConfig<D = any> {
    public data: D = undefined as D;
    public modalName: string = '';
    public autoHeight?: boolean;
    public width?: string;
    public height?: string;
    public mediaQueries?: IMediaQuery[];
    public onCloseCallback?: ((closeModal: (value: boolean) => any) => any) | null | undefined;
}

export interface IMediaQuery {
    query: string;
    width?: string;
    height?: string;
}
