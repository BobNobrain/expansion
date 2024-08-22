import { iconify } from './common/utils';

export const IconText = iconify({
    viewBox: '0 0 10 10',
    content: () => [
        <path fill="currentColor" fill-rule="evenodd" d="M0,2L10,2L10,8L0,8L0,2 M1,3L9,3L9,7L1,7L1,3" />,
        <path fill="currentColor" d="M1,0L6,0L6,1L4,1L4,9L6,9L6,10L1,10L1,9L3,9L3,1L1,1Z" />,
    ],
});
