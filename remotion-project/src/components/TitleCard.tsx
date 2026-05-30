import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const TitleCard: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const opacity = interpolate(frame, [0, 20], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const scale = spring({
        frame,
        fps,
        config: {
            damping: 200,
        },
    });

    return (
        <AbsoluteFill
            style={{
                backgroundColor: '#111',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                zIndex: -1
            }} />
            <div style={{ opacity, transform: `scale(${scale})`, textAlign: 'center' }}>
                <h1 style={{ fontSize: 100, marginBottom: 20, fontFamily: 'sans-serif' }}>
                    AI News Update
                </h1>
                <h2 style={{ fontSize: 50, color: '#4facfe', fontFamily: 'monospace' }}>
                    2026 / 01 / 23-24
                </h2>
            </div>
        </AbsoluteFill>
    );
};
