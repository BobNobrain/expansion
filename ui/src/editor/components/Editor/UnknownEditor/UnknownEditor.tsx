import { createSignal, type Component, onCleanup, untrack } from 'solid-js';
import { type StringSchema } from '../../../../lib/jsonschema';
import { registerInFormContext, useValidationState } from '../../../../components/Form';
import { type EditorComponentProps } from '../types';
import styles from './UnknownEditor.module.css';

export type UnknownEditorProps = EditorComponentProps<StringSchema>;

export const UnknownEditor: Component<UnknownEditorProps> = (props) => {
    const [getJSON, setJSON] = createSignal(props.initialValue === undefined ? '' : JSON.stringify(props.initialValue));
    const validity = useValidationState();

    const onInput = (ev: InputEvent) => {
        const json = (ev.target as HTMLInputElement).value;
        try {
            JSON.parse(json);
            validity.setOk();
        } catch (error) {
            validity.setError((error as Error).message);
        }
        setJSON(json);
    };

    props.controller?.({
        preview: () => {
            const value = untrack(getJSON);
            return value;
        },
    });
    onCleanup(() => {
        props.controller?.(null);
    });

    registerInFormContext(
        { formKey: props.key },
        {
            retrieveValue: () => JSON.parse(untrack(getJSON)) as unknown,
            validate: () => {
                try {
                    JSON.parse(untrack(getJSON));
                    validity.setOk();
                    return true;
                } catch (error) {
                    validity.setError((error as Error).message);
                    return false;
                }
            },
        },
    );

    return (
        <div class={styles.wrapper}>
            <textarea
                value={getJSON()}
                onInput={onInput}
                placeholder={String(props.schema.default) || props.schema.title}
                disabled={props.disabled || props.key === '$schema'}
                class={styles.textarea}
            />
            <div class={styles.error}>{validity.getErrorMessage()}</div>
        </div>
    );
};
