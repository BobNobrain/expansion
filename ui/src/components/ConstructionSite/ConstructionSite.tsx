import { createMemo, createSignal, For, type Component } from 'solid-js';
import { type BaseConstructionSite } from '../../domain/Base';
import { IconArea, IconHammer, IconPlus } from '../../icons';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Container, Spacer } from '../Container/Container';
import { ContributionSlider } from '../ContributionSlider/ContributionSlider';
import { Group, GroupHeader } from '../Group';
import { Text } from '../Text/Text';

export type ConstructionSiteProps = {
    site: BaseConstructionSite;
    availableMaterials?: Record<string, number>;
};

type SliderRow = {
    commodity: string;
    total: number;
    provided: number;
    available: () => number;
    current: () => number;
    setCurrent: (n: number) => void;
};

export const ConstructionSite: Component<ConstructionSiteProps> = (props) => {
    const [currentCounts, setCurrentCounts] = createSignal<Record<string, number>>({});

    const fillAll = () => {
        const filledCounts: Record<string, number> = {};
        const { total, provided } = props.site;
        const { availableMaterials = {} } = props;

        for (const commodity of Object.keys(props.site.total)) {
            const available = availableMaterials[commodity] ?? 0;
            const needed = total[commodity] - (provided[commodity] ?? 0);
            filledCounts[commodity] = Math.min(available, needed);
        }

        setCurrentCounts(filledCounts);
    };

    const rows = createMemo(() => {
        return Object.keys(props.site.total).map((commodity): SliderRow => {
            const { total, provided } = props.site;

            return {
                commodity,
                total: total[commodity],
                provided: provided[commodity] ?? 0,
                available: () =>
                    Math.min(props.availableMaterials?.[commodity] ?? 0, total[commodity] - (provided[commodity] ?? 0)),
                current: () => currentCounts()[commodity] ?? 0,
                setCurrent: (x) => setCurrentCounts((old) => ({ ...old, [commodity]: x })),
            };
        });
    });

    return (
        <Group>
            <GroupHeader>
                <Text size="h2" color="primary">
                    {props.site.equipment}
                </Text>
                <Badge style="transparent" iconLeft={IconArea}>
                    {props.site.area.toFixed(0)}
                </Badge>
                <Spacer />
                <Button style="light" size="s" square onClick={fillAll}>
                    <IconPlus size={16} />
                </Button>
                <Button style="light" size="s" square color={props.site.autoBuild ? 'primary' : undefined}>
                    <IconHammer size={16} />
                </Button>
            </GroupHeader>

            <Container direction="column" hasGap>
                <For each={rows()}>
                    {(row) => {
                        return (
                            <ContributionSlider
                                commodity={row.commodity}
                                provided={row.provided}
                                total={row.total}
                                value={row.current()}
                                available={row.available()}
                                onUpdate={row.setCurrent}
                            />
                        );
                    }}
                </For>
            </Container>
        </Group>
    );
};
