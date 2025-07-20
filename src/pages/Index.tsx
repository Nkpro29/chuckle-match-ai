import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Smile, Sparkles, Users, Star } from "lucide-react";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-rose-500" />
            <Smile className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">HumorHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Love Through Laughter
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your best jokes, rate others' humor, and discover your perfect match through wit and comedy!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <CardTitle>Share Your Humor</CardTitle>
              <CardDescription>
                Post your funniest jokes, witty one-liners, and humorous prompts to showcase your personality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Add a Joke</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Star className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle>Rate & Discover</CardTitle>
              <CardDescription>
                Rate jokes from other users and let our AI analyze humor compatibility for better matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">Explore Jokes</Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <CardTitle>Find Your Match</CardTitle>
              <CardDescription>
                Connect with people who share your sense of humor and start meaningful conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">View Matches</Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8">
            Join the Community
          </h3>
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-rose-500">1K+</div>
              <div className="text-gray-600">Jokes Shared</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-500">500+</div>
              <div className="text-gray-600">Happy Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">200+</div>
              <div className="text-gray-600">Matches Made</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
