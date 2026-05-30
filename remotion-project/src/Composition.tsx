import React from 'react';
import { Series } from 'remotion';
import { TitleCard } from './components/TitleCard';
import { NewsSegment } from './components/NewsSegment';
import { newsData } from './lib/news-data';

export const MyComposition: React.FC = () => {
    return (
        <Series>
            <Series.Sequence durationInFrames={30 * 10}>
                <TitleCard />
            </Series.Sequence>

            {newsData.map((data, index) => (
                <Series.Sequence key={index} durationInFrames={data.duration * 30}>
                    <NewsSegment title={data.title} items={data.items} />
                </Series.Sequence>
            ))}

            <Series.Sequence durationInFrames={30 * 10}>
                <div style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#000',
                    color: 'white',
                    fontSize: 80,
                    fontFamily: 'sans-serif'
                }}>
                    Subscribe for more AI News
                </div>
            </Series.Sequence>
        </Series>
    );
};
