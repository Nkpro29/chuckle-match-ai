import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Star, Trash2, Edit, Heart, MessageCircle, RefreshCw } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type JokeWithRatings = Tables<"jokes"> & {
  joke_ratings: { rating: number }[];
};

export const MyJokes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jokes, setJokes] = useState<JokeWithRatings[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingJoke, setDeletingJoke] = useState<string | null>(null);

  const fetchMyJokes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jokes")
        .select(`
          *,
          joke_ratings (
            rating
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJokes(data || []);
    } catch (error) {
      console.error("Error fetching my jokes:", error);
      toast({
        title: "Error",
        description: "Failed to load your jokes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJokes();
  }, [user]);

  const handleDeleteJoke = async (jokeId: string) => {
    if (!user) return;

    setDeletingJoke(jokeId);
    try {
      const { error } = await supabase
        .from("jokes")
        .delete()
        .eq("id", jokeId)
        .eq("user_id", user.id);

      if (error) throw error;

      setJokes(prev => prev.filter(joke => joke.id !== jokeId));
      toast({
        title: "Deleted!",
        description: "Your joke has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting joke:", error);
      toast({
        title: "Error",
        description: "Failed to delete joke. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingJoke(null);
    }
  };

  const getAverageRating = (ratings: { rating: number }[]) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "joke":
        return "😂";
      case "prompt":
        return "💭";
      case "story":
        return "📖";
      default:
        return "😄";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent mb-2">
          My Humor Collection
        </h2>
        <p className="text-gray-600">
          Manage your jokes and see how others are rating them!
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={fetchMyJokes}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {jokes.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No jokes yet</h3>
            <p className="text-gray-500 mb-4">
              You haven't added any jokes yet. Start sharing your humor!
            </p>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
              Add Your First Joke
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{jokes.length}</div>
                <div className="text-sm text-blue-600">Total Jokes</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {jokes.reduce((acc, joke) => acc + joke.joke_ratings.length, 0)}
                </div>
                <div className="text-sm text-yellow-600">Total Ratings</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {jokes.filter(joke => joke.joke_ratings.length > 0).length > 0
                    ? (jokes
                        .filter(joke => joke.joke_ratings.length > 0)
                        .reduce((acc, joke) => acc + getAverageRating(joke.joke_ratings), 0) /
                       jokes.filter(joke => joke.joke_ratings.length > 0).length
                      ).toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-sm text-green-600">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Jokes List */}
          <div className="grid gap-4">
            {jokes.map((joke) => (
              <Card key={joke.id} className="bg-white/80 backdrop-blur-sm border-pink-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <span>{getTypeIcon(joke.type || "joke")}</span>
                        <span className="capitalize">{joke.type}</span>
                      </Badge>
                      {joke.is_profile_joke && (
                        <Badge variant="outline" className="text-rose-500 border-rose-200">
                          <Heart className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-500">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700"
                            disabled={deletingJoke === joke.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Joke</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this joke? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteJoke(joke.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-gray-800 leading-relaxed">{joke.content}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {formatDate(joke.created_at)}</span>
                    <div className="flex items-center space-x-4">
                      {joke.joke_ratings.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>
                            {getAverageRating(joke.joke_ratings).toFixed(1)} 
                            ({joke.joke_ratings.length} rating{joke.joke_ratings.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No ratings yet</span>
                      )}
                    </div>
                  </div>

                  {joke.ai_humor_score && (
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-purple-700">AI Humor Score:</span>
                        <span className="text-sm font-bold text-purple-600">
                          {joke.ai_humor_score}/5.0
                        </span>
                      </div>
                      {joke.ai_feedback && (
                        <p className="text-sm text-purple-600">{joke.ai_feedback}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};