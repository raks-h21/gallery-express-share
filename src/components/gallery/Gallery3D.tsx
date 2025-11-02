import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { SpotLight, Text, ScrollControls, Scroll, Html } from "@react-three/drei";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { TextureLoader, Vector3, Group } from "three";
import { Gallery, Artwork } from "@/types/gallery";

interface Gallery3DProps {
  gallery: Gallery;
}

const WallArt = ({
  artwork,
  index,
  imageWidth,
  gap,
  startX,
  currentlyPlaying,
  setCurrentlyPlaying,
}: {
  artwork: Artwork;
  index: number;
  imageWidth: number;
  gap: number;
  startX: number;
  currentlyPlaying: HTMLAudioElement | null;
  setCurrentlyPlaying: (audio: HTMLAudioElement | null) => void;
}) => {
  const { height: viewportHeight } = useThree((s) => s.viewport);
  const texture = useLoader(TextureLoader, artwork.imgPath);
  const groupRef = useRef<Group>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = 0.12 * Math.sin(clock.elapsedTime + index * 0.4);
      groupRef.current.rotation.y = 0.03 * Math.sin(clock.elapsedTime + index * 0.5);
    }
  });

  const handleAudioToggle = () => {
    if (!audioRef.current) return;
    if (currentlyPlaying && currentlyPlaying !== audioRef.current) {
      currentlyPlaying.pause();
    }
    if (audioRef.current.paused) {
      audioRef.current.play();
      setCurrentlyPlaying(audioRef.current);
    } else {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    }
  };

  const titleY = -viewportHeight / 4 - 0.4;
  const descriptionY = titleY - 0.35;
  const audioY = descriptionY - 0.35;

  return (
    <group ref={groupRef} position={[startX + index * (imageWidth + gap), 0, 0]}>
      <SpotLight
        position={[0, 2.6, 5]}
        penumbra={1}
        angle={0.6}
        attenuation={1}
        anglePower={5}
        intensity={8}
        distance={10}
        castShadow
      />

      <mesh castShadow>
        <boxGeometry args={[imageWidth, viewportHeight / 2, 0.08]} />
        <meshStandardMaterial map={texture} roughness={0.35} metalness={0.2} />
      </mesh>

      <Text
        position={[0, titleY, 0.1]}
        scale={[2.2, 2.2, 2.2]}
        color="#fbbf24"
        anchorX="center"
        anchorY="top"
        font="https://fonts.gstatic.com/s/playfairdisplay/v29/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYhCU.woff"
      >
        {artwork.title}
      </Text>

      {artwork.description && (
        <Text
          position={[0, descriptionY, 0.1]}
          scale={[1.8, 1.8, 1.8]}
          color="#e5e5e5"
          anchorX="center"
          anchorY="top"
          maxWidth={2.5}
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
        >
          {artwork.description}
        </Text>
      )}

      {artwork.audioPath && (
        <Html position={[0, audioY, 0.2]} center>
          <button
            onClick={handleAudioToggle}
            className="px-4 py-2 rounded-lg border-none gradient-gold text-black font-semibold cursor-pointer transition-all hover:opacity-90"
            style={{ boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}
          >
            {audioRef.current && !audioRef.current.paused ? "⏸ Pause" : "▶ Play Audio"}
          </button>
          <audio ref={audioRef} src={artwork.audioPath} />
        </Html>
      )}
    </group>
  );
};

const Rig = () => {
  const { camera, mouse } = useThree();
  const vec = new Vector3();
  return useFrame(() => {
    const t = 0.06;
    camera.position.lerp(vec.set(mouse.x * 0.6, mouse.y * 0.25, camera.position.z), t);
  });
};

export const Gallery3D = ({ gallery }: Gallery3DProps) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<HTMLAudioElement | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: [0, 0, 12], fov: 50 }} className="w-full h-full">
        <ambientLight intensity={0.7} />
        <Suspense
          fallback={
            <Html center>
              <div className="text-primary font-semibold">Loading gallery...</div>
            </Html>
          }
        >
          <Gallery3DContent
            gallery={gallery}
            currentlyPlaying={currentlyPlaying}
            setCurrentlyPlaying={setCurrentlyPlaying}
          />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel px-6 py-3 rounded-full border border-border pointer-events-none">
        <p className="text-sm text-muted-foreground">
          Scroll horizontally • Move mouse to explore
        </p>
      </div>
    </div>
  );
};

const Gallery3DContent = ({
  gallery,
  currentlyPlaying,
  setCurrentlyPlaying,
}: {
  gallery: Gallery;
  currentlyPlaying: HTMLAudioElement | null;
  setCurrentlyPlaying: (audio: HTMLAudioElement | null) => void;
}) => {
  const { viewport } = useThree();
  const imageWidth = 3;
  const gap = 4;
  const totalWidth = Math.max(0, gallery.artworks.length * imageWidth + Math.max(0, gallery.artworks.length - 1) * gap);
  const startX = -totalWidth / 2 + imageWidth / 2 + 0.5;
  const pages = Math.max(1, (totalWidth + 1) / viewport.width);

  return (
    <>
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <planeGeometry args={[Math.max(totalWidth + viewport.width, 10), Math.max(15, viewport.height * 3)]} />
        <meshStandardMaterial color={0x0a0a0a} transparent opacity={0.95} />
      </mesh>

      <ScrollControls infinite={false} horizontal damping={6} pages={pages} distance={1}>
        <Scroll>
          {gallery.artworks.map((artwork, i) => (
            <WallArt
              key={artwork.id}
              artwork={artwork}
              index={i}
              imageWidth={imageWidth}
              gap={gap}
              startX={startX}
              currentlyPlaying={currentlyPlaying}
              setCurrentlyPlaying={setCurrentlyPlaying}
            />
          ))}
        </Scroll>
      </ScrollControls>

      <EffectComposer>
        <Vignette eskil={false} offset={0.05} darkness={0.4} />
      </EffectComposer>

      <Rig />
    </>
  );
};
