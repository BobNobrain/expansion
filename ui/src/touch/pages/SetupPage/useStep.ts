import { AccountSetupStep, setupRoute } from '@/routes/setup';
import { useNavigate, useParams } from '@solidjs/router';
import { createMemo, untrack } from 'solid-js';

export const stepSequence: AccountSetupStep[] = [
    AccountSetupStep.Career,
    AccountSetupStep.Location,
    AccountSetupStep.Name,
    AccountSetupStep.Logo,
    AccountSetupStep.Confirm,
];

export type SetStepOptions = {
    ignoreValidation?: boolean;
};

export type UseStepResult = {
    current: () => AccountSetupStep;
    currentIndex: () => number | undefined;
    next: () => AccountSetupStep | undefined;
    prev: () => AccountSetupStep | undefined;

    set: (newStep: AccountSetupStep, options?: SetStepOptions) => boolean;
    setIndex: (newIndex: number, options?: SetStepOptions) => boolean;
};

export function useStep(isStepFilled: Record<AccountSetupStep, (() => boolean) | undefined>): UseStepResult {
    const params = useParams();
    const navigate = useNavigate();

    const current = createMemo(() => setupRoute.parse(params).step);
    const currentIndex = createMemo(() => {
        const idx = stepSequence.indexOf(current());
        if (idx === -1) {
            return undefined;
        }
        return idx;
    });

    const prev = createMemo((): AccountSetupStep | undefined => {
        const idx = stepSequence.indexOf(current());
        if (idx === -1) {
            return stepSequence[0];
        }
        return stepSequence[idx - 1];
    });

    const next = createMemo((): AccountSetupStep | undefined => {
        const idx = stepSequence.indexOf(current());
        if (idx === -1) {
            return stepSequence[0];
        }
        return stepSequence[idx + 1];
    });

    const result: UseStepResult = {
        current,
        currentIndex,
        prev,
        next,
        set: (newStep, options = {}): boolean => {
            const oldStep = untrack(current);
            if (oldStep === newStep) {
                return true;
            }

            const ignoreValidation =
                options.ignoreValidation ?? stepSequence.indexOf(newStep) < stepSequence.indexOf(oldStep);

            console.log(ignoreValidation, stepSequence.indexOf(newStep), stepSequence.indexOf(oldStep));
            if (!ignoreValidation) {
                const validate = isStepFilled[oldStep];
                if (validate && !validate()) {
                    console.log('validation failed');
                    return false;
                }
            }

            navigate(setupRoute.render({ step: newStep }), { replace: true });
            return true;
        },
        setIndex: (newIndex, options) => {
            const step = stepSequence[newIndex];
            if (step === undefined) {
                return false;
            }

            return result.set(step, options);
        },
    };

    return result;
}
