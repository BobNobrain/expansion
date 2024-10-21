import { type Component, createMemo } from 'solid-js';
import { type Star } from '../../domain/Star';
import { IconStar } from '../../icons';
import { formatScalar } from '../../lib/strings';
import { ContentList } from '../ContentList/ContentList';
import { type ContentItem } from '../ContentList/types';

export type SystemContentStarsListProps = {
    stars: Star[];
};

export const SystemContentStarsList: Component<SystemContentStarsListProps> = (props) => {
    const stars = createMemo<ContentItem[]>(() => {
        return props.stars.map((star): ContentItem => {
            return {
                humanId: '#' + star.id,
                title: star.id,
                icon: IconStar,
                properties: [
                    {
                        text: formatScalar(star.tempK, { digits: 0, unit: 'K', noShortenings: true }),
                    },
                    {
                        text: formatScalar(star.radiusAu * 1000, { digits: 2, unit: 'm au', noShortenings: true }),
                    },
                    {
                        text: formatScalar(star.ageBillionYears, { digits: 2, unit: 'byrs', noShortenings: true }),
                    },
                ],
            };
        });
    });

    return <ContentList items={stars()} />;
};
