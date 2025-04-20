import { type ParentComponent } from 'solid-js';
import { A, type AnchorProps } from '@solidjs/router';
import styles from './DataTable.module.css';

export const DataTableCellLink: ParentComponent<AnchorProps> = (props) => {
    return <A {...props} class={styles.cellLink} />;
};
