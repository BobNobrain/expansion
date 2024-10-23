import { iconify } from './common/utils';

export const IconStar = iconify({
    viewBox: '0 0 32 32',
    content: () => [
        <path d="M16 1L20.3301 7H11.6699L16 1Z" fill="currentColor" />,
        <path
            d="M24 16C24 20.4183 20.4183 24 16 24C11.5817 24 8 20.4183 8 16C8 11.5817 11.5817 8 16 8C20.4183 8 24 11.5817 24 16Z"
            fill="currentColor"
        />,
        <path d="M25 20.3301L31 16L25 11.6699V20.3301Z" fill="currentColor" />,
        <path d="M16 31L11.6699 25H20.3301L16 31Z" fill="currentColor" />,
        <path d="M7 11.6699L1 16L7 20.3301V11.6699Z" fill="currentColor" />,
    ],
});
