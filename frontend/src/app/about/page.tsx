import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BriefcaseBusiness,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const About = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-background relative">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse-glow" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse-glow" />
      </div>

      {/* Hero About Section */}
      <section className="container relative mx-auto px-4 py-16 md:py-24 z-10 animate-fade-in">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-xs animate-float">
              <Sparkles size={14} className="animate-pulse" />
              Empowering Careers Through Technology
            </div>

            {/* Heading */}
            <div className="space-y-5">
              <h1 className="text-4xl font-extrabold tracking-tight leading-tight md:text-5xl lg:text-6xl text-foreground">
                Building Future Careers with
                <span className="block mt-2 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 bg-clip-text text-transparent font-black drop-shadow-xs">
                  HireHeaven
                </span>
              </h1>

              <p className="max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
                HireHeaven connects ambitious professionals with modern
                companies through a seamless AI-powered hiring experience.
                Whether you're searching for opportunities or building your
                dream team, we make the process smarter, faster, and more human.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group rounded-2xl border border-border/80 bg-card/65 backdrop-blur-xs p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md">
                <Users className="mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />

                <h3 className="mb-2 font-bold text-foreground">Smart Connections</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect job seekers and recruiters with AI-powered matching.
                </p>
              </div>

              <div className="group rounded-2xl border border-border/80 bg-card/65 backdrop-blur-xs p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-md">
                <BriefcaseBusiness className="mb-3 text-primary transition-transform duration-300 group-hover:scale-110" />

                <h3 className="mb-2 font-bold text-foreground">Career Growth</h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  Discover opportunities tailored to your skills and goals.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link href="/job" className="w-full sm:w-auto">
                <Button className="group w-full sm:w-auto h-12 gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-lg shadow-primary/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Explore Jobs
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center">
            {/* Glow */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-primary/15 to-indigo-500/15 blur-3xl" />

            {/* Image Card */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-card/50 shadow-2xl backdrop-blur-xs transition-all duration-500 hover:scale-[1.01]">
              <div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/10 to-indigo-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <Image
                src="/about.png"
                alt="About HireHeaven"
                width={900}
                height={700}
                priority
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 z-20 rounded-2xl border border-white/10 bg-black/60 p-4 text-white backdrop-blur-md">
                <p className="text-xs font-semibold opacity-90 text-center">
                  Helping developers, designers, and companies grow together 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 mt-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-600 to-purple-700 opacity-95" />

        <div className="container relative mx-auto px-4 z-10">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                Ready to Build Your Future?
              </h2>

              <p className="mx-auto max-w-2xl text-base opacity-90 leading-relaxed">
                Join thousands of professionals already growing their careers
                with HireHeaven.
              </p>

              <div className="pt-4">
                <Link href="/job">
                  <Button className="group h-13 rounded-xl bg-white hover:bg-white/90 text-primary font-bold shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] px-8 text-sm">
                    Get Started Today
                    <ArrowRight
                      size={16}
                      className="ml-1.5 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;