import { For, type Component, type JSX } from 'solid-js';
import { A } from '@solidjs/router';
import { Button } from '../../../components/Button/Button';
import { Island } from '../../../components/Island/Island';
import { Text } from '../../../components/Text/Text';
import { IconPlanet } from '../../../icons/planet';
import { type SemanticColor } from '../../../lib/appearance';
import { Container } from '../../../components/Container/Container';
import { usePageContextBinding } from '../../components/TouchPage';
import styles from './HomePage.module.css';

type FeedElement = {
    label: string;
    category: string;
    icon: string;
    url: string;
};

const feed: FeedElement[] = [
    { label: 'A Company Making Everything', category: 'Company', icon: '㏇', url: '/companies/ACME' },
    { label: 'Kepler #24F', category: 'Site', icon: '⚐', url: '/planets/bf35-c/tiles/24f' },
    { label: 'Kepler Market', category: 'Exchange', icon: '⇋', url: '/planets/bf35-c/x' },
    { label: 'Kepler', category: 'Planet', icon: '⊘', url: '/planets/bf35-c' },
];

type MenuElement = {
    icon: string | JSX.Element;
    label: string;
    description: string;
    color?: SemanticColor;
    url: string;
    subItems: {
        icon: JSX.Element;
        label: string;
        url: string;
    }[];
};

const menu: MenuElement[] = [
    {
        icon: <IconPlanet size={32} />,
        label: 'Planets',
        color: 'primary',
        description: 'Planets with branch offices',
        url: '/companies/ACME/planets',
        subItems: [
            {
                label: 'Kepler',
                icon: <IconPlanet />,
                url: '/galaxy/AH-235c',
            },
        ],
    },
    {
        icon: '꩜',
        label: 'Galaxy',
        description: 'Galactic map and galaxy overview',
        url: '/galaxy',
        subItems: [],
    },
    {
        icon: '△',
        label: 'Fleet',
        description: 'Fleed status and command center',
        url: '/ships',
        subItems: [
            {
                label: 'Molly',
                icon: '△',
                url: '/ships/4f83bd2',
            },
            {
                label: 'Bet-C',
                icon: '△',
                url: '/ships/4f83bd3',
            },
        ],
    },
    {
        icon: '?',
        label: 'Library',
        description: 'Help center and knowledge base',
        color: 'info',
        url: '/help',
        subItems: [
            {
                label: 'Getting Started',
                icon: '?',
                url: '/help/getting-started',
            },
            {
                label: 'FAQ',
                icon: '?',
                url: '/help/faq',
            },
            {
                label: 'Industries',
                icon: '?',
                url: '/help/industries',
            },
        ],
    },
];

export const HomePage: Component = () => {
    usePageContextBinding({
        title: 'Expansion',
    });

    return (
        <Container padded direction="column" hasGap>
            <Island color="primary" style="outlined">
                <div class={styles.overview}>
                    <div class={styles.overviewWelcome}>
                        Welcome,{' '}
                        <Text bold color="primary">
                            @user
                        </Text>
                        !
                    </div>
                    <div class={styles.overviewBalance}>503 ¢</div>
                </div>
                <div class={styles.overviewEvents}>
                    <div class={styles.overviewEventsText}>
                        <Text bold>Inbox:</Text> Last notification text with whatever is in it goes here
                    </div>
                    <Button color="primary" size="m">
                        +2
                    </Button>
                </div>
            </Island>

            <Container size="m" direction="row" hasGap clearSelfPadding>
                <For each={feed}>
                    {(el) => {
                        return (
                            <Island style="outlined">
                                <A href={el.url} class={styles.feedElement}>
                                    <div class={styles.feedElementIcon}>{el.icon}</div>
                                    <div class={styles.feedElementCategory}>{el.category}</div>
                                    <div class={styles.feedElementLabel}>{el.label}</div>
                                </A>
                            </Island>
                        );
                    }}
                </For>
            </Container>

            <Container direction="column" threads="2" hasGap size="l">
                <For each={menu}>
                    {(el) => {
                        return (
                            <Island color={el.color} style="solid" padded>
                                <A href={el.url} class={styles.tile}>
                                    <div class={styles.tileIcon}>{el.icon}</div>
                                    <div class={styles.tileLabel}>{el.label}</div>
                                    <div class={styles.tileDescription}>{el.description}</div>

                                    <div class={styles.subtiles}>
                                        <For each={el.subItems}>
                                            {(subtile) => {
                                                return (
                                                    <div class={styles.subtile}>
                                                        <Island style="solid" color="background">
                                                            <div class={styles.subtileIcon}>{subtile.icon}</div>
                                                            <div class={styles.subtileLabel}>{subtile.label}</div>
                                                        </Island>
                                                    </div>
                                                );
                                            }}
                                        </For>
                                    </div>
                                </A>
                            </Island>
                        );
                    }}
                </For>
            </Container>
        </Container>
    );
};
