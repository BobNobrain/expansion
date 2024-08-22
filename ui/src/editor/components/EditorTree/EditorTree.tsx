import { For, Show, createSignal, type Component } from 'solid-js';
import { Button } from '../../../components/Button/Button';
import type { FileTreeEntry } from '../../../lib/net/editorapi.generated';
import { useEditorTree } from '../../../store/editor';
import styles from './EditorTree.module.css';
import { IconCross } from '../../../icons/cross';
import { IconText } from '../../../icons/text';
import { IconCopy } from '../../../icons/copy';

type TreeEntryProps = {
    entry: FileTreeEntry;
    parentPath: string;
    activeFullPath: string | null;
    onOpen: (fullPath: string) => void;
};

const TreeDirectory: Component<TreeEntryProps> = (props) => {
    const [isCollapsed, setIsCollapsed] = createSignal(false);

    const fullPath = () => [props.parentPath, props.entry.name].filter(Boolean).join('/');
    const isActive = () => fullPath() === props.activeFullPath;

    const onClick = () => {
        if (props.entry.isDir) {
            setIsCollapsed((v) => !v);
            return;
        }

        props.onOpen(fullPath());
    };

    return (
        <div class={styles.item}>
            <div class={styles.row} classList={{ [styles.active]: isActive() }} onClick={onClick}>
                <Show when={props.entry.isDir} fallback={<div class={styles.name}>{props.entry.name}</div>}>
                    <div class={styles.name}>
                        {props.entry.name}/
                        <Show when={isCollapsed()}>
                            <span class={styles.collapsedHint}>+{props.entry.children.length} entries</span>
                        </Show>
                    </div>
                </Show>
                <div class={styles.itemActions}>
                    <Button size="s" style="text" square>
                        <IconText size={12} />
                    </Button>
                    <Show when={!props.entry.isDir}>
                        <Button size="s" style="text" square>
                            <IconCopy size={12} />
                        </Button>
                    </Show>
                    <Show when={props.entry.children.length === 0}>
                        <Button size="s" color="error" style="text" square>
                            <IconCross size={12} />
                        </Button>
                    </Show>
                </div>
            </div>
            <Show when={props.entry.children.length && !isCollapsed()}>
                <div class={styles.children}>
                    <For each={props.entry.children}>
                        {(child) => {
                            return (
                                <TreeDirectory
                                    entry={child}
                                    parentPath={fullPath()}
                                    activeFullPath={props.activeFullPath}
                                    onOpen={props.onOpen}
                                />
                            );
                        }}
                    </For>
                </div>
            </Show>
        </div>
    );
};

export type EditorTreeProps = {
    activeFullPath: string | null;
    onOpen: (fullPath: string) => void;
};

export const EditorTree: Component<EditorTreeProps> = (props) => {
    const tree = useEditorTree();

    return (
        <div class={styles.wrapper}>
            <div class={styles.tree}>
                <Show when={tree.data} fallback={<div class={styles.empty}>Empty</div>}>
                    <TreeDirectory
                        entry={tree.data!.root}
                        parentPath=""
                        activeFullPath={props.activeFullPath}
                        onOpen={props.onOpen}
                    />
                </Show>
            </div>
            <div class={styles.status}>
                <div class={styles.statusLabel}>
                    <Show when={tree.isLoading}>Loading...</Show>
                    <Show when={tree.data}>{tree.data!.total} files</Show>
                </div>
                <div class={styles.statusActions}>
                    <Button rightWing="none">Refresh</Button>
                </div>
            </div>
        </div>
    );
};
