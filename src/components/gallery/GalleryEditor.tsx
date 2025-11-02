import { useState } from "react";
import { Gallery, Artwork } from "@/types/gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Upload, X, Music, Save } from "lucide-react";
import { toast } from "sonner";

interface GalleryEditorProps {
  gallery: Gallery;
  onSave: (gallery: Gallery) => void;
}

export const GalleryEditor = ({ gallery, onSave }: GalleryEditorProps) => {
  const [name, setName] = useState(gallery.name);
  const [artworks, setArtworks] = useState<Artwork[]>(gallery.artworks);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newArtworks = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      file,
      imgPath: URL.createObjectURL(file),
      title: file.name.split(".")[0],
      description: "",
    }));
    setArtworks([...artworks, ...newArtworks]);
    toast.success(`${files.length} image(s) added`);
  };

  const handleAudioUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = [...artworks];
    updated[index].audio = file;
    updated[index].audioPath = URL.createObjectURL(file);
    setArtworks(updated);
    toast.success("Audio added");
  };

  const handleUpdateArtwork = (index: number, field: keyof Artwork, value: string) => {
    const updated = [...artworks];
    (updated[index] as any)[field] = value;
    setArtworks(updated);
  };

  const handleRemoveArtwork = (index: number) => {
    setArtworks(artworks.filter((_, i) => i !== index));
    toast.success("Artwork removed");
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a gallery name");
      return;
    }
    if (artworks.length === 0) {
      toast.error("Please add at least one artwork");
      return;
    }
    onSave({ ...gallery, name, artworks });
    toast.success("Gallery saved successfully!");
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-gallery-surface to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="glass-panel p-8 mb-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="gallery-name" className="text-lg font-semibold">
                Gallery Name
              </Label>
              <Input
                id="gallery-name"
                type="text"
                placeholder="Enter gallery name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 bg-gallery-elevated border-border text-lg"
              />
            </div>

            <div>
              <Label htmlFor="image-upload" className="text-lg font-semibold block mb-2">
                Upload Artworks
              </Label>
              <label
                htmlFor="image-upload"
                className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg hover:border-primary cursor-pointer transition-all bg-gallery-elevated hover:bg-gallery-surface group"
              >
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-muted-foreground group-hover:text-primary transition-colors">
                  Click to upload images
                </span>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </Card>

        {artworks.length > 0 && (
          <div className="space-y-4 mb-8">
            {artworks.map((artwork, index) => (
              <Card key={artwork.id} className="glass-panel p-6 animate-slide-up">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={artwork.imgPath}
                      alt={artwork.title}
                      className="w-32 h-32 object-cover rounded-lg border border-border"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Input
                            id={`title-${index}`}
                            value={artwork.title}
                            onChange={(e) => handleUpdateArtwork(index, "title", e.target.value)}
                            className="mt-1 bg-gallery-elevated border-border"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`description-${index}`}>Description</Label>
                          <Textarea
                            id={`description-${index}`}
                            value={artwork.description}
                            onChange={(e) => handleUpdateArtwork(index, "description", e.target.value)}
                            className="mt-1 bg-gallery-elevated border-border"
                            rows={2}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`audio-${index}`} className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Audio (optional)
                          </Label>
                          <input
                            id={`audio-${index}`}
                            type="file"
                            accept="audio/*"
                            onChange={(e) => handleAudioUpload(index, e)}
                            className="mt-1 text-sm"
                          />
                          {artwork.audioPath && (
                            <span className="text-xs text-primary mt-1 block">Audio attached</span>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveArtwork(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {artworks.length > 0 && (
          <div className="sticky bottom-4">
            <Button
              onClick={handleSave}
              className="w-full gradient-gold text-black font-semibold text-lg py-6 gold-glow hover:opacity-90"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Gallery
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
