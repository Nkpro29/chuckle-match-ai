import { Laugh } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <Laugh className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">HumorHub</span>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Support
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 HumorHub. All rights reserved. Made with ❤️ and lots of laughs.</p>
        </div>
      </div>
    </footer>
  )
}
