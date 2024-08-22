import { iconify } from './common/utils';

const PATH = [
    'M0,5',
    'A5,5 0 1 1 10,5',
    'A5,5 0 1 1 0,5',

    'M8.182,1.818',
    'A4.5,4.5 0 0 1 1.818,8.182',
    'A6,6 0 0 0 8.182,1.818',
].join(' ');

export const IconPlanet = iconify({
    viewBox: '0 0 10 10',
    content: () => [<path fill="currentColor" fill-rule="evenodd" d={PATH} />],
});
