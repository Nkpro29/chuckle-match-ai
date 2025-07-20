import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Calendar, FileText } from "lucide-react";

interface ProfileSetupProps {
  onComplete: () => void;
}

export const ProfileSetup = ({ onComplete }: ProfileSetupProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    display_name: "",
    age: "",
    bio: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.username.trim()) {
      toast({
        title: "Error",
        description: "Username is required.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check if username is already taken
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", formData.username.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingProfile) {
        toast({
          title: "Username taken",
          description: "Please choose a different username.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Create profile
      const { error } = await supabase
        .from("profiles")
        .insert({
          user_id: user.id,
          username: formData.username.trim(),
          display_name: formData.display_name.trim() || null,
          age: formData.age ? parseInt(formData.age) : null,
          bio: formData.bio.trim() || null,
          location: formData.location.trim() || null,
        });

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Welcome to HumorMatch! Let's find your perfect match.",
      });

      onComplete();
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Tell us a bit about yourself to get started with HumorMatch!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username - Required */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Username *</span>
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
                maxLength={50}
              />
              <p className="text-sm text-gray-500">
                This will be your unique identifier on the platform.
              </p>
            </div>

            {/* Display Name - Optional */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                type="text"
                placeholder="How should others see your name?"
                value={formData.display_name}
                onChange={(e) => handleInputChange("display_name", e.target.value)}
                maxLength={100}
              />
              <p className="text-sm text-gray-500">
                Optional: A friendly name others will see (defaults to username).
              </p>
            </div>

            {/* Age - Optional */}
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Age</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Your age"
                value={formData.age}
                onChange={(e) => handleInputChange("age", e.target.value)}
                min="18"
                max="100"
              />
            </div>

            {/* Location - Optional */}
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                maxLength={100}
              />
            </div>

            {/* Bio - Optional */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Bio</span>
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself, your interests, what makes you laugh..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <div className="text-sm text-gray-500 text-right">
                {formData.bio.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.username.trim()}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700"
            >
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Profile Tips</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Choose a memorable username that represents you</li>
              <li>• A good bio helps others understand your personality</li>
              <li>• You can always update your profile later</li>
              <li>• Be authentic - humor is personal!</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};