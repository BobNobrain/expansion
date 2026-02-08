import { createFormFieldState, createValidator, useValidateAll } from '@/atoms';
import { createStore } from 'solid-js/store';
import { type CompanyLogo, type CompanyLogoElement, type TutorialCareer } from '@/domain/Company';
import { createMemo } from 'solid-js';

export type AccountSetupState = {
    name: string;
    location: string | null;
    career: TutorialCareer | null;
    logo: CompanyLogo;
};

export function createState() {
    const name = createFormFieldState('', {
        validator: (name) => {
            if (name.length < 4) {
                return { type: 'error', message: 'Must be at least 5 characters long' };
            }
            if (name.length > 50) {
                return { type: 'error', message: 'Must be at most 50 characters long' };
            }

            if (!/^[A-Za-z0-9+\-/&=%#$.' ]+$/.test(name)) {
                return {
                    type: 'error',
                    message:
                        "Name can only contain latin letters, digits, spaces, and following symbols: + - / & = % # $ . '",
                };
            }

            if (Array.from(name.matchAll(/[A-Za-z]/g)).length < 3) {
                return { type: 'error', message: 'Should contain at least 3 letters' };
            }
            if (name.length - Array.from(name.matchAll(/[A-Za-z0-9 ]/g)).length > 3) {
                return { type: 'error', message: 'Should not contain more than 3 punctuation symbols' };
            }

            return { type: 'ok' };
        },
    });

    const location = createFormFieldState<string | null>(null, {
        validator: (value) => {
            if (value === null) {
                return { type: 'error' };
            }

            return { type: 'ok' };
        },
    });
    const career = createFormFieldState<TutorialCareer | null>(null, {
        validator: (value) => {
            if (value === null) {
                return { type: 'error' };
            }

            return { type: 'ok' };
        },
    });

    const [logoStore, updateLogoStore] = createStore<Pick<CompanyLogo, 'elements'>>({ elements: [] });
    const logoElementsValidator = createValidator({
        signal: () => logoStore.elements,
        validate: (elements) => {
            if (elements.length < 2) {
                return { type: 'error', message: 'Must contain at least 2 elements' };
            }
            if (elements.length > 5) {
                return { type: 'error', message: 'Must contain at most 5 elements' };
            }

            if (elements.filter((el) => el.type === 'text').length > 2) {
                return { type: 'error', message: 'Cannot contain more than 2 text elements' };
            }

            if (new Set(elements.map((el) => el.c)).size > 4) {
                return { type: 'error', message: 'Cannot use more than 4 colors' };
            }

            return { type: 'ok' };
        },
    });

    const logoResult = createMemo((): CompanyLogo => {
        return {
            elements: logoStore.elements.map((el): CompanyLogoElement => {
                // normalizing to remove all potential extra fields
                switch (el.type) {
                    case 'ellipse':
                    case 'rect':
                        return { type: el.type, c: el.c, x: el.x, y: el.y, rx: el.rx, ry: el.ry };

                    case 'text':
                        return { type: el.type, c: el.c, x: el.x, y: el.y, text: el.text };

                    default:
                        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                        throw new Error(`unknown type ${el satisfies never}`);
                }
            }),
        };
    });

    const validateAll = useValidateAll([name, location, career, logoElementsValidator]);
    const validateAndGetResult = (): AccountSetupState | null => {
        if (!validateAll()) {
            return null;
        }

        return {
            name: name.get(),
            career: career.get()!,
            location: location.get()!,
            logo: logoResult(),
        };
    };

    return {
        name,
        location,
        career,
        logo: {
            state: logoStore,
            update: updateLogoStore,
            validate: logoElementsValidator.validate,
            validity: logoElementsValidator.validity,
            result: logoResult,
        },

        validateAndGetResult,
    };
}
