import { createSignal, type Component } from 'solid-js';
import type * as api from '../../../lib/net/api';
import { Button } from '../../Button/Button';
import { Form, FormActions, FormField } from '../../Form';
import { TextInput } from '../../TextInput/TextInput';
import styles from './LogInForm.module.css';
import { FormHeader } from '../../Form/FormHeader/FormHeader';

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
                <Form loading={props.loading}>
                    <FormHeader>Log In</FormHeader>
                    <FormField>
                        <TextInput label="Username" value={getUsername()} onUpdate={setUsername} />
                    </FormField>
                    <FormField>
                        <TextInput label="Password" value={getPassword()} onUpdate={setPassword} password />
                    </FormField>
                    <FormActions>
                        <Button color="secondary" loading={props.loading} style="text">
                            Forgot Password?
                        </Button>
                        <Button color="primary" onClick={login} loading={props.loading}>
                            Log In
                        </Button>
                    </FormActions>
                </Form>
            </div>
        </div>
    );
};
