import { Gallery } from "@/types/gallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Image, LogOut, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardProps {
  user: string;
  galleries: Gallery[];
  onSelectGallery: (gallery: Gallery) => void;
  onCreateGallery: () => void;
  onDeleteGallery: (id: string) => void;
  onLogout: () => void;
}

export const Dashboard = ({
  user,
  galleries,
  onSelectGallery,
  onCreateGallery,
  onDeleteGallery,
  onLogout,
}: DashboardProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-gallery-surface to-background">
      <header className="glass-panel border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-display text-3xl font-bold text-gradient">
            Memora
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, <span className="text-primary font-semibold">{user}</span></span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold mb-2">Your Galleries</h2>
            <p className="text-muted-foreground">
              {galleries.length} {galleries.length === 1 ? "gallery" : "galleries"} created
            </p>
          </div>
          <Button onClick={onCreateGallery} className="gradient-gold text-black font-semibold gold-glow hover:opacity-90">
            <PlusCircle className="w-5 h-5 mr-2" />
            Create Gallery
          </Button>
        </div>

        {galleries.length === 0 ? (
          <Card className="glass-panel p-12 text-center animate-fade-in">
            <div className="mx-auto w-20 h-20 rounded-full bg-gallery-elevated flex items-center justify-center mb-4">
              <Image className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">No galleries yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first gallery to showcase your art and memories
            </p>
            <Button onClick={onCreateGallery} className="gradient-gold text-black font-semibold">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Your First Gallery
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleries.map((gallery, index) => (
              <Card
                key={gallery.id}
                className="glass-panel group hover:border-primary/50 cursor-pointer transition-all duration-300 hover:scale-105 animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  onClick={() => onSelectGallery(gallery)}
                  className="relative h-48 bg-gallery-elevated overflow-hidden"
                >
                  {gallery.artworks.length > 0 ? (
                    <img
                      src={gallery.artworks[0].imgPath}
                      alt={gallery.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display text-xl font-bold text-white mb-1">
                      {gallery.name}
                    </h3>
                    <p className="text-white/70 text-sm">
                      {gallery.artworks.length} {gallery.artworks.length === 1 ? "artwork" : "artworks"}
                    </p>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {gallery.createdAt
                      ? formatDistanceToNow(new Date(gallery.createdAt), { addSuffix: true })
                      : "Just now"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this gallery?")) {
                        onDeleteGallery(gallery.id);
                      }
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
