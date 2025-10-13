import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ShimmerButton from "@/components/ui/shimmer-button";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import TextShimmer from "@/components/ui/text-shimmer";
import Marquee from "@/components/ui/marquee";
import Link from "next/link";
import Image from "next/image";
import { 
  Brain, 
  Search, 
  GitCommit, 
  Mic, 
  Zap, 
  Users, 
  FileText, 
  Github, 
  ArrowRight,
  Code2,
  Sparkles,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  Star
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/logo-full.svg" alt="Kitsune" width={180} height={40} />
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#tech" className="text-sm font-medium hover:text-primary transition-colors">
              Technology
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 md:py-32 overflow-hidden">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          className="absolute inset-0 [mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
        />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            AI-Powered Developer Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The Intelligent
            <br />
            <span className="text-primary bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Developer Collaboration
            </span>
            <br />
            Platform
          </h1>
          
          <TextShimmer className="text-xl md:text-2xl max-w-2xl mx-auto">
            Bridge code and conversation. Merge AI-driven documentation, contextual understanding, 
            and team knowledge into a unified developer ecosystem.
          </TextShimmer>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/sign-up">
              <ShimmerButton className="px-8 py-6 text-lg font-semibold">
                Start Building <ArrowRight className="ml-2 w-5 h-5" />
              </ShimmerButton>
            </Link>
            <Link href="https://github.com/nayiswftw/Kitsune" target="_blank">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
          
          <div className="pt-12">
            <p className="text-sm text-muted-foreground mb-6">Trusted by developers who value efficiency</p>
            <Marquee className="[--duration:20s]" pauseOnHover>
              <div className="flex items-center gap-12 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Code2 className="w-6 h-6" />
                  <span className="font-medium">Next.js</span>
                </div>
                <div className="flex items-center gap-2">
                  <Github className="w-6 h-6" />
                  <span className="font-medium">GitHub</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  <span className="font-medium">TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-6 h-6" />
                  <span className="font-medium">AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  <span className="font-medium">Smart Search</span>
                </div>
              </div>
            </Marquee>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative py-20 bg-muted/50 overflow-hidden">
        <DotPattern
          className="absolute inset-0 opacity-20"
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Building software as a team is hard
            </h2>
            <p className="text-lg text-muted-foreground">
              Unclear commit messages, missing documentation, scattered meeting notes, 
              and endless confusion over "who did what." Developers spend more time 
              understanding code than actually writing it.
            </p>
            <div className="pt-4">
              <TextShimmer className="text-xl font-semibold">
                Kitsune was born to change that.
              </TextShimmer>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Core Features</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Kitsune brings together code, context, and communication in one collaborative space
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={0} />
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Automatic Code Documentation</CardTitle>
                <CardDescription>
                  Instantly generates clear, structured docs for your repositories with AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={2} />
              <CardHeader>
                <Search className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Context-Aware Search</CardTitle>
                <CardDescription>
                  Find functions, classes, or files in seconds with AI understanding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={4} />
              <CardHeader>
                <GitCommit className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Commit Summaries</CardTitle>
                <CardDescription>
                  Get smart summaries of all commits without reading each log
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={6} />
              <CardHeader>
                <Mic className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Meeting Transcription</CardTitle>
                <CardDescription>
                  Automatically transcribes discussions and highlights key topics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={8} />
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Real-Time Search</CardTitle>
                <CardDescription>
                  Ask "When did we discuss X?" and find it instantly from past meetings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="relative border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 group overflow-hidden">
              <BorderBeam size={250} duration={12} delay={10} />
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Team Collaboration Hub</CardTitle>
                <CardDescription>
                  Access docs, meeting notes, and code insights from a single workspace
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative py-20 bg-muted/50 overflow-hidden">
        <DotPattern
          className="absolute inset-0 opacity-10"
          width={16}
          height={16}
          cx={1}
          cy={1}
          cr={0.5}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Get started in minutes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="relative text-center space-y-4 group">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Github className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold">1. Connect Repository</h3>
              <p className="text-muted-foreground">
                Link your GitHub repository and let Kitsune analyze your codebase
              </p>
            </div>

            <div className="relative text-center space-y-4 group">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI processes commits, generates docs, and understands your code
              </p>
            </div>

            <div className="relative text-center space-y-4 group">
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl group-hover:bg-primary/30 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold">3. Start Collaborating</h3>
              <p className="text-muted-foreground">
                Search, document, and discuss with intelligent context everywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section id="tech" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">Technology</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Built with modern tools
              </h2>
              <TextShimmer className="text-xl">
                Scalability and developer experience at its core
              </TextShimmer>
            </div>

            <Card className="relative overflow-hidden hover:shadow-xl transition-shadow">
              <BorderBeam size={300} duration={15} delay={0} />
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Frontend
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Next.js with App Router
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Tailwind CSS & shadcn/ui
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        TypeScript
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        tRPC for type-safety
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Backend
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Node.js with tRPC
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        PostgreSQL (NeonDB)
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Prisma ORM
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Docker & Docker Compose
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      AI/ML
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Gemini for embeddings
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        AssemblyAI transcription
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        LangChain integration
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Code summarization
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Integrations
                    </h3>
                    <ul className="space-y-3 text-muted-foreground">
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        GitHub API
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Clerk Authentication
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Real-time updates
                      </li>
                      <li className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Microservices architecture
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
        <AnimatedGridPattern
          numSquares={40}
          maxOpacity={0.2}
          duration={3}
          className="absolute inset-0 text-white"
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl opacity-90">
              Join developers who are making collaboration effortless, context-rich, and intelligent
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/sign-up">
              <ShimmerButton 
                className="px-8 py-6 text-lg font-semibold bg-background text-foreground"
                background="rgba(255, 255, 255, 1)"
                shimmerColor="#000000"
              >
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </ShimmerButton>
              </Link>
              <Link href="https://github.com/nayiswftw/Kitsune" target="_blank">
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 hover:scale-105 transition-transform bg-white text-foreground border-white"
              >
                <Star className="mr-2 w-5 h-5 fill-current" />
                Star on GitHub
              </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 max-h-[30vh] bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <Image src="/logo-full.svg" alt="Kitsune" width={1920} height={32} className="mt-15 " />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}