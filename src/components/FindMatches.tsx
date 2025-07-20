import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, Star, MessageCircle, RefreshCw, Users, Sparkles, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type ProfileWithCompatibility = Tables<"profiles"> & {
  jokes: (Tables<"jokes"> & {
    joke_ratings: { rating: number }[];
  })[];
  compatibility_score: number;
  mutual_ratings: number;
  existing_match?: Tables<"matches">;
};

export const FindMatches = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [potentialMatches, setPotentialMatches] = useState<ProfileWithCompatibility[]>([]);
  const [currentMatches, setCurrentMatches] = useState<Tables<"matches">[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingMatch, setProcessingMatch] = useState<string | null>(null);

  const calculateCompatibilityScore = (
    userRatings: { joke_id: string; rating: number }[],
    otherUserJokes: { id: string; joke_ratings: { rating: number }[] }[]
  ) => {
    let totalScore = 0;
    let mutualRatings = 0;

    // Find jokes that both users have interacted with
    userRatings.forEach(userRating => {
      const joke = otherUserJokes.find(j => j.id === userRating.joke_id);
      if (joke && joke.joke_ratings.length > 0) {
        const avgRating = joke.joke_ratings.reduce((sum, r) => sum + r.rating, 0) / joke.joke_ratings.length;
        // Calculate similarity (closer ratings = higher compatibility)
        const similarity = 1 - Math.abs(userRating.rating - avgRating) / 4; // Normalize to 0-1
        totalScore += similarity;
        mutualRatings++;
      }
    });

    return {
      score: mutualRatings > 0 ? (totalScore / mutualRatings) * 100 : 0,
      mutualRatings
    };
  };

  const fetchPotentialMatches = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user's ratings
      const { data: userRatings, error: ratingsError } = await supabase
        .from("joke_ratings")
        .select("joke_id, rating")
        .eq("rater_user_id", user.id);

      if (ratingsError) throw ratingsError;

      // Get other users with their jokes and ratings
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          *,
          jokes (
            id,
            content,
            type,
            is_profile_joke,
            joke_ratings (
              rating
            )
          )
        `)
        .neq("user_id", user.id);

      if (profilesError) throw profilesError;

      // Get existing matches
      const { data: existingMatches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) throw matchesError;

      // Calculate compatibility scores
      const matchesWithScores = profiles?.map(profile => {
        const compatibility = calculateCompatibilityScore(
          userRatings || [],
          profile.jokes || []
        );

        const existingMatch = existingMatches?.find(match => 
          match.user1_id === profile.user_id || match.user2_id === profile.user_id
        );

        return {
          ...profile,
          compatibility_score: compatibility.score,
          mutual_ratings: compatibility.mutualRatings,
          existing_match: existingMatch
        };
      }).filter(profile => 
        profile.mutual_ratings >= 2 && // At least 2 mutual interactions
        !profile.existing_match // Not already matched
      ).sort((a, b) => b.compatibility_score - a.compatibility_score) || [];

      setPotentialMatches(matchesWithScores);

      // Set current matches
      const currentMatchProfiles = profiles?.filter(profile => 
        existingMatches?.some(match => 
          (match.user1_id === profile.user_id || match.user2_id === profile.user_id) &&
          match.status === 'mutual'
        )
      ) || [];

      setCurrentMatches(existingMatches?.filter(match => match.status === 'mutual') || []);

    } catch (error) {
      console.error("Error fetching potential matches:", error);
      toast({
        title: "Error",
        description: "Failed to load potential matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPotentialMatches();
  }, [user]);

  const handleLike = async (profileUserId: string) => {
    if (!user) return;

    setProcessingMatch(profileUserId);
    try {
      // Check if the other user has already liked this user
      const { data: existingMatch, error: checkError } = await supabase
        .from("matches")
        .select("*")
        .eq("user1_id", profileUserId)
        .eq("user2_id", user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingMatch) {
        // It's a mutual match! Update status
        const { error: updateError } = await supabase
          .from("matches")
          .update({ status: 'mutual' })
          .eq("id", existingMatch.id);

        if (updateError) throw updateError;

        toast({
          title: "🎉 It's a Match!",
          description: "You both liked each other! Start chatting now.",
        });
      } else {
        // Create new match request
        const { error: insertError } = await supabase
          .from("matches")
          .insert({
            user1_id: user.id,
            user2_id: profileUserId,
            status: 'pending'
          });

        if (insertError) throw insertError;

        toast({
          title: "Like sent!",
          description: "We'll let you know if they like you back.",
        });
      }

      // Remove from potential matches
      setPotentialMatches(prev => prev.filter(p => p.user_id !== profileUserId));

    } catch (error) {
      console.error("Error processing like:", error);
      toast({
        title: "Error",
        description: "Failed to process like. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingMatch(null);
    }
  };

  const handlePass = async (profileUserId: string) => {
    if (!user) return;

    setProcessingMatch(profileUserId);
    try {
      // Create a declined match to avoid showing again
      const { error } = await supabase
        .from("matches")
        .insert({
          user1_id: user.id,
          user2_id: profileUserId,
          status: 'declined'
        });

      if (error) throw error;

      // Remove from potential matches
      setPotentialMatches(prev => prev.filter(p => p.user_id !== profileUserId));

      toast({
        title: "Passed",
        description: "We won't show this profile again.",
      });

    } catch (error) {
      console.error("Error processing pass:", error);
      toast({
        title: "Error",
        description: "Failed to process pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingMatch(null);
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
          Find Your Humor Match
        </h2>
        <p className="text-gray-600">
          Discover people who share your sense of humor!
        </p>
      </div>

      {/* Current Matches */}
      {currentMatches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <span>Your Matches ({currentMatches.length})</span>
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* This would show current matches - simplified for now */}
            <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-rose-500 mx-auto mb-2" />
                <p className="text-sm text-rose-600">
                  You have {currentMatches.length} mutual match{currentMatches.length !== 1 ? 'es' : ''}!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Potential Matches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Potential Matches</span>
          </h3>
          <Button
            onClick={fetchPotentialMatches}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {potentialMatches.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No matches found</h3>
              <p className="text-gray-500 mb-4">
                Rate more jokes to find people with similar humor!
              </p>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700">
                Discover Jokes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 max-w-4xl mx-auto">
            {potentialMatches.slice(0, 10).map((profile) => (
              <Card key={profile.user_id} className="bg-white/80 backdrop-blur-sm border-pink-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {profile.display_name || profile.username}
                      </h3>
                      <p className="text-gray-600">
                        {profile.age && `${profile.age} years old`}
                        {profile.age && profile.location && " • "}
                        {profile.location}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {profile.compatibility_score.toFixed(0)}% Match
                        </Badge>
                        <Badge variant="outline">
                          {profile.mutual_ratings} mutual ratings
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && (
                    <p className="text-gray-700 italic">"{profile.bio}"</p>
                  )}

                  {/* Featured Joke */}
                  {profile.jokes.find(j => j.is_profile_joke) && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          Featured Joke
                        </Badge>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {profile.jokes.find(j => j.is_profile_joke)?.content}
                      </p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {profile.jokes.length}
                      </div>
                      <div className="text-xs text-blue-600">Jokes Shared</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-yellow-600">
                        {profile.jokes.reduce((acc, joke) => 
                          acc + joke.joke_ratings.reduce((sum, r) => sum + r.rating, 0), 0
                        ) / Math.max(profile.jokes.reduce((acc, joke) => acc + joke.joke_ratings.length, 0), 1) || 0}
                      </div>
                      <div className="text-xs text-yellow-600">Avg Rating</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                      onClick={() => handlePass(profile.user_id)}
                      disabled={processingMatch === profile.user_id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Pass
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
                      onClick={() => handleLike(profile.user_id)}
                      disabled={processingMatch === profile.user_id}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};