import { createMemo, Show, type Component } from 'solid-js';
import {
    HorizontalPane,
    HorizontalScroller,
    ProgressSteps,
    type ProgressStepData,
    type ProgressStepStatus,
    type ValidationState,
} from '@/atoms';
import type { TutorialCareer } from '@/domain/Company';
import { AccountSetupStep, setupRoute } from '@/routes/setup';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import {
    TouchFooterActionButton,
    TouchFooterActionLink,
    TouchFooterActions,
} from '@/touch/components/TouchFooterActions/TouchFooterActions';
import { usePageContextBinding } from '@/touch/components/TouchPage';
import { createState } from './state';
import { ASCareer, getCareerName } from './steps/ASCareer';
import { ASFinal } from './steps/ASFinal';
import { ASLocation } from './steps/ASLocation';
import { ASLogo } from './steps/ASLogo';
import { ASName } from './steps/ASName';
import styles from './SetupPage.module.css';
import { useStep, type UseStepResult } from './useStep';

const stepNames: Record<AccountSetupStep, string> = {
    [AccountSetupStep.Career]: 'Profession',
    [AccountSetupStep.Name]: 'Company Name',
    [AccountSetupStep.Logo]: 'Company Logo',
    [AccountSetupStep.Location]: 'Location',
    [AccountSetupStep.Confirm]: 'Confirmation',
};

const SetupPageFooter: Component<{ career: TutorialCareer | null; step: UseStepResult }> = (props) => {
    const step = props.step;

    const nextButtonText = createMemo(() => {
        switch (step.current()) {
            case AccountSetupStep.Career:
                return props.career ? `Continue with ${getCareerName(props.career)}` : 'Select to proceed';

            default:
                return 'Next';
        }
    });

    const nextButtonDisabled = createMemo(() => {
        switch (step.current()) {
            case AccountSetupStep.Career:
                return props.career === null;

            default:
                return false;
        }
    });

    return (
        <TouchFooterActions>
            <Show when={step.current() !== AccountSetupStep.Career}>
                <TouchFooterActionLink
                    href={setupRoute.render({ step: step.prev() })}
                    text="Back"
                    disabled={step.prev() === undefined}
                />
            </Show>
            <Show
                when={step.next() !== undefined}
                fallback={<TouchFooterActionButton text="Confirm" color="primary" />}
            >
                <TouchFooterActionButton
                    text={nextButtonText()}
                    disabled={nextButtonDisabled()}
                    color="semiprimary"
                    onClick={() => step.set(step.next()!)}
                />
            </Show>
        </TouchFooterActions>
    );
};

export const SetupPage: Component = () => {
    const formState = createState();

    const step = useStep({
        [AccountSetupStep.Career]: formState.career.validate,
        [AccountSetupStep.Location]: formState.location.validate,
        [AccountSetupStep.Name]: formState.name.validate,
        [AccountSetupStep.Logo]: formState.logo.validate,
        [AccountSetupStep.Confirm]: undefined,
    });

    usePageContextBinding(() => {
        return {
            title: 'Account Setup',
            subtitle: stepNames[step.current()],
            customFooter: () => <SetupPageFooter career={formState.career.get()} step={step} />,
        };
    });

    const progressSteps = createMemo((): ProgressStepData<AccountSetupStep>[] => {
        return [
            {
                value: AccountSetupStep.Career,
                status: getStatus(formState.career.validity(), formState.career.get() !== null),
            },
            {
                value: AccountSetupStep.Location,
                status: getStatus(formState.location.validity(), formState.location.get() !== null),
            },
            { value: AccountSetupStep.Name, status: getStatus(formState.name.validity(), formState.name.get() !== '') },
            {
                value: AccountSetupStep.Logo,
                status: getStatus(formState.logo.validity(), formState.logo.result().elements.length > 0),
            },
            { value: AccountSetupStep.Confirm, status: 'final' },
        ];
    });

    return (
        <TouchContentSingle fullHeight>
            <div class={styles.wrapper}>
                <div class={styles.progress}>
                    <ProgressSteps steps={progressSteps()} active={step.current()} />
                </div>
                <HorizontalScroller userScrollable scrollIndex={step.currentIndex()} onScrolled={step.setIndex}>
                    <HorizontalPane>
                        <ASCareer
                            career={formState.career.get()}
                            setCareer={formState.career.set}
                            onContinue={() => step.set(AccountSetupStep.Location)}
                        />
                    </HorizontalPane>
                    <HorizontalPane>
                        <ASLocation pickedId={formState.location.get()} onPick={formState.location.set} />
                    </HorizontalPane>
                    <HorizontalPane>
                        <ASName career={formState.career.get()} nameField={formState.name} />
                    </HorizontalPane>
                    <HorizontalPane>
                        <ASLogo name={formState.name.get()} logoField={formState.logo} />
                    </HorizontalPane>
                    <HorizontalPane>
                        <ASFinal
                            career={formState.career.get()}
                            location={formState.location.get()}
                            logo={formState.logo.result()}
                            name={formState.name.get()}
                        />
                    </HorizontalPane>
                </HorizontalScroller>
            </div>
        </TouchContentSingle>
    );
};

function getStatus(validity: ValidationState, hasBeenTouched: boolean): ProgressStepStatus {
    if (validity.type === 'error') {
        return 'error';
    }
    if (!hasBeenTouched) {
        return 'pending';
    }
    return 'done';
}
