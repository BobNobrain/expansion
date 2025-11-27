export type SemanticColor = 'primary' | 'secondary' | 'info' | 'error' | 'success' | 'warn' | 'accent';

export type PaddingSide = boolean | PaddingSideNormalized;
export type PaddingSideNormalized = 'h' | 'v' | 'both' | 'none';
export const normalizePaddingSideValue = (value: PaddingSide | undefined): PaddingSideNormalized => {
    if (typeof value === 'string') {
        return value;
    }

    return value ? 'both' : 'none';
};
