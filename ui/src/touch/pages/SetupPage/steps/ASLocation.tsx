import { Show, type Component } from 'solid-js';
import {
    Button,
    DefinitionList,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
    RatingBox,
    Text,
    VerticalCarousel,
    VerticalCarouselSlide,
    type DefinitionListItem,
} from '@/atoms';
import { IconGalaxy, IconPlanet } from '@/icons';
import { formatPercentage } from '@/lib/strings';
import { PlanetViewScene } from '@/scenes/PlanetViewScene/PlanetViewScene';
import { SceneRenderer } from '@/three/SceneRenderer/SceneRenderer';
import commonStyles from '../SetupPage.module.css';
import styles from './ASLocation.module.css';

type StarterWorldInfo = {
    id: string;
    name: string | null;
    suitabilityRating: string;
};

const PLANET_DEFS: DefinitionListItem<StarterWorldInfo>[] = [
    {
        title: 'Name',
        render: (world) => {
            return (
                <>
                    <Show when={world.name}>
                        <Text color="primary">{world.name}</Text>{' '}
                    </Show>
                    <Text color={world.name ? 'dim' : 'bright'}>{world.id}</Text>
                </>
            );
        },
    },
    {
        title: 'Resources',
        render: () => 'Resources...',
    },
    {
        title: 'Soil Fertility',
        render: () => (
            <>
                <Text>{formatPercentage(0.56)}</Text> <RatingBox rating="C" />
            </>
        ),
    },
    {
        title: 'Profession Suitability',
        render: (world) => <RatingBox rating={world.suitabilityRating} />,
    },
];

const WorldInfo: Component<{ world: StarterWorldInfo; onPick: (id: string) => void; pickedId: string | null }> = (
    props,
) => {
    return (
        <div class={styles.worldInfo}>
            <SceneRenderer nonInteractive>
                <PlanetViewScene isActive worldId={props.world.id} hideControls cameraMode="auto" />
            </SceneRenderer>
            <div class={styles.buttonWrapper}>
                <Button
                    color="primary"
                    disabled={props.pickedId === props.world.id}
                    onClick={() => props.onPick(props.world.id)}
                >
                    <Show when={props.pickedId === props.world.id} fallback="Select">
                        Selected
                    </Show>
                </Button>
            </div>
            <DefinitionList items={PLANET_DEFS} value={props.world} />
        </div>
    );
};

export const ASLocation: Component<{ pickedId: string | null; onPick: (worldId: string) => void }> = (props) => {
    return (
        <div
            class={commonStyles.contentPane}
            classList={{
                [commonStyles.noBottomPadding]: true,
            }}
        >
            <PageHeader>
                <PageHeaderTitle>Starting Planet</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light">
                        <IconGalaxy size={32} />
                    </Button>
                    <Button square style="light" color="primary">
                        <IconPlanet size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>

            <VerticalCarousel icons={IconPlanet} height="calc(100dvh - 224px)" inset>
                <VerticalCarouselSlide>
                    <WorldInfo
                        world={{ id: 'HK-019d', name: 'Gaia', suitabilityRating: 'S' }}
                        onPick={props.onPick}
                        pickedId={props.pickedId}
                    />
                </VerticalCarouselSlide>
                <VerticalCarouselSlide>
                    <WorldInfo
                        world={{ id: 'HK-019d', name: null, suitabilityRating: 'A-' }}
                        onPick={props.onPick}
                        pickedId={props.pickedId}
                    />
                </VerticalCarouselSlide>
                <VerticalCarouselSlide>
                    <WorldInfo
                        world={{ id: 'HK-019d', name: 'Kepler', suitabilityRating: 'F' }}
                        onPick={props.onPick}
                        pickedId={props.pickedId}
                    />
                </VerticalCarouselSlide>
            </VerticalCarousel>
        </div>
    );
};
