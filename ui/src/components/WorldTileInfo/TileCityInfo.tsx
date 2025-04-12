import { type Component, createMemo, Show } from 'solid-js';
import { type City, type WorkforceType } from '../../domain/City';
import { IconCalendar, IconCity, IconPeople, IconUser } from '../../icons';
import { type Predictable } from '../../lib/predictables';
import { useNow } from '../../lib/solid/useNow';
import { formatInteger } from '../../lib/strings';
import { Badge } from '../Badge/Badge';
import { DefinitionList, type DefinitionListProperties } from '../DefinitionList/DefinitionList';
import { PageHeader, PageHeaderIcon, PageHeaderTitle } from '../PageHeader';
import { Container } from '../Container/Container';
import { UserLink } from '../UserLink/UserLink';
import { GameTimeLabel } from '../GameTimeLabel/GameTimeLabel';

type TileCityInfo = {
    name: string;
    founded: { byId: string; at: Date };
    populationCounts: Record<WorkforceType, Predictable>;
};

const tileCityDefs: DefinitionListProperties<TileCityInfo> = {
    name: {
        title: 'Name',
        render: 'name',
    },
    founded: {
        title: 'Founded',
        render: (value) => {
            return (
                <Container direction="row" hasGap>
                    <Badge style="transparent" iconLeft={IconUser}>
                        <UserLink id={value.founded.byId} />
                    </Badge>
                    <Badge style="transparent" iconLeft={IconCalendar}>
                        <GameTimeLabel value={value.founded.at} color="bright" />
                    </Badge>
                </Container>
            );
        },
    },
    populationCounts: {
        title: 'Population',
        render: (value) => {
            const nowSignal = useNow();
            const totalPops = () => {
                let total = 0;
                const nowValue = nowSignal();
                for (const p of Object.values(value.populationCounts)) {
                    total += p.predict(nowValue);
                }

                return formatInteger(total);
            };
            return (
                <Badge iconLeft={IconPeople} style="transparent">
                    {totalPops()}
                </Badge>
            );
        },
    },
};

type Props = {
    city: City | null;
    tileId: string | undefined;
};

export const TileCityInfo: Component<Props> = (props) => {
    const tileCityInfo = createMemo<TileCityInfo | null>(() => {
        const city = props.city;

        if (!city) {
            return null;
        }

        if (city.centerTileId !== props.tileId) {
            return null;
        }

        return {
            name: city.name,
            founded: {
                at: city.established,
                byId: city.founder,
            },
            populationCounts: city.population.counts,
        };
    });

    return (
        <Show when={tileCityInfo()}>
            <PageHeader>
                <PageHeaderTitle>City</PageHeaderTitle>
                <PageHeaderIcon icon={IconCity} />
            </PageHeader>
            <DefinitionList items={tileCityDefs} value={tileCityInfo()} />
        </Show>
    );
};
