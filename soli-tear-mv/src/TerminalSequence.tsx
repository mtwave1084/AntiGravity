import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import React, { useMemo } from 'react';

const FONT_FAMILY = '"Courier New", Courier, monospace';
const TEXT_COLOR = '#0f0'; // Retro green
const CURSOR_COLOR = '#0f0';

type TerminalLine = {
    text: string;
    startFrame: number;
    typingSpeed?: number; // frames per char
};

const SCRIPT: TerminalLine[] = [
    { text: '> system_check --target "World"', startFrame: 10 },
    { text: '> Status: Bored', startFrame: 70 },
    { text: '', startFrame: 100 },
    { text: '> initializing_project Soli-Tear...', startFrame: 110 },
    { text: '> connecting_to_agent [Tear]...', startFrame: 180 },
    { text: '', startFrame: 230 },
    { text: '> 3... 2... 1...', startFrame: 240 },
    { text: '', startFrame: 300 },
    { text: '> Are you ready to be an accomplice? [Y/n]', startFrame: 310 },
    { text: '> Y', startFrame: 400 },
];

const Cursor: React.FC<{ opacity: number }> = ({ opacity }) => {
    return (
        <span
            style={{
                display: 'inline-block',
                width: '15px',
                height: '40px',
                backgroundColor: CURSOR_COLOR,
                marginLeft: '5px',
                verticalAlign: 'middle',
                opacity: opacity,
            }}
        />
    );
};

export const TerminalSequence: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Blink cursor every 15 frames (0.5s)
    // Only show cursor if we are not at the very end
    const cursorVisible = Math.floor(frame / 15) % 2 === 0 ? 1 : 0;

    return (
        <AbsoluteFill
            style={{
                backgroundColor: 'black',
                color: TEXT_COLOR,
                fontFamily: FONT_FAMILY,
                padding: '60px',
                fontSize: '40px',
                lineHeight: '1.5',
                textShadow: '0 0 5px #0f0', // Slight glow
            }}
        >
            {SCRIPT.map((line, index) => {
                const { text, startFrame } = line;

                if (frame < startFrame) return null;

                const charDuration = 2; // 2 frames per char
                const charsToShow = Math.floor((frame - startFrame) / charDuration);
                const currentText = text.slice(0, Math.max(0, charsToShow));

                return (
                    <div key={index} style={{ minHeight: '1.5em' }}>
                        {currentText}
                    </div>
                );
            })}
            {/* Always show cursor at the end of the last visible line?? 
                For simplicity, let's just put it at the bottom. 
            */}
            <div style={{ marginTop: 0 }}>
                <Cursor opacity={cursorVisible} />
            </div>
        </AbsoluteFill>
    );
};
