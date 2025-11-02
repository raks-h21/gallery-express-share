import { useState } from "react";
import { Gallery } from "@/types/gallery";
import { GalleryEditor } from "./GalleryEditor";
import { Gallery3D } from "./Gallery3D";
import { ShareDialog } from "./ShareDialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Eye, Share2 } from "lucide-react";

interface GalleryViewerProps {
  gallery: Gallery;
  onBack: () => void;
  onSave: (gallery: Gallery) => void;
}

export const GalleryViewer = ({ gallery, onBack, onSave }: GalleryViewerProps) => {
  const [mode, setMode] = useState<"edit" | "view">(gallery.artworks.length === 0 ? "edit" : "view");
  const [showShare, setShowShare] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(gallery);

  const handleSave = (updatedGallery: Gallery) => {
    const withTimestamps = {
      ...updatedGallery,
      createdAt: gallery.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentGallery(withTimestamps);
    onSave(withTimestamps);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gallery-bg">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 glass-panel border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="font-display text-2xl font-bold">
              {currentGallery.name || "Untitled Gallery"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {currentGallery.artworks.length > 0 && (
              <>
                <Button
                  variant={mode === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("edit")}
                  className={mode === "edit" ? "gradient-gold text-black" : ""}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant={mode === "view" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("view")}
                  className={mode === "view" ? "gradient-gold text-black" : ""}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View 3D
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShare(true)}
                  className="gold-glow"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="w-full h-full pt-16">
        {mode === "edit" ? (
          <GalleryEditor gallery={currentGallery} onSave={handleSave} />
        ) : (
          <Gallery3D gallery={currentGallery} />
        )}
      </div>

      {/* Share Dialog */}
      <ShareDialog
        open={showShare}
        onOpenChange={setShowShare}
        gallery={currentGallery}
      />
    </div>
  );
};
