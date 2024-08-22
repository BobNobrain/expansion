import { createMemo, type Component, Show, type JSX } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { TouchPage } from '../../components/TouchPage/TouchPage';
import { TouchHeader, TouchHeaderCell, TouchHeaderTitle } from '../../components/TouchHeader/TouchHeader';
import { Button } from '../../../components/Button/Button';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { SystemContentTable } from '../../../components/SystemContentTable/SystemContentTable';

type Selection = {
    type: 'galaxy' | 'sector' | 'system' | 'planet';
    id: string;
    tab: string;
};

const SelectionSwitch: Component<{
    value: Selection;
    galaxy?: (s: Selection) => JSX.Element;
    sector?: (s: Selection) => JSX.Element;
    system?: (s: Selection) => JSX.Element;
    planet?: (s: Selection) => JSX.Element;
}> = (props) => {
    return createMemo(() => {
        const selection = props.value;
        return props[selection.type]?.(selection) ?? null;
    }) as never;
};

export const CartographyView: Component = () => {
    const navigate = useNavigate();
    const backToMain = () => navigate('/');
    const location = useLocation();

    const onOpenSector = (sectorId: string | undefined) => navigate(sectorId ? `/galaxy/${sectorId}` : '/galaxy');

    const selection = createMemo<Selection>(() => {
        const [id = '', tab = ''] = location.pathname.split('/').slice(2);

        if (!id) {
            return { type: 'galaxy', id, tab };
        }
        if (id.length === 2) {
            return { type: 'sector', id, tab };
        }
        if (id.length === 6) {
            return { type: 'system', id, tab };
        }
        return { type: 'planet', id, tab };
    });

    return (
        <TouchPage
            stretch
            header={
                <TouchHeader>
                    <TouchHeaderCell>
                        <Button size="xl" square style="text" onClick={backToMain}>
                            &larr;
                        </Button>
                    </TouchHeaderCell>
                    <SelectionSwitch
                        value={selection()}
                        galaxy={() => <TouchHeaderTitle title="Galaxy Map" />}
                        sector={(s) => <TouchHeaderTitle title={s.id} subtitle="Galaxy Map" />}
                        system={(s) => <TouchHeaderTitle title={s.id} subtitle="System Map" />}
                        planet={(s) => <TouchHeaderTitle title={s.id} subtitle="Planet" />}
                    />
                </TouchHeader>
            }
        >
            <SceneRenderer>
                <GalaxyMapScene
                    isActive={selection().type === 'galaxy' || selection().type === 'sector'}
                    selectedSector={selection().id}
                    onSectorClick={onOpenSector}
                />
                <SystemMapScene isActive={selection().type === 'system'} systemId={selection().id} />
            </SceneRenderer>
            <TouchCurtain height={selection().type === 'galaxy' ? 's' : 'm'}>
                <Show when={selection().type === 'galaxy'}>Galaxy Overview</Show>

                <Show when={selection().type === 'sector'}>
                    <SectorContentTable sectorId={selection().id} />
                </Show>

                <Show when={selection().type === 'system'}>
                    <SystemContentTable systemId={selection().id} />
                </Show>

                <Show when={selection().type === 'planet'}>Planet overview</Show>
            </TouchCurtain>
        </TouchPage>
    );
};
