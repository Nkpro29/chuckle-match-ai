import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100">
        🎭 The Future of Dating is Here
      </Badge>
      <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
        Find Your Match by
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
          {" "}
          Sharing Laughs
        </span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        Skip the small talk. Share your best jokes, rate others' humor, and
        connect with people who truly get your sense of comedy.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-8 py-3 text-lg"
          asChild
        >
          <Link to={"/auth"}>
            Start Laughing <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-gray-300 text-gray-700 px-8 py-3 text-lg bg-transparent"
        >
          See How It Works
        </Button>
      </div>

      {/* Hero Image Placeholder */}
      <div className="mt-16 relative">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
          <img
            src="/connect.png"
            alt="HumorHub App Interface"
            className="w-full h-auto rounded-lg"
          />
        </div>
      </div>
    </section>
  );
}
