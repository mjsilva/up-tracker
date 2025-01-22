import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Github,
  BarChart2,
  Download,
  FilterIcon,
  LaptopIcon,
} from "lucide-react";
import Image from "next/image";
import { currentUserServer } from "@/lib/services/user-service";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

async function LandingPage() {
  const user = await currentUserServer();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6">
        <Link className="flex items-center justify-center" href="#">
          <BarChart2 className="h-6 w-6 text-orange-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">
            UP Tracker
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="/sign-in"
          >
            Login
          </Link>
          <Link
            className="text-sm font-medium underline-offset-4 hover:underline"
            href="https://github.com/mjsilva/up-tracker"
          >
            GitHub
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full bg-gradient-to-b from-orange-50 to-white py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Your Expenses with UP Tracker
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  The open-source expense tracker for UP Bank. Install locally
                  or use our cloud solution.
                </p>
              </div>
              <div className="flex w-full flex-col justify-center gap-2 sm:flex-row">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-600/90 sm:w-52"
                  asChild
                >
                  <Link href="/sign-up">Cloud sign up</Link>
                </Button>
                <Button variant="outline" asChild className={"w-full sm:w-52"}>
                  <Link href="https://github.com/mjsilva/up-tracker">
                    <Github className="mr-2 h-4 w-4" /> View on GitHub
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full bg-white py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              Features
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<BarChart2 className="h-10 w-10 text-orange-500" />}
                title="Expense Tracking"
                description="Easily track your expenses with our intuitive interface."
              />
              <FeatureCard
                icon={<FilterIcon className="h-10 w-10 text-orange-500" />}
                title="Advance Filters"
                description="Search transactions, filter by categories, and set custom date ranges to gain deeper insights into your finances."
              />
              <FeatureCard
                icon={<LaptopIcon className="h-10 w-10 text-orange-500" />}
                title="Access Anywhere, Anytime"
                description="Track your expenses on any device with our web-based platform - no downloads required."
              />
              <FeatureCard
                icon={<Download className="h-10 w-10 text-orange-500" />}
                title="Local Installation"
                description="Prefer to keep things local? Install UP Tracker on your own machine."
              />
              <FeatureCard
                icon={<Github className="h-10 w-10 text-orange-500" />}
                title="Open Source"
                description="Contribute to the project or customize it to fit your needs."
              />
              <FeatureCard
                icon={<BarChart2 className="h-10 w-10 text-orange-500" />}
                title="Insightful Analytics"
                description="Gain valuable insights into your spending habits with detailed reports."
              />
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-50 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-5xl">
              Discover UP Tracker Features
            </h2>
            <div className="grid gap-12 lg:gap-24">
              <FeatureDeepDive
                title="Intuitive Dashboard"
                description="Get a quick overview of your finances with our easy-to-read dashboard."
                imageSrc="https://p198.p4.n0.cdn.zight.com/items/p9u4klP2/60bab661-a965-4712-a2da-c208dd578627.png"
                imageAlt="UP Tracker Dashboard"
                reverse={false}
              />
              <FeatureDeepDive
                title="Detailed Transaction Analysis"
                description="Gain deeper insights into your spending with powerful search, category filters, and custom date ranges. Stay on top of your finances effortlessly."
                imageSrc="https://p198.p4.n0.cdn.zight.com/items/BlumxJ4q/d094ba8e-1292-4fc8-97f3-174e0bd59863.png"
                imageAlt="UP Tracker Transaction Analysis"
                reverse={true}
              />
            </div>
          </div>
        </section>
        <section
          id="get-started"
          className="w-full bg-orange-50 py-12 md:py-24 lg:py-32"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Get Started with UP Tracker
                </h2>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Choose the option that works best for you. Start tracking your
                  expenses today!
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-600/90"
                  asChild
                >
                  <Link href="/sign-up">Use Cloud Solution</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="https://github.com/mjsilva/up-tracker">
                    Install Locally
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex w-full shrink-0 flex-col items-center gap-2 border-t px-4 py-6 sm:flex-row md:px-6">
        <p className="text-xs text-gray-500">
          Up Tracker is an independent hobby project and is not affiliated,
          associated, authorised, endorsed by, or in any way officially
          connected with Up Bank or its parent company, Bendigo and Adelaide
          Bank Limited. All product and company names are trademarks™ or
          registered® trademarks of their respective holders. Use of them does
          not imply any affiliation or endorsement by them.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

function FeatureDeepDive({
  title,
  description,
  imageSrc,
  imageAlt,
  reverse,
}: {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  reverse: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-12`}
    >
      <div className="w-full lg:w-1/2">
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>
      <div className="w-full space-y-4 lg:w-1/2">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default LandingPage;
