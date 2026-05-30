import { Composition } from 'remotion';
import { MyComposition } from './Composition';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="NewsVideo"
                component={MyComposition}
                durationInFrames={150 * 30} // 150 seconds (2m30s) at 30fps
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
