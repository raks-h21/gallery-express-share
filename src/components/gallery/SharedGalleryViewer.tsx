import { useState, useEffect } from "react";
import { Gallery3D } from "./Gallery3D";
import { Gallery } from "@/types/gallery";
import LZString from "lz-string";
import { Loader2 } from "lucide-react";

interface SharedGalleryViewerProps {
  encodedData: string;
}

export const SharedGalleryViewer = ({ encodedData }: SharedGalleryViewerProps) => {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGallery();
  }, [encodedData]);

  const loadGallery = async () => {
    try {
      const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
      if (!decompressed) {
        throw new Error("Invalid gallery data");
      }

      const data = JSON.parse(decompressed);
      const gallery: Gallery = {
        id: "shared",
        name: data.name,
        artworks: data.artworks.map((artwork: any, index: number) => ({
          id: `shared-${index}`,
          title: artwork.title,
          description: artwork.description,
          imgPath: artwork.imgData,
          audioPath: artwork.audioData,
        })),
      };

      setGallery(gallery);
    } catch (error) {
      console.error("Error loading shared gallery:", error);
      setError("Failed to load gallery. The link may be invalid or corrupted.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gallery-bg">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gallery-bg">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="font-display text-3xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error || "Gallery not found"}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 gradient-gold text-black font-semibold rounded-lg hover:opacity-90 transition-smooth"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gallery-bg">
      <header className="absolute top-0 left-0 right-0 z-50 glass-panel border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-gradient">
            {gallery.name}
          </h1>
          <a href="/">
            <button className="px-4 py-2 gradient-gold text-black font-semibold rounded-lg hover:opacity-90 transition-smooth">
              Create Your Own
            </button>
          </a>
        </div>
      </header>

      <div className="w-full h-full pt-16">
        <Gallery3D gallery={gallery} />
      </div>
    </div>
  );
};
