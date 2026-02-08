import type { CompanyLogoElement } from '@/domain/Company';
import { LOGO_PALETTE } from './palette';

export function randomLogoElements(name: string) {
    const hue = 1 + Math.floor(Math.random() * 3);
    const shape = Math.random() < 0.5 ? 'rect' : 'ellipse';

    const elements: CompanyLogoElement[] = [];
    elements.push({
        type: shape,
        x: 0,
        y: 0,
        c: LOGO_PALETTE[hue * 3 + 1],
        rx: 100,
        ry: 50 + Math.floor(Math.random() * 2) * 10,
    });

    const text =
        name.length < 15
            ? name
            : name
                  .split(' ')
                  .map((word) => word[0].toLocaleUpperCase())
                  .filter((letter) => /[A-Za-z]/.test(letter))
                  .join('');

    if (text) {
        elements.push({ type: 'text', x: 0, y: 0, c: LOGO_PALETTE[hue * 3 + 2], text });
    }

    if (Math.random() < 0.3) {
        elements.push({
            type: Math.random() < 0.5 ? 'rect' : 'ellipse',
            x: Math.random() < 0.5 ? -50 : 50,
            y: Math.random() < 0.5 ? -50 : 50,
            c: LOGO_PALETTE[Math.floor(Math.random() * LOGO_PALETTE.length)],
            rx: 20,
            ry: 20,
        });
    }

    return elements;
}
