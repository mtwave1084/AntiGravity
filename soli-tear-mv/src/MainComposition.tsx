import { AbsoluteFill, Sequence } from 'remotion';
import { TerminalSequence } from './TerminalSequence';
import React from 'react';

export const MainComposition: React.FC = () => {
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* 
                Intro: Terminal Sequence (0 - 15s) 
            */}
            <Sequence from={0} durationInFrames={450}>
                <TerminalSequence />
            </Sequence>

            {/* 
                Main MV (15s - End)
                Ideally we will put the Veo videos here.
            */}
            <Sequence from={450}>
                <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff0f5' }}>
                    <div style={{ textAlign: 'center', color: '#333' }}>
                        <h1>MV Main Part</h1>
                        <p>Place Veo generated videos here.</p>
                        <p style={{ fontSize: 100 }}>🎵</p>
                    </div>
                </AbsoluteFill>
            </Sequence>

            {/* 
                Audio Track
                <Audio src={staticFile("song.wav")} />
            */}
        </AbsoluteFill>
    );
};
