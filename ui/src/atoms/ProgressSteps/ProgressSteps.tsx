import { createMemo, Index, type Component, type JSX } from 'solid-js';
import { IconChevronRight, IconCross, IconTick } from '@/icons';
import styles from './ProgressSteps.module.css';

export type ProgressStepStatus = 'pending' | 'error' | 'done' | 'final';

export type ProgressStepData<T> = {
    value: T;
    status: ProgressStepStatus;
    name?: string;
};

export type ProgressStepsProps<T> = {
    steps: ProgressStepData<T>[];
    active: T;
};

const classesByStatus: Record<ProgressStepStatus, string> = {
    done: styles.done,
    error: styles.error,
    pending: styles.pending,
    final: styles.pending,
};

const Step: Component<{ status: ProgressStepStatus; active: boolean }> = (props) => {
    const icon = createMemo((): JSX.Element => {
        // if (props.active) {
        //     return null;
        // }

        switch (props.status) {
            case 'done':
                return <IconTick size={12} block />;
            case 'error':
                return <IconCross size={12} block />;
            case 'pending':
                return <IconChevronRight size={12} block />;
            case 'final':
                return <IconTick size={12} block />;
        }
    });

    return (
        <div
            class={styles.step}
            classList={{
                [classesByStatus[props.status]]: true,
                [styles.active]: props.active,
            }}
        >
            {icon()}
        </div>
    );
};

export function ProgressSteps<T>(props: ProgressStepsProps<T>) {
    return (
        <div class={styles.wrapper}>
            <Index each={props.steps}>
                {(step) => {
                    return <Step status={step().status} active={step().value === props.active} />;
                }}
            </Index>
        </div>
    );
}
