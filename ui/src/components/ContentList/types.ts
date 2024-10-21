import { type Icon } from '../../icons';

export type ContentItem = {
    icon?: Icon;
    humanId?: string;
    title?: string;
    properties?: ContentItemProperty[];
    mainAction?: string | ((ev: MouseEvent) => void);
};

export type ContentItemProperty = {
    icon?: Icon;
    text?: string;
};
