import { Composition } from "remotion";
import { FocusOnlyDemo } from "./FocusOnlyVideo";

const FPS = 30;
const DURATION_S = 52;

export const RemotionRoot = () => {
  return (
    <Composition
      id="FocusOnlyDemo"
      component={FocusOnlyDemo}
      durationInFrames={DURATION_S * FPS}
      fps={FPS}
      width={1280}
      height={720}
    />
  );
};
