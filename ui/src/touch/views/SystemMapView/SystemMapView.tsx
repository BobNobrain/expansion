import { Show, type Component } from 'solid-js';
import { useNavigate, useParams } from '@solidjs/router';
import { TouchPage } from '../../components/TouchPage/TouchPage';
import { TouchHeader, TouchHeaderCell, TouchHeaderTitle } from '../../components/TouchHeader/TouchHeader';
import { Button } from '../../../components/Button/Button';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';

export const SystemMapView: Component = () => {
    const navigate = useNavigate();
    const backToMain = () => navigate('/');

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
                    <TouchHeaderTitle title={params.systemId} />
                </TouchHeader>
            }
        >
            <SceneRenderer>
                <SystemMapScene systemId={params.systemId} />
            </SceneRenderer>
            <TouchCurtain height="m">
                <Show when={params.systemId}>System content table...</Show>
            </TouchCurtain>
        </TouchPage>
    );
};
