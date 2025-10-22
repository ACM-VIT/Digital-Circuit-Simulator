import Image from "next/image"
import Link from "next/link"

export default function Hero() {
  return (
    <section id="hero" className="card my-8 relative overflow-hidden shadow-md">
      <div className="p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-start">
        <div className="w-full md:w-3/5 z-10">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-medium leading-tight">
            Design & Test
            <span className="block text-[#7A7FEE]">Digital Circuits</span>
          </h1>
          <p className="my-6 text-sm md:text-base max-w-md text-gray-300">
            Build digital logic circuits visually with drag-and-drop components. 
            Test your designs in real-time with our interactive simulator.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/circuit" className="btn-primary">
              Start Building
            </Link>
            <a href="#features" className="btn-secondary text-white">
              Learn More
            </a>
          </div>
        </div>

        <div className="hidden md:flex md:w-2/5 md:absolute md:right-0 md:top-0 md:bottom-0 md:items-center">
          <Image
            src="/8bvaKz01 (1).svg"
            alt="Circuit Illustration"
            width={500}
            height={500}
            className="w-full h-auto md:h-full md:w-auto md:object-cover md:object-left"
          />
        </div>
      </div>
    </section>
  )
}
