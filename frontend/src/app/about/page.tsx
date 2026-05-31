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
    <div className="min-h-screen overflow-hidden">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
      </div>

      {/* Hero About Section */}
      <section className="container relative mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              <Sparkles size={16} />
              Empowering Careers Through Technology
            </div>

            {/* Heading */}
            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Building Future Careers with
                <span className="bg-linear-to-r from-blue-600 to-red-500 bg-clip-text text-transparent">
                  {" "}
                  HireHeaven
                </span>
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed opacity-80 md:text-xl">
                HireHeaven connects ambitious professionals with modern
                companies through a seamless AI-powered hiring experience.
                Whether you're searching for opportunities or building your
                dream team, we make the process smarter, faster, and more human.
              </p>
            </div>

            {/* Features */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="group rounded-2xl border bg-background/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg">
                <Users className="mb-3 text-blue-600 transition-transform duration-300 group-hover:scale-110" />

                <h3 className="mb-2 font-semibold">Smart Connections</h3>

                <p className="text-sm opacity-75">
                  Connect job seekers and recruiters with AI-powered matching.
                </p>
              </div>

              <div className="group rounded-2xl border bg-background/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500 hover:shadow-lg">
                <BriefcaseBusiness className="mb-3 text-red-500 transition-transform duration-300 group-hover:scale-110" />

                <h3 className="mb-2 font-semibold">Career Growth</h3>

                <p className="text-sm opacity-75">
                  Discover opportunities tailored to your skills and goals.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-4 pt-2 sm:flex-row">
              <Link href="/job">
                <Button className="group h-12 rounded-xl bg-linear-to-r from-blue-600 to-blue-500 px-8 text-base shadow-lg transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-red-500">
                  Explore Jobs

                  <ArrowRight
                    size={18}
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Button>
              </Link>

      </div>
          </div>

          {/* Right Image */}
          <div className="relative flex justify-center">
            {/* Glow */}
            <div className="absolute inset-0 rounded-[2rem] bg-linear-to-r from-blue-500/20 to-red-500/20 blur-3xl" />

            {/* Image Card */}
            <div className="group relative overflow-hidden rounded-[2rem] border border-white/20 bg-background/70 shadow-2xl backdrop-blur-sm">
              <div className="absolute inset-0 z-10 bg-linear-to-tr from-blue-500/10 to-red-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <Image
                src="/about.png"
                alt="About HireHeaven"
                width={900}
                height={700}
                priority
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 z-20 rounded-2xl border border-white/20 bg-black/40 p-4 text-white backdrop-blur-md">
                <p className="text-sm font-medium opacity-90">
                  Helping developers, designers, and companies grow together 🚀
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-blue-500 to-red-500 opacity-95" />

        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold leading-tight md:text-5xl">
                Ready to Build Your Future?
              </h2>

              <p className="mx-auto max-w-2xl text-lg opacity-90 md:text-xl">
                Join thousands of professionals already growing their careers
                with HireHeaven.
              </p>

              <div className="pt-4">
                <Link href="/job">
                  <Button className="group h-14 rounded-2xl bg-white px-10 text-base font-semibold text-black shadow-xl transition-all duration-300 hover:scale-105 hover:bg-black hover:text-white">
                    Get Started Today

                    <ArrowRight
                      size={18}
                      className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
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