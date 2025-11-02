import { useState, useEffect } from "react";
import { AuthForm } from "@/components/gallery/AuthForm";
import { Dashboard } from "@/components/gallery/Dashboard";
import { GalleryViewer } from "@/components/gallery/GalleryViewer";
import { SharedGalleryViewer } from "@/components/gallery/SharedGalleryViewer";
import { Gallery } from "@/types/gallery";

const Index = () => {
  const [user, setUser] = useState<string | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [sharedGalleryData, setSharedGalleryData] = useState<string | null>(null);

  useEffect(() => {
    // Check for shared gallery in URL
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("gallery");
    if (shared) {
      setSharedGalleryData(shared);
      return;
    }

    // Check for logged-in user
    const savedUser = localStorage.getItem("memora_current_user");
    if (savedUser) {
      setUser(savedUser);
      loadUserGalleries(savedUser);
    }
  }, []);

  const loadUserGalleries = (username: string) => {
    const saved = localStorage.getItem(`memora_galleries_${username}`);
    if (saved) {
      setGalleries(JSON.parse(saved));
    }
  };

  const handleLogin = (username: string) => {
    setUser(username);
    localStorage.setItem("memora_current_user", username);
    loadUserGalleries(username);
  };

  const handleLogout = () => {
    setUser(null);
    setGalleries([]);
    setSelectedGallery(null);
    localStorage.removeItem("memora_current_user");
  };

  const handleSaveGallery = (gallery: Gallery) => {
    if (!user) return;
    
    const updatedGalleries = gallery.id
      ? galleries.map((g) => (g.id === gallery.id ? gallery : g))
      : [...galleries, { ...gallery, id: Date.now().toString() }];
    
    setGalleries(updatedGalleries);
    localStorage.setItem(`memora_galleries_${user}`, JSON.stringify(updatedGalleries));
  };

  const handleDeleteGallery = (id: string) => {
    if (!user) return;
    const updated = galleries.filter((g) => g.id !== id);
    setGalleries(updated);
    localStorage.setItem(`memora_galleries_${user}`, JSON.stringify(updated));
    if (selectedGallery?.id === id) {
      setSelectedGallery(null);
    }
  };

  // Shared gallery view
  if (sharedGalleryData) {
    return <SharedGalleryViewer encodedData={sharedGalleryData} />;
  }

  // Not logged in
  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  // Gallery viewer
  if (selectedGallery) {
    return (
      <GalleryViewer
        gallery={selectedGallery}
        onBack={() => setSelectedGallery(null)}
        onSave={handleSaveGallery}
      />
    );
  }

  // Dashboard
  return (
    <Dashboard
      user={user}
      galleries={galleries}
      onSelectGallery={setSelectedGallery}
      onCreateGallery={() => setSelectedGallery({ name: "", artworks: [], id: "" })}
      onDeleteGallery={handleDeleteGallery}
      onLogout={handleLogout}
    />
  );
};

export default Index;
