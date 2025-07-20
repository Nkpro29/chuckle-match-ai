import { Zap, Users, Star, Laugh, Heart, ArrowRight } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Zap,
      title: "Quick & Fun",
      description: "No lengthy questionnaires. Just share a joke and start connecting instantly.",
      color: "orange",
    },
    {
      icon: Users,
      title: "Real Connections",
      description: "Connect with people who share your sense of humor and personality.",
      color: "pink",
    },
    {
      icon: Star,
      title: "Rate & Discover",
      description: "Rate jokes, discover top comedians, and find your perfect match.",
      color: "purple",
    },
    {
      icon: Laugh,
      title: "Humor First",
      description: "Break the ice with laughter instead of awkward pickup lines.",
      color: "yellow",
    },
    {
      icon: Heart,
      title: "Genuine Matches",
      description: "Find people who appreciate your unique brand of comedy.",
      color: "green",
    },
    {
      icon: ArrowRight,
      title: "Simple & Clean",
      description: "Minimal design focused on what matters - your personality and humor.",
      color: "blue",
    },
  ]

  return (
    <section id="features" className="bg-white/50 backdrop-blur py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why HumorHub?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dating apps are boring. We're bringing the fun back to finding love.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="flex items-start space-x-4">
                <div
                  className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}
                >
                  <IconComponent className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
