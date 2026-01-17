import { Text } from '@/atoms';
import type { Component } from 'solid-js';

export type CompanyLogoProps = {
    value: unknown;
    isLoading?: boolean;
    companyName: string | null;
};

export const CompanyLogo: Component<CompanyLogoProps> = (props) => {
    // TBD
    return (
        <div style="text-align: center; align-content: center; height: 100%; min-height: 75px; max-height: 100%; background: var(--p-main-100)">
            <Text size="h1" bold>
                {props.companyName ?? 'Loading...'}
            </Text>
        </div>
    );
};
