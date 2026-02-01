import { Button, Container } from '@/atoms';
import type { ParentComponent } from 'solid-js';

export type ConfirmationFormProps = {
    confirmText?: string;
    confirmColor?: 'primary' | 'error';
    onConfirm: () => void;
    cancelText?: string;
    onCancel: () => void;
    isLoading?: boolean;
};

export const ConfirmationForm: ParentComponent<ConfirmationFormProps> = (props) => {
    return (
        <>
            {props.children}
            <Container primaryAlignment="end" padded="v" direction="row" hasGap>
                <Button loading={props.isLoading} onClick={props.onCancel}>
                    {props.cancelText ?? 'Cancel'}
                </Button>
                <Button loading={props.isLoading} color={props.confirmColor ?? 'primary'} onClick={props.onConfirm}>
                    {props.confirmText ?? 'Continue'}
                </Button>
            </Container>
        </>
    );
};
