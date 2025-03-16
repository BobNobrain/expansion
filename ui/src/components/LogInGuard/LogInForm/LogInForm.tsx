import { createMemo, type Component } from 'solid-js';
import { type DatafrontError } from '../../../lib/datafront/types';
import type * as api from '../../../lib/net/api';
import { Button } from '../../Button/Button';
import { Form, FormActions, FormField, type ValidationState, FormHeader } from '../../Form';
import { createFormFieldState, useValidateAll } from '../../Form/utils';
import { TextInput } from '../../TextInput/TextInput';
import styles from './LogInForm.module.css';

export type LogInFormProps = {
    loading: boolean;
    error: DatafrontError | null;
    onSubmit: (creds: api.LoginRequest) => void;
};

export const LogInForm: Component<LogInFormProps> = (props) => {
    const username = createFormFieldState('', {
        validator: (value) =>
            value.length < 3 ? { type: 'error', message: 'Please enter a valid username' } : { type: 'ok' },
    });
    const password = createFormFieldState('', {
        validator: (value) => (value.length ? { type: 'ok' } : { type: 'error', message: 'Please enter a password' }),
    });
    const validateForm = useValidateAll([username, password]);

    const onSubmit = () => {
        if (!validateForm()) {
            return;
        }

        props.onSubmit({
            username: username.get(),
            password: password.get(),
        });
    };

    const externalValidity = createMemo<ValidationState | undefined>(() => {
        if (!props.error) {
            return undefined;
        }

        return {
            type: 'error',
            message: props.error.message,
        };
    });

    return (
        <div class={styles.content}>
            <Form loading={props.loading} onSubmit={onSubmit}>
                <FormHeader>Log In</FormHeader>
                <FormField>
                    <TextInput
                        label="Username"
                        value={username.get()}
                        onUpdate={username.set}
                        validity={externalValidity() ?? username.validity()}
                        onBlur={username.validate}
                    />
                </FormField>
                <FormField>
                    <TextInput
                        label="Password"
                        value={password.get()}
                        onUpdate={password.set}
                        validity={password.validity()}
                        onBlur={password.validate}
                        password
                    />
                </FormField>
                <FormActions>
                    <Button color="secondary" loading={props.loading} style="text">
                        Forgot Password?
                    </Button>
                    <Button color="primary" type="submit" loading={props.loading}>
                        Log In
                    </Button>
                </FormActions>
            </Form>
        </div>
    );
};
