import { type Component, Show } from 'solid-js';
import { TouchPage } from '../../components/TouchPage/TouchPage';
import { TouchHeader, TouchHeaderButton, TouchHeaderTitle } from '../../components/TouchHeader/TouchHeader';
import { Button } from '../../../components/Button/Button';
import { useNavigate, useParams } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { Container } from '../../../components/Container/Container';
import { PlanetViewScene } from '../../../scenes/PlanetViewScene/PlanetViewScene';

export const PlanetView: Component = () => {
    const params = useParams();
    const navigate = useNavigate();
    const backToMain = () => navigate('/');

    return (
        <TouchPage
            stretch
            header={
                <TouchHeader>
                    <TouchHeaderButton>
                        <Button size="xl" square style="text" onClick={backToMain}>
                            &larr;
                        </Button>
                    </TouchHeaderButton>
                    <TouchHeaderTitle title={params.planetId} subtitle={params.planetId} />
                </TouchHeader>
            }
        >
            <SceneRenderer>
                <PlanetViewScene seed="" />
            </SceneRenderer>
            <TouchCurtain height="s">
                <Container padded>
                    <Show when={params.tileId} fallback="Galaxy Overview">
                        Tile selected: {params.tileId}
                    </Show>
                </Container>
            </TouchCurtain>
        </TouchPage>
    );
};
