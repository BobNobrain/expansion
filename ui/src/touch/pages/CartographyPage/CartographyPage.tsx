import { createMemo, type Component, Show } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { SystemContentTable } from '../../../components/SystemContentTable/SystemContentTable';
import { usePageContextBinding } from '../../components/TouchPage';

type Selection = {
    type: 'galaxy' | 'sector' | 'system' | 'planet';
    id: string;
    tab: string;
};

export const CartographyPage: Component = () => {
    const navigate = useNavigate();
    const backToMain = () => {
        navigate('/');
    };
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

    usePageContextBinding(() => {
        const s = selection();
        let title = 'Galaxy Map';
        let subtitle: string | undefined;
        switch (s.type) {
            case 'sector':
                title = s.id;
                subtitle = 'Galaxy Map';
                break;

            case 'system':
                title = s.id;
                subtitle = 'System Map';
                break;

            case 'planet':
                title = s.id;
                subtitle = 'Planet';
                break;
        }

        return {
            title,
            subtitle,
            goBack: backToMain,
        };
    });

    return (
        <>
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
        </>
    );
};
