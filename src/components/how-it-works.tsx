import { Card, CardContent } from "@/components/ui/card"
import { Laugh, Star, Heart } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Laugh,
      title: "1. Share Your Joke",
      description:
        "Create your profile with your funniest joke or prompt. Show off your unique sense of humor and personality.",
      gradient: "from-orange-400 to-pink-400",
    },
    {
      icon: Star,
      title: "2. Rate & Browse",
      description:
        "Discover other users' jokes and rate them. Browse through profiles and find people whose humor clicks with yours.",
      gradient: "from-pink-400 to-purple-400",
    },
    {
      icon: Heart,
      title: "3. Send Laugh Requests",
      description:
        "Found someone hilarious? Send them a laugh request to start connecting and see where the humor takes you.",
      gradient: "from-purple-400 to-indigo-400",
    },
  ]

  return (
    <section id="how-it-works" className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Three simple steps to find your comedy soulmate</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => {
          const IconComponent = step.icon
          return (
            <Card key={index} className="text-center p-8 border-0 shadow-lg bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6`}
                >
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
