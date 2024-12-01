import { A } from '@solidjs/router';
import { type Component } from 'solid-js';
import { IconChevronRight } from '../../../icons';
import styles from './DataTableActionCell.module.css';

export type DataTableActionCellProps = {
    href: string;
};

export const DataTableActionCell: Component<DataTableActionCellProps> = (props) => {
    return (
        <A href={props.href} class={styles.link}>
            <IconChevronRight />
        </A>
    );
};
