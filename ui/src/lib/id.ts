export type FormatNumericIdOptions = {
    prefix?: string;
    length?: number;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALEN = ALPHABET.length;
const MSRN = 47;

export function formatNumericId(id: number, { prefix = '', length = 7 }: FormatNumericIdOptions = {}): string {
    const digits = new Array<string>(length);

    let remainder = id;
    for (let i = length - 1; i >= 0; i--) {
        const randomOffset = MSRN * i + id;
        const digit = remainder % ALEN;
        const letter = ALPHABET[(randomOffset + digit) % ALEN];

        digits[i] = letter;
        remainder -= digit;
        remainder /= ALEN;
    }

    return prefix + digits.join('');
}
