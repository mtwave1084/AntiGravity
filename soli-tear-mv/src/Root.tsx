import { Composition } from 'remotion';
import { MainComposition } from './MainComposition';
import { TerminalSequence } from './TerminalSequence';
import React from 'react';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MainVideo"
                component={MainComposition}
                durationInFrames={30 * 230} // 3:50 approx
                fps={30}
                width={1920}
                height={1080}
            />
            <Composition
                id="TerminalPreview"
                component={TerminalSequence}
                durationInFrames={450} // 15 seconds * 30fps
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
