import { createEffect, createMemo, createSignal, For, onCleanup, type Component, type JSX } from 'solid-js';
import { Button, List, ListItem, ListItemContent, PageHeader, PageHeaderActions, PageHeaderTitle } from '@/atoms';
import type { CompanyLogoElement } from '@/domain/Company';
import { IconCog, IconContext, IconDice, IconPlus, IconTrashBin } from '@/icons';
import { useModalRouteState } from '@/routes/modals'; // TODO: bad import
import { TouchBottomSheet } from '@/touch/components/TouchBottomSheet/TouchBottomSheet'; // TODO: bad import
import { ElementEditor } from './ElementEditor';
import { LogoEditorPalette } from './LogoEditorPalette';
import { LogoListItem } from './LogoListItem';
import { randomLogoElements } from './random';
import { TouchModal } from '@/touch/components/TouchModal';
import { LOGO_PALETTE } from './palette';
// import styles from './LogoEditor.module.css';

export type LogoEditorController = {
    resetSelection: () => void;
};

export type LogoEditorProps = {
    title?: JSX.Element;
    companyName?: string | null;
    elements: CompanyLogoElement[];
    onUpdate: (index: number, patch: Partial<CompanyLogoElement>) => void;
    onRemove: (index: number) => void;
    onAppend: (el: CompanyLogoElement) => void;
    onReplaceAll: (el: CompanyLogoElement[]) => void;
    onSwap: (i1: number, i2: number) => void;

    showRulers: boolean;
    onToggleRulers: () => void;

    controllerRef?: (c: LogoEditorController | null) => void;
};

export const LogoEditor: Component<LogoEditorProps> = (props) => {
    const [selectedIndex, setSelectedIndex] = createSignal(-1);
    const selectedElement = createMemo(() => {
        const index = selectedIndex();
        if (index === -1) {
            return null;
        }

        return props.elements[index];
    });

    const genRandomLogo = () => {
        props.onReplaceAll(randomLogoElements(props.companyName ?? ''));
    };

    const paletteSheet = useModalRouteState('palette');
    const settingsSheet = useModalRouteState('elementSettings');
    const addModal = useModalRouteState('addElement');

    createEffect(() => {
        props.controllerRef?.({
            resetSelection: () => setSelectedIndex(-1),
        });

        onCleanup(() => {
            props.controllerRef?.(null);
        });
    });

    const onAdd = (type: CompanyLogoElement['type']) => {
        const c = LOGO_PALETTE[Math.floor(Math.random() * LOGO_PALETTE.length)];
        switch (type) {
            case 'ellipse':
            case 'rect':
                props.onAppend({
                    type,
                    c,
                    x: 0,
                    y: 0,
                    rx: 50,
                    ry: 50,
                });
                break;

            case 'text':
                props.onAppend({ type, c, x: 0, y: 0, text: 'Label' });
                break;
        }

        addModal.close();

        setTimeout(() => {
            setSelectedIndex(props.elements.length - 1);
        }, 0);
        setTimeout(() => {
            settingsSheet.open();
        }, 10);
    };

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Logo</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button
                        square
                        style="light"
                        onClick={genRandomLogo}
                        disabled={selectedIndex() !== -1}
                        stopPropagation
                    >
                        <IconDice size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        color={props.showRulers ? 'primary' : undefined}
                        onClick={props.onToggleRulers}
                        stopPropagation
                    >
                        <IconContext size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        disabled={selectedIndex() === -1}
                        color={settingsSheet.isOpen() ? 'primary' : undefined}
                        stopPropagation
                        onClick={settingsSheet.open}
                    >
                        <IconCog size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        disabled={selectedIndex() === -1}
                        stopPropagation
                        onClick={() => props.onRemove(selectedIndex())}
                    >
                        <IconTrashBin size={32} />
                    </Button>
                    <Button square style="light" stopPropagation onClick={addModal.open}>
                        <IconPlus size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <List inset striped>
                <For each={props.elements}>
                    {(el, index) => (
                        <LogoListItem
                            element={el}
                            selected={index() === selectedIndex()}
                            onClick={(ev) => {
                                const i = index();
                                setSelectedIndex((old) => (old === i ? -1 : i));
                                ev.stopPropagation();
                            }}
                            onColorClick={() => {
                                setSelectedIndex(index());
                                paletteSheet.open();
                            }}
                            canSwapUp={index() !== 0}
                            onSwapUp={() => {
                                const i = index();
                                props.onSwap(i, i - 1);
                                setSelectedIndex(i - 1);
                            }}
                            canSwapDown={index() !== props.elements.length - 1}
                            onSwapDown={() => {
                                const i = index();
                                props.onSwap(i, i + 1);
                                setSelectedIndex(i + 1);
                            }}
                        />
                    )}
                </For>
            </List>

            <TouchBottomSheet
                isOpen={paletteSheet.isOpen() && selectedIndex() !== -1}
                onClose={paletteSheet.close}
                header={
                    <PageHeader>
                        <PageHeaderTitle>Select Color</PageHeaderTitle>
                        <PageHeaderActions pushRight>
                            <Button onClick={paletteSheet.close}>Close</Button>
                        </PageHeaderActions>
                    </PageHeader>
                }
                transparentBackdrop
            >
                <LogoEditorPalette
                    selected={selectedElement()?.c}
                    onSelect={(c) => props.onUpdate(selectedIndex(), { c })}
                />
            </TouchBottomSheet>

            <TouchBottomSheet
                isOpen={settingsSheet.isOpen() && selectedIndex() !== -1}
                onClose={settingsSheet.close}
                header={
                    <PageHeader>
                        <PageHeaderTitle>Configure Element</PageHeaderTitle>
                        <PageHeaderActions pushRight>
                            <Button onClick={settingsSheet.close}>Close</Button>
                        </PageHeaderActions>
                    </PageHeader>
                }
                transparentBackdrop
            >
                <ElementEditor
                    selectedElement={selectedElement()}
                    onUpdate={(patch) => props.onUpdate(selectedIndex(), patch)}
                />
            </TouchBottomSheet>

            <TouchModal isOpen={addModal.isOpen()} onClose={addModal.close} title="Add Element" noPadding>
                <List striped>
                    <ListItem onClick={() => onAdd('rect')}>
                        <ListItemContent title="Rectangle" />
                    </ListItem>
                    <ListItem onClick={() => onAdd('ellipse')}>
                        <ListItemContent title="Ellipse" />
                    </ListItem>
                    <ListItem onClick={() => onAdd('text')}>
                        <ListItemContent title="Text" />
                    </ListItem>
                </List>
            </TouchModal>
        </>
    );
};
