import { createMemo, For, Show, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
    Banner,
    Button,
    InfoDisplay,
    PageHeader,
    PageHeaderActions,
    PageHeaderTitle,
    VerticalCarousel,
    VerticalCarouselSlide,
} from '@/atoms';
import { TutorialCareer } from '@/domain/Company';
import {
    IconApple,
    IconCogs,
    IconConstruction,
    IconDice,
    IconFlask,
    IconHandbook,
    IconIngot,
    IconLeaf,
    IconRocks,
    IconTick,
} from '@/icons';
import commonStyles from '../SetupPage.module.css';
import styles from './ASCareer.module.css';

const careerOptions = [
    {
        value: TutorialCareer.Resources,
        icon: IconRocks,
        title: 'Extraction',
        description: 'Extracting raw resources',
        fullDescription: (
            <>
                Resource extractors deliver natural resources that can be found in the ground, oceans, or atmospheres of
                different worlds, to the markets, so that they can be eventually processed to everything that modern
                society stands on.
            </>
        ),
    },
    {
        value: TutorialCareer.Metals,
        icon: IconIngot,
        title: 'Smelting and Smithing',
        description: 'Smelting ores and forging metals',
        fullDescription: (
            <>
                Metallurgy is one of the pillars that hold the technological progress. Metallurgists smelt raw ores into
                workable metals, and work these metals into details and parts that other enterprises use for assembling
                machines, producing construction materials, and so on.
            </>
        ),
    },
    {
        value: TutorialCareer.Farmer,
        icon: IconLeaf,
        title: 'Farming',
        description: 'Growing crops for fibers and food',
        fullDescription: (
            <>
                As a farmer, you will use fertile soils of habitable worlds to grow various useful plants that can
                provide resources, otherwise not found in nature.
            </>
        ),
    },
    {
        value: TutorialCareer.Food,
        icon: IconApple,
        title: 'Foods',
        description: 'Producing food to keep the population fed',
        fullDescription: (
            <>
                Food producers are the staple that secures all the technological advancements the humanity has made.
                After all, every factory needs workers, and somebody has to feed them.
            </>
        ),
    },
    {
        value: TutorialCareer.Construction,
        icon: IconConstruction,
        title: 'Construction',
        description: 'Making basic blocks that everything is built of',
        fullDescription: (
            <>
                Constructors produce the basic building blocks of the modern world – both figuratively and literally.
                Every factory needs to be built of something, and that's when you come in.
            </>
        ),
    },
    {
        value: TutorialCareer.Chemistry,
        icon: IconFlask,
        title: 'Chemistry',
        description: 'Refining and mixing materials, with science',
        fullDescription: (
            <>
                Material science is one of the wonders that gave us the capabilities to be in the place we are in now.
                Various chemical products are used in every industry, with no exceptions.
            </>
        ),
    },
    {
        value: TutorialCareer.Machinery,
        icon: IconCogs,
        title: 'Machinery',
        description: 'Assembling simple parts into useful machines',
        fullDescription: (
            <>
                Putting together all the simple parts, machinery assemblers make something more intricate, useful, and,
                perhaps, alive? Either way, nothing is getting produced by hand in modern world. When somebody is
                building a factory, it's your machinery they're gonna put inside it.
            </>
        ),
    },
];

export const ASCareer: Component<{
    career: TutorialCareer | null;
    setCareer: (value: TutorialCareer) => void;
    onContinue: () => void;
}> = (props) => {
    const icons = createMemo(() =>
        careerOptions.map((option) => (option.value === props.career ? IconTick : option.icon)),
    );

    return (
        <div class={commonStyles.contentPane}>
            <PageHeader>
                <PageHeaderTitle>Starting Career</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button square style="light">
                        <IconHandbook size={32} />
                    </Button>
                    <Button
                        square
                        style="light"
                        onClick={() =>
                            props.setCareer(careerOptions[Math.floor(Math.random() * careerOptions.length)].value)
                        }
                    >
                        <IconDice size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Banner color="info">
                Please note that this choice does not limit you in any way – the only thing it influences is the
                tutorial missions and your starting supplies.
            </Banner>
            <VerticalCarousel icons={icons()} height="350px" inset>
                <For each={careerOptions}>
                    {(option) => {
                        return (
                            <VerticalCarouselSlide>
                                <InfoDisplay
                                    title={option.title}
                                    titleIcon={option.icon}
                                    titleAlignment="start"
                                    actions={
                                        <Button
                                            color="primary"
                                            disabled={option.value === props.career}
                                            onClick={() => {
                                                props.setCareer(option.value);
                                            }}
                                        >
                                            <Dynamic
                                                component={option.value === props.career ? IconTick : option.icon}
                                                size={24}
                                            />
                                            <Show when={option.value === props.career} fallback="Select">
                                                Selected
                                            </Show>
                                        </Button>
                                    }
                                >
                                    {option.fullDescription}
                                </InfoDisplay>
                            </VerticalCarouselSlide>
                        );
                    }}
                </For>
            </VerticalCarousel>

            {/* <Banner color="info">
                Please note that this choice does not limit you in any way – the only thing it influences is the
                tutorial missions and your starting supplies.
            </Banner>
            <div class={styles.verticalTabs}>
                <ul class={styles.iconList}>
                    <For each={careerOptions}>
                        {(option) => {
                            return (
                                <li
                                    class={styles.iconOption}
                                    classList={{
                                        [styles.active]: option.value === props.career,
                                    }}
                                    onClick={() => props.setCareer(option.value)}
                                >
                                    <Dynamic component={option.icon} size={32} block />
                                </li>
                            );
                        }}
                    </For>
                </ul>
                <section class={styles.contentWrapper}>
                    <InfoDisplay
                        title={selectedItemTitle()}
                        actions={
                            <Show
                                when={props.career !== null}
                                fallback={
                                    <Button
                                        style="text"
                                        onClick={() =>
                                            props.setCareer(
                                                careerOptions[Math.floor(Math.random() * careerOptions.length)].value,
                                            )
                                        }
                                    >
                                        <IconDice size={32} />
                                        Pick random
                                    </Button>
                                }
                            >
                                <Button color="primary" onClick={props.onContinue}>
                                    Continue with this
                                </Button>
                            </Show>
                        }
                    >
                        {fullDescription()}
                    </InfoDisplay>
                </section>
            </div> */}
        </div>
    );
};

export function getCareerName(career: TutorialCareer): string {
    return careerOptions.find((opt) => opt.value === career)?.title ?? '';
}
