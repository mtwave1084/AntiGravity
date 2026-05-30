import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

interface NewsSegmentProps {
    title: string;
    items: string[];
}

export const NewsSegment: React.FC<NewsSegmentProps> = ({ title, items }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Title animation: Fade in + Slide down slightly
    const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
    const titleY = interpolate(frame, [0, 30], [-50, 0], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{
            backgroundColor: '#111111',
            padding: 80,
            color: 'white'
        }}>
            {/* Background decoration: Dark gradient */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
                zIndex: -1
            }} />

            <h1
                style={{
                    fontFamily: 'sans-serif',
                    fontSize: 80,
                    marginBottom: 80,
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    color: '#4facfe',
                    textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                }}
            >
                {title}
            </h1>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map((item, index) => {
                    // Slower stagger: Appear every 2 seconds (60 frames)
                    // Start a bit later after title
                    const delay = 30 + index * 50;

                    const bulletOpacity = interpolate(frame, [delay, delay + 20], [0, 1]);
                    const bulletY = interpolate(frame, [delay, delay + 20], [30, 0]);

                    return (
                        <li
                            key={index}
                            style={{
                                fontFamily: 'sans-serif',
                                fontSize: 55,
                                marginBottom: 50,
                                opacity: bulletOpacity,
                                transform: `translateY(${bulletY}px)`,
                                color: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                textShadow: '0 2px 5px rgba(0,0,0,0.8)'
                            }}
                        >
                            <div style={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                backgroundColor: '#00f260',
                                boxShadow: '0 0 10px #00f260',
                                marginRight: 40,
                                flexShrink: 0
                            }} />
                            {item}
                        </li>
                    );
                })}
            </ul>
        </AbsoluteFill>
    );
};
