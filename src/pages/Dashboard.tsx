import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Heart, Search, Users } from "lucide-react";
import { AddJoke } from "@/components/AddJoke";
import { DiscoverJokes } from "@/components/DiscoverJokes";
import { MyJokes } from "@/components/MyJokes";
import { FindMatches } from "@/components/FindMatches";
import { ProfileSetup } from "@/components/ProfileSetup";
import { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchProfile();
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show profile setup if user doesn't have a profile
  if (!profile) {
    return <ProfileSetup onComplete={fetchProfile} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-pink-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={"/"} className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
              HumorHub
            </h1>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="discover"
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger
              value="add-joke"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Joke</span>
            </TabsTrigger>
            <TabsTrigger
              value="my-jokes"
              className="flex items-center space-x-2"
            >
              <Heart className="h-4 w-4" />
              <span>My Jokes</span>
            </TabsTrigger>
            <TabsTrigger
              value="matches"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Matches</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            <DiscoverJokes />
          </TabsContent>

          <TabsContent value="add-joke" className="space-y-6">
            <AddJoke />
          </TabsContent>

          <TabsContent value="my-jokes" className="space-y-6">
            <MyJokes />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <FindMatches />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
