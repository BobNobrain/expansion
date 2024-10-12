import { type JSX, type ParentProps, For } from 'solid-js';
import styles from './DataTable.module.css';

export type DataTableColumn<Row> = {
    header: JSX.Element;
    width?: number | string;
    content: keyof Row | ((row: Row) => JSX.Element);
};

export type DataTableProps<Row> = {
    columns: DataTableColumn<Row>[];
    rows: Row[];

    /** Use this for better appearance when the table stretches for the whole screen */
    inset?: boolean;
};

export function DataTable<Row>(props: ParentProps<DataTableProps<Row>>): JSX.Element {
    return (
        <table class={styles.table} classList={{ [styles.inset]: props.inset }}>
            <thead>
                <tr class={styles.headerRow}>
                    <For each={props.columns}>
                        {(column) => {
                            const width = typeof column.width === 'number' ? column.width + 'px' : column.width;

                            return (
                                <th class={styles.headerCell} style={{ width }}>
                                    {column.header}
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
                        return (
                            <tr class={styles.dataRow}>
                                <For each={props.columns}>
                                    {(column) => {
                                        const cellContent: JSX.Element =
                                            typeof column.content === 'function'
                                                ? column.content(row)
                                                : (row[column.content] as JSX.Element);

                                        return <td class={styles.dataCell}>{cellContent}</td>;
                                    }}
                                </For>
                            </tr>
                        );
                    }}
                </For>
            </tbody>
        </table>
    );
}
