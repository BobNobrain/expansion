import { type Component, Show, type ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon } from '../../icons';
import { Text } from '../Text/Text';
import styles from './PageHeader.module.css';

export const PageHeader: ParentComponent = (props) => {
    return <header class={styles.header}>{props.children}</header>;
};

export const PageHeaderTitle: ParentComponent = (props) => {
    return (
        <Text size="h2" color="primary">
            {props.children}
        </Text>
    );
};

export type PageHeaderIconProps = {
    icon: Icon;
    text?: string;
};
export const PageHeaderIcon: Component<PageHeaderIconProps> = (props) => {
    return (
        <div class={styles.iconWrapper}>
            <Dynamic component={props.icon} size={20} />
            <Show when={props.text}>
                <span class={styles.iconText}>{props.text}</span>
            </Show>
        </div>
    );
};

export type PageHeaderActionsProps = {
    pushRight?: boolean;
};

export const PageHeaderActions: ParentComponent<PageHeaderActionsProps> = (props) => {
    return (
        <div class={styles.actions} classList={{ [styles.pushRight]: props.pushRight }}>
            {props.children}
        </div>
    );
};
