import { Button } from "@/components/ui/button";
import { Heart, Laugh } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Header() {

  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-rose-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-600 bg-clip-text text-transparent">
            HumorHub
          </h1>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <a
            href="#how-it-works"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            How it Works
          </a>
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </a>
{/* 
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">{user.email}</span>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
              onClick={() => (window.location.href = "/auth")}
            >
              Sign In
            </Button>
          )} */}
        </div>
      </nav>
    </header>
  );
}
