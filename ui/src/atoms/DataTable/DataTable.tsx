import { type JSX, type ParentProps, type Component, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon } from '@/icons';
import styles from './DataTable.module.css';

export type DataTableColumn<Row> = {
    header?: JSX.Element | { icon?: Icon; text?: string };
    width?: number | string;
    content: keyof Row | ((row: Row) => JSX.Element);
    align?: 'left' | 'right' | 'center';
    noPadding?: boolean;

    onCellClick?: (row: Row, ev: MouseEvent) => void;
};

export type DataTableProps<Row> = {
    columns: DataTableColumn<Row>[];
    rows: Row[];
    defaultColumnWidth?: number;

    /** Use this for better appearance when the table stretches for the whole screen */
    inset?: boolean;
    stickLeft?: boolean;
    stickRight?: boolean;

    onRowClick?: (row: Row, ev: MouseEvent) => void;
};

const DefaultHeader: Component<{ icon?: Icon; text?: string }> = (props) => {
    return (
        <div class={styles.defaultHeader}>
            <Show when={props.icon}>
                <Dynamic component={props.icon} size={24} />
            </Show>
            <Show when={props.text}>
                <span class={styles.headerCellText}>{props.text}</span>
            </Show>
        </div>
    );
};

export function DataTable<Row>(props: ParentProps<DataTableProps<Row>>): JSX.Element {
    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles.inset]: props.inset,
                [styles.hasScroll]: props.stickLeft || props.stickRight,
            }}
        >
            <table
                class={styles.table}
                classList={{
                    [styles.stickLeft]: props.stickLeft,
                    [styles.stickRight]: props.stickRight,
                }}
            >
                <thead>
                    <tr class={styles.headerRow}>
                        <For each={props.columns}>
                            {(column) => {
                                const widthInPx = column.width ?? props.defaultColumnWidth;
                                const width = typeof widthInPx === 'number' ? widthInPx + 'px' : widthInPx;

                                let header: JSX.Element | null = null;

                                if (column.header) {
                                    if (
                                        typeof column.header === 'object' &&
                                        ('icon' in column.header || 'text' in column.header)
                                    ) {
                                        header = <DefaultHeader icon={column.header.icon} text={column.header.text} />;
                                    } else {
                                        header = column.header as JSX.Element;
                                    }
                                }

                                return (
                                    <th class={styles.headerCell} style={{ 'min-width': width, width }}>
                                        {header}
                                    </th>
                                );
                            }}
                        </For>
                    </tr>
                </thead>
                <tbody>
                    <For
                        each={props.rows}
                        fallback={
                            <tr class={styles.emptyRow}>
                                <td colspan={props.columns.length} class={styles.emptyCell}>
                                    {props.children ?? <div class={styles.emptyBanner}>No data</div>}
                                </td>
                            </tr>
                        }
                    >
                        {(row) => {
                            const onClick = (ev: MouseEvent) => {
                                props.onRowClick?.(row, ev);
                            };
                            return (
                                <tr class={styles.dataRow} onClick={onClick}>
                                    <For each={props.columns}>
                                        {(column) => {
                                            const cellContent: JSX.Element =
                                                typeof column.content === 'function'
                                                    ? column.content(row)
                                                    : (row[column.content] as JSX.Element);

                                            let align = styles.alignLeft;
                                            switch (column.align) {
                                                case 'center':
                                                    align = styles.alignCenter;
                                                    break;
                                                case 'right':
                                                    align = styles.alignRight;
                                                    break;
                                            }

                                            return (
                                                <td
                                                    class={styles.dataCell}
                                                    classList={{
                                                        [align]: true,
                                                        [styles.noPadding]: column.noPadding,
                                                    }}
                                                    onClick={
                                                        column.onCellClick
                                                            ? (ev) => column.onCellClick!(row, ev)
                                                            : undefined
                                                    }
                                                >
                                                    {cellContent}
                                                </td>
                                            );
                                        }}
                                    </For>
                                </tr>
                            );
                        }}
                    </For>
                </tbody>
            </table>
        </div>
    );
}
