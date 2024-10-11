import { iconify } from './common/utils';

export const IconContext = iconify({
    viewBox: '0 0 32 32',
    content: () => [
        <rect x="1" y="1" width="12" height="12" rx="2" fill="currentColor" />,
        <rect x="19" y="1" width="12" height="12" rx="2" fill="currentColor" />,
        <rect x="1" y="19" width="12" height="12" rx="2" fill="currentColor" />,
        <rect x="19" y="19" width="12" height="12" rx="2" fill="currentColor" />,
    ],
});
