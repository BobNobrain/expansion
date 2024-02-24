import { createSignal, type Component } from 'solid-js';
import type * as api from '../../../lib/net/api';
import { Button } from '../../Button/Button';
import { Form, FormActions, FormField } from '../../Form';
import { Text } from '../../Text/Text';
import { TextInput } from '../../TextInput/TextInput';
import styles from './LogInForm.module.css';

export type LogInFormProps = {
    loading: boolean;
    onSubmit: (creds: api.LoginRequest) => void;
};

export const LogInForm: Component<LogInFormProps> = (props) => {
    const [getUsername, setUsername] = createSignal('');
    const [getPassword, setPassword] = createSignal('');

    const login = () => {
        props.onSubmit({
            username: getUsername(),
            password: getPassword(),
        });
    };

    return (
        <div class={styles.back}>
            <div class={styles.content}>
                <header class={styles.header}>
                    <Text size="h1" bold>
                        Log In
                    </Text>
                </header>
                <Form loading={props.loading}>
                    <FormField label="Username">
                        <TextInput value={getUsername()} onUpdate={setUsername} />
                    </FormField>
                    <FormField label="Password">
                        <TextInput value={getPassword()} onUpdate={setPassword} password />
                    </FormField>
                    <FormActions>
                        <Button color="primary" leftWing="up" rightWing="none" onClick={login} loading={props.loading}>
                            Log In
                        </Button>
                    </FormActions>
                </Form>

                <footer class={styles.footer}>BOTTOM TEXT</footer>
            </div>
        </div>
    );
};
