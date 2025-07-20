import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

export const AddJoke = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [type, setType] = useState<"joke" | "prompt" | "story">("joke");
  const [isProfileJoke, setIsProfileJoke] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !content.trim()) {
      toast({
        title: "Error",
        description: "Please enter your joke content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("jokes")
        .insert({
          user_id: user.id,
          content: content.trim(),
          type,
          is_profile_joke: isProfileJoke,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your joke has been added successfully.",
      });

      // Reset form
      setContent("");
      setType("joke");
      setIsProfileJoke(false);
    } catch (error) {
      console.error("Error adding joke:", error);
      toast({
        title: "Error",
        description: "Failed to add your joke. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span>Add Your Humor</span>
          </CardTitle>
          <CardDescription>
            Share your best jokes, funny stories, or conversation starters to connect with others!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Content Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="type">Content Type</Label>
              <Select value={type} onValueChange={(value: "joke" | "prompt" | "story") => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joke">Joke</SelectItem>
                  <SelectItem value="prompt">Conversation Starter</SelectItem>
                  <SelectItem value="story">Funny Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <Label htmlFor="content">
                Your {type === "joke" ? "Joke" : type === "prompt" ? "Conversation Starter" : "Funny Story"}
              </Label>
              <Textarea
                id="content"
                placeholder={
                  type === "joke"
                    ? "Why don't scientists trust atoms? Because they make up everything!"
                    : type === "prompt"
                    ? "If you could have dinner with any fictional character, who would it be and what would you order?"
                    : "Tell us about a funny or embarrassing moment that still makes you laugh..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 text-right">
                {content.length}/500 characters
              </div>
            </div>

            {/* Profile Joke Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="profile-joke"
                checked={isProfileJoke}
                onCheckedChange={setIsProfileJoke}
              />
              <Label htmlFor="profile-joke" className="text-sm">
                Feature this on my profile (others will see this first when viewing your profile)
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Add {type === "joke" ? "Joke" : type === "prompt" ? "Prompt" : "Story"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-lg">💡 Tips for Great Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Be original:</strong> Share your unique sense of humor</p>
          <p>• <strong>Keep it clean:</strong> Avoid offensive or inappropriate content</p>
          <p>• <strong>Be authentic:</strong> Let your personality shine through</p>
          <p>• <strong>Test it out:</strong> If it makes you laugh, it might make others laugh too!</p>
        </CardContent>
      </Card>
    </div>
  );
};