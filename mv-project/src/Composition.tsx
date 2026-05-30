import React from 'react';
import { AbsoluteFill } from 'remotion';

export const MyVideo: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black', color: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <h1>Waiting for Video and Lyrics...</h1>
        </AbsoluteFill>
    );
};
