import { ArrowRight, Briefcase, Search, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-background py-16 md:py-24">
      {/* Background Blur Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[150px] animate-pulse-glow" />
      </div>

      <div className="container relative mx-auto px-5">
        <div className="flex flex-col-reverse items-center gap-12 md:flex-row md:gap-16">
          {/* Content Section */}
          <div className="flex flex-1 flex-col items-center md:items-start space-y-6 text-center md:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-md shadow-xs animate-float">
              <TrendingUp size={14} className="text-primary animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase text-primary">
                #1 Job Platform In India
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight md:text-5xl lg:text-6xl text-foreground">
              Find your Dream job at{" "}
              <span className="block mt-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent font-black drop-shadow-xs">
                HIREHeaven
              </span>
            </h1>

            {/* Description */}
            <p className="max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
              Connect with top employers and discover opportunities that match
              your skills. Whether you are a job seeker or recruiter, we have
              got you covered with powerful tools and a seamless experience.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-md w-full py-4">
              <div className="p-4 rounded-2xl border border-border bg-card/45 backdrop-blur-xs text-center md:text-left shadow-xs hover:border-primary/30 transition-colors">
                <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent">10K+</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Active Jobs</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card/45 backdrop-blur-xs text-center md:text-left shadow-xs hover:border-primary/30 transition-colors">
                <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent">5K+</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Companies</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card/45 backdrop-blur-xs text-center md:text-left shadow-xs hover:border-primary/30 transition-colors">
                <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-primary to-indigo-600 bg-clip-text text-transparent">50K+</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">Seekers</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row w-full sm:w-auto">
              <Link href="/job" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="group w-full sm:w-auto h-12 gap-2.5 px-8 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search size={17} />
                  Browse Jobs
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </Link>

              <Link href="/about" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 gap-2.5 px-8 rounded-xl border border-border hover:bg-accent/40 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Briefcase size={17} />
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 pt-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Free To Use</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Verified Employers</span>
              <span className="hidden sm:inline opacity-30">•</span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Secure Platform</span>
            </div>
          </div>

          {/* Image Section */}
          <div className="relative flex-1 w-full max-w-md md:max-w-none">
            <div className="group relative">
              {/* Blur Effect */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary to-indigo-500 opacity-20 blur-xl transition-opacity duration-500 group-hover:opacity-30" />

              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-500 group-hover:scale-[1.02]">
                <Image
                  src="/hero.png"
                  alt="Hero Image"
                  width={800}
                  height={600}
                  priority
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-103"
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