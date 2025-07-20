import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Ready to Find Your
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
            {" "}
            Comedy Match?
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of people who are already finding love through laughter.
        </p>
        <Button
          size="lg"
          className="bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-12 py-4 text-xl"
        >
          Get Started for Free
          <ArrowRight className="ml-2 w-6 h-6" />
        </Button>
        <p className="text-sm text-gray-500 mt-4">No credit card required • Join in 30 seconds</p>
      </div>
    </section>
  )
}
