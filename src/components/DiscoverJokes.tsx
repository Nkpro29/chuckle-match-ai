import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Star, StarIcon, RefreshCw, Heart, MessageCircle, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type JokeWithProfile = Tables<"jokes"> & {
  profiles: Tables<"profiles">;
  joke_ratings: { rating: number }[];
  user_rating?: number;
};

export const DiscoverJokes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jokes, setJokes] = useState<JokeWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingJoke, setRatingJoke] = useState<string | null>(null);

  const fetchJokes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch jokes from other users with their profiles and ratings
      const { data, error } = await supabase
        .from("jokes")
        .select(`
          *,
          profiles!fk_jokes_user_id (
            username,
            display_name,
            avatar_url,
            age,
            location
          ),
          joke_ratings (
            rating,
            rater_user_id
          )
        `)
        .neq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Process the data to include user's rating and average rating
      const processedJokes = data?.map((joke) => {
        const userRating = joke.joke_ratings?.find(
          (rating) => rating.rater_user_id === user.id
        );
        
        return {
          ...joke,
          user_rating: userRating?.rating,
        };
      }) || [];

      setJokes(processedJokes);
    } catch (error) {
      console.error("Error fetching jokes:", error);
      toast({
        title: "Error",
        description: "Failed to load jokes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJokes();
  }, [user]);

  const handleRating = async (jokeId: string, rating: number) => {
    if (!user) return;

    setRatingJoke(jokeId);
    try {
      // Check if user has already rated this joke
      const existingRating = jokes.find(j => j.id === jokeId)?.user_rating;

      if (existingRating) {
        // Update existing rating
        const { error } = await supabase
          .from("joke_ratings")
          .update({ rating })
          .eq("joke_id", jokeId)
          .eq("rater_user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new rating
        const { error } = await supabase
          .from("joke_ratings")
          .insert({
            joke_id: jokeId,
            rater_user_id: user.id,
            rating,
          });

        if (error) throw error;
      }

      // Update local state
      setJokes(prev => prev.map(joke => 
        joke.id === jokeId 
          ? { ...joke, user_rating: rating }
          : joke
      ));

      toast({
        title: "Rating submitted!",
        description: `You rated this ${joke.type} ${rating} star${rating !== 1 ? 's' : ''}.`,
      });

    } catch (error) {
      console.error("Error rating joke:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRatingJoke(null);
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
          Discover Humor
        </h2>
        <p className="text-gray-600">
          Rate jokes from other users and find your humor match!
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={fetchJokes}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Jokes</span>
        </Button>
      </div>

      {jokes.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
          <CardContent className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No jokes found</h3>
            <p className="text-gray-500">
              Be the first to add some humor! Check back later for more content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-4xl mx-auto">
          {jokes.map((joke) => (
            <Card key={joke.id} className="bg-white/80 backdrop-blur-sm border-pink-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={joke.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {joke.profiles.display_name || joke.profiles.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {joke.profiles.age && `${joke.profiles.age} years old`}
                        {joke.profiles.age && joke.profiles.location && " • "}
                        {joke.profiles.location}
                      </p>
                    </div>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-gray-800 leading-relaxed">{joke.content}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Rate this:</span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          variant="ghost"
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => handleRating(joke.id, rating)}
                          disabled={ratingJoke === joke.id}
                        >
                          <Star
                            className={`h-5 w-5 ${
                              joke.user_rating && rating <= joke.user_rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {getAverageRating(joke.joke_ratings).toFixed(1)} 
                      ({joke.joke_ratings.length} rating{joke.joke_ratings.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {joke.user_rating && (
                  <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
                    ✓ You rated this {joke.user_rating} star{joke.user_rating !== 1 ? 's' : ''}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};