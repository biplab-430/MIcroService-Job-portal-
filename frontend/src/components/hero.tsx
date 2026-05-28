import { ArrowRight, Briefcase, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-secondary">
      {/* Background Blur Effects */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-500 blur-3xl" />

        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-red-500 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-5 py-16 md:py-24">
        <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:gap-16">
          {/* Content Section */}
          <div className="flex flex-1 flex-col items-center space-y-6 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 px-4 py-2 backdrop-blur-sm">
              <TrendingUp size={16} className="text-blue-600" />

              <span className="text-sm font-medium">
                #1 Job Platform In India
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Find your Dream job at{" "}
              <span className="inline-block">
                HIRE<span className="text-red-500">Heaven</span>
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-lg leading-relaxed opacity-80 md:text-xl">
              Connect with top employers and discover opportunities that match
              your skills. Whether you are a job seeker or recruiter, we have
              got you covered with powerful tools and a seamless experience.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 py-4 md:justify-start">
              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">10K+</p>
                <p className="text-sm opacity-70">Active Jobs</p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-3xl font-bold text-blue-600">5K+</p>
                <p className="text-sm opacity-70">Companies</p>
              </div>

              <div className="text-center md:text-left lg:text-center">
                <p className="text-3xl font-bold text-blue-600">50K+</p>
                <p className="text-sm opacity-70">Job Seekers</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link href="/job">
                <Button
                  size="lg"
                  className="group h-12 gap-2 px-8 text-base transition-all"
                >
                  <Search size={18} />

                  Browse Jobs

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>

              <Link href="/about">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 gap-2 px-8 text-base"
                >
                  <Briefcase size={18} />

                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-2 pt-4 text-sm opacity-60">
              <span>✔️ Free To Use</span>

              <span>•</span>

              <span>✔️ Verified Employers</span>

              <span>•</span>

              <span>✔️ Secure Platform</span>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative flex-1">
            <div className="group relative">
              {/* Blur Effect */}
              <div className="absolute inset-4 rounded-2xl bg-blue-400 opacity-20 blur-xl transition-opacity group-hover:opacity-30" />

              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl border-4 border-background shadow-2xl">
                <Image
                  src="/hero.png"
                  alt="Hero Image"
                  width={800}
                  height={600}
                  priority
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;