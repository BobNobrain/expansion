import { type ParentComponent } from 'solid-js';
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

export const PageHeaderSuperscript: ParentComponent = (props) => {
    return <Text color="dim">{props.children}</Text>;
};
