import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Eye, MessageSquare, Search, TrendingUp, Clock, Home, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Gallery {
  id: string;
  name: string;
  description: string;
  view_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
  gallery_likes: { id: string }[];
  gallery_comments: { id: string }[];
}

const Explore = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trending");
  const navigate = useNavigate();

  useEffect(() => {
    loadGalleries();
  }, [activeTab]);

  const loadGalleries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("galleries")
        .select(`
          *,
          profiles!galleries_user_id_fkey(username, avatar_url),
          gallery_likes(id),
          gallery_comments(id)
        `)
        .eq("is_public", true);

      if (activeTab === "trending") {
        query = query.order("view_count", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query.limit(20);
      if (error) throw error;
      setGalleries(data || []);
    } catch (error: any) {
      toast.error("Failed to load galleries");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const filteredGalleries = galleries.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Explore Galleries
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              My Galleries
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search galleries or creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="trending">
              <TrendingUp className="mr-2 h-4 w-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent">
              <Clock className="mr-2 h-4 w-4" />
              Recent
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-48 bg-muted" />
                <CardContent className="space-y-2 pt-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGalleries.map((gallery) => (
              <Card
                key={gallery.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer backdrop-blur-sm bg-card/50 border-border/50 hover:border-primary/50"
                onClick={() => navigate(`/gallery/${gallery.id}`)}
              >
                <CardHeader className="relative overflow-hidden rounded-t-lg h-48 bg-gradient-to-br from-primary/20 to-accent/20 p-0">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-20">🎨</div>
                  </div>
                  <Badge className="absolute top-3 right-3 backdrop-blur-sm">
                    <Eye className="mr-1 h-3 w-3" />
                    {gallery.view_count}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="mb-2 line-clamp-1">{gallery.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mb-4">
                    {gallery.description || "No description"}
                  </CardDescription>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={gallery.profiles.avatar_url} />
                      <AvatarFallback>
                        {gallery.profiles.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {gallery.profiles.username}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-4 text-sm text-muted-foreground pt-0">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {gallery.gallery_likes.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {gallery.gallery_comments.length}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredGalleries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No galleries found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
