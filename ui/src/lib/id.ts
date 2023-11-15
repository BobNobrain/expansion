const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
const LEN = 16;

export function randomID(): string {
    const letters = new Array<string>(LEN).fill('');
    for (let i = 0; i < LEN; i++) {
        letters[i] = ALPHABET[Math.floor(Math.random() * LEN)];
    }
    return letters.join('');
}
