import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, UserPlus, UserMinus, Heart, Eye, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  bio: string;
}

interface Gallery {
  id: string;
  name: string;
  description: string;
  view_count: number;
  gallery_likes: { id: string }[];
  gallery_comments: { id: string }[];
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load galleries
      const { data: galleriesData, error: galleriesError } = await supabase
        .from("galleries")
        .select(`
          *,
          gallery_likes(id),
          gallery_comments(id)
        `)
        .eq("user_id", userId)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (galleriesError) throw galleriesError;
      setGalleries(galleriesData || []);

      // Load follow status
      if (user?.id && user.id !== userId) {
        const { data: followData } = await supabase
          .from("user_follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", userId)
          .maybeSingle();

        setIsFollowing(!!followData);
      }

      // Load follow counts
      const { count: followersCount } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      const { count: followingCountData } = await supabase
        .from("user_follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", userId);

      setFollowerCount(followersCount || 0);
      setFollowingCount(followingCountData || 0);
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to follow users");
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("user_follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
        setIsFollowing(false);
        setFollowerCount((c) => c - 1);
        toast.success("Unfollowed");
      } else {
        await supabase
          .from("user_follows")
          .insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
        toast.success("Following!");
      }
    } catch (error: any) {
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center">
        <div>Profile not found</div>
      </div>
    );
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => navigate("/")} variant="outline">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="mb-8 backdrop-blur-sm bg-card/50 border-border/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="text-3xl">
                  {profile.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{profile.username}</h1>
                <p className="text-muted-foreground mb-4">{profile.bio || "No bio yet"}</p>
                <div className="flex gap-6 justify-center md:justify-start">
                  <div>
                    <span className="font-bold">{galleries.length}</span>
                    <span className="text-muted-foreground ml-1">Galleries</span>
                  </div>
                  <div>
                    <span className="font-bold">{followerCount}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-bold">{followingCount}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                </div>
              </div>
              {!isOwnProfile && currentUserId && (
                <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                  {isFollowing ? (
                    <>
                      <UserMinus className="mr-2 h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Galleries */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
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
                <h3 className="font-bold mb-2 line-clamp-1">{gallery.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {gallery.description || "No description"}
                </p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {gallery.gallery_likes.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {gallery.gallery_comments.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No public galleries yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
