export interface IAnnotation {
    id: string;
    text: string;
    color: AnnotationColor;
    startPath: string;
    startOffset: number;
    endPath: string;
    endOffset: number;
}

export type AnnotationColor = string;
