import Image from "next/image"
import Link from "next/link"

export default function CallToAction() {
  return (
    <section id="contact" className="card my-20 relative overflow-hidden shadow-md">
      <div className="p-8 md:p-10 lg:p-12 flex flex-col md:flex-row items-start">
        <div className="w-full md:w-3/5 z-10">
          <h2 className="text-black dark:text-white mb-6 text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
            Ready to Build Your <span className="text-[#7A7FEE] dark:text-[#7A7FEE]">First Circuit?</span>
          </h2>
          <p className="my-6 text-sm md:text-base max-w-md text-gray-700 dark:text-gray-300">
            Start creating digital logic circuits today.
          </p>
          <p className="mb-6 text-sm md:text-base max-w-md text-gray-700 dark:text-gray-300">
            Drag and drop components, connect them with wires, and test your designs in real-time. No installation required.
          </p>
          <div>
            <Link href="/circuit" className="btn-primary">
              Start Building Circuits
            </Link>
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
