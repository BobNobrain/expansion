import { type JSX, type ParentComponent, Show } from 'solid-js';
import { type DatafrontError } from '../../lib/datafront/types';
import { Button } from '../Button/Button';
import { InfoDisplay } from '../InfoDisplay/InfoDisplay';
import { SkeletonBlock } from '../Skeleton';

export type OperationDisplayProps = {
    title?: string;
    error: DatafrontError | null;
    loading?: boolean;
    skeleton?: JSX.Element;
};

export const OperationDisplay: ParentComponent<OperationDisplayProps> = (props) => {
    return (
        <Show when={!props.loading} fallback={props.skeleton ?? <SkeletonBlock height={64} />}>
            <Show when={props.error} fallback={props.children}>
                <InfoDisplay
                    title={props.title ?? 'An error has occured'}
                    actions={
                        props.error!.retry ? (
                            <Button color="primary" onClick={props.error!.retry}>
                                Try Again
                            </Button>
                        ) : undefined
                    }
                >
                    {props.error!.message}
                </InfoDisplay>
            </Show>
        </Show>
    );
};
