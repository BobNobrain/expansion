import { Show, type Component } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { TouchPage } from '../../components/TouchPage/TouchPage';
import { TouchHeader, TouchHeaderCell, TouchHeaderTitle } from '../../components/TouchHeader/TouchHeader';
import { Button } from '../../../components/Button/Button';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { Container } from '../../../components/Container/Container';

export const GalaxyMapView: Component = () => {
    const navigate = useNavigate();
    const backToMain = () => navigate('/');

    const onOpenSector = (sectorId: string | undefined) => navigate(sectorId ? `/map/${sectorId}` : '/map');
    const params = useParams();

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
                    <TouchHeaderTitle
                        title={params.sectorId || 'Galaxy Map'}
                        subtitle={params.sectorId ? 'Galaxy Map' : undefined}
                    />
                </TouchHeader>
            }
        >
            <SceneRenderer>
                <GalaxyMapScene selectedSector={params.sectorId} onSectorClick={onOpenSector} />
            </SceneRenderer>
            <TouchCurtain height="s">
                <Container padded>
                    <Show when={params.sectorId} fallback="Galaxy Overview">
                        Sector selected: {params.sectorId}
                    </Show>
                </Container>
            </TouchCurtain>
        </TouchPage>
    );
};
