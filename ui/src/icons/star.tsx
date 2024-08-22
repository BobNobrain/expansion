import { iconify } from './common/utils';

const PATH = [
    'M3,5A2,2 0 1 1 7,5A2,2 0 1 1 3,5',
    'M5,1l1,1.5h-2l1,-1.5',
    'M5,9l1,-1.5h-2l1,1.5',
    'M1,5l1.5,1v-2l-1.5,1',
    'M9,5l-1.5,1v-2l1.5,1',
].join('');

export const IconStar = iconify({
    viewBox: '0 0 10 10',
    content: () => [<path fill="currentColor" fill-rule="evenodd" d={PATH} />],
});
