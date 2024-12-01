import { MouseButton } from '../mouse';

export type EmulateLinkClickOptions = {
    href: string;
    replace?: boolean;
    navigate: (href: string, opts?: { replace?: boolean }) => void;
};

export function emulateLinkClick(opts: EmulateLinkClickOptions, ev: MouseEvent) {
    const isExternalLink = !opts.href.startsWith('/');

    if (ev.button === MouseButton.Wheel || ev.ctrlKey || ev.metaKey || isExternalLink) {
        window.open(opts.href);
        return;
    }

    if (ev.button === MouseButton.Left && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        opts.navigate(opts.href, { replace: opts.replace });
        return;
    }
}
