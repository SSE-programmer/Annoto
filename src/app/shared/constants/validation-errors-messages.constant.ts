export const VALIDATION_ERRORS_MESSAGES: Record<string, string | ((...args: any[]) => string)> = {
    min: (params: { min: number, actual: number }) => {
        return `Минимальное допустимое значение ${params.min}`;
    },
    max: (params: { max: number, actual: number }) => {
        return `Максимальное допустимое значение ${params.max}`;
    },
    required: 'Обязательное поле',
    email: 'Недопустимый формат email',
    minlength: (params: { requiredLength: number, actualLength: number }) => {
        return `Минимальное допустимое количество символов ${params.requiredLength} (введено ${params.actualLength})`;
    },
    maxlength: (params: { requiredLength: number, actualLength: number }) => {
        return `Максимальное допустимое количество символов ${params.requiredLength} (введено ${params.actualLength})`;
    },
    pattern: (params: { requiredPattern: string, actualValue: any }) => {
        return `Значение не соответствует шаблону ${params.requiredPattern}`;
    },
    general: 'Некорректное значение'
};
