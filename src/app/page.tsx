import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2
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
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="secondary" className="px-4 py-1">
            <Sparkles className="w-3 h-3 mr-1 inline" />
            AI-Powered Developer Platform
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            The Intelligent
            <br />
            <span className="text-primary">Developer Collaboration</span>
            <br />
            Platform
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Bridge code and conversation. Merge AI-driven documentation, contextual understanding, 
            and team knowledge into a unified developer ecosystem.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Start Building <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="https://github.com/nayiswftw/Kitsune" target="_blank">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
              </Button>
            </Link>
          </div>
          
          <div className="pt-8">
            <p className="text-sm text-muted-foreground mb-4">Trusted by developers who value efficiency</p>
            <div className="flex flex-wrap gap-8 justify-center items-center opacity-60">
              <Code2 className="w-8 h-8" />
              <Github className="w-8 h-8" />
              <FileText className="w-8 h-8" />
              <MessageSquare className="w-8 h-8" />
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
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
              <p className="text-xl font-semibold text-primary">
                Kitsune was born to change that.
              </p>
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
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Brain className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Automatic Code Documentation</CardTitle>
                <CardDescription>
                  Instantly generates clear, structured docs for your repositories with AI
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Search className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Context-Aware Search</CardTitle>
                <CardDescription>
                  Find functions, classes, or files in seconds with AI understanding
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <GitCommit className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Commit Summaries</CardTitle>
                <CardDescription>
                  Get smart summaries of all commits without reading each log
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Mic className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Meeting Transcription</CardTitle>
                <CardDescription>
                  Automatically transcribes discussions and highlights key topics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Zap className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Real-Time Search</CardTitle>
                <CardDescription>
                  Ask "When did we discuss X?" and find it instantly from past meetings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
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
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Get started in minutes
            </h2>
          </div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Github className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">1. Connect Repository</h3>
              <p className="text-muted-foreground">
                Link your GitHub repository and let Kitsune analyze your codebase
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our AI processes commits, generates docs, and understands your code
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
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
              <p className="text-xl text-muted-foreground">
                Scalability and developer experience at its core
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Frontend
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Next.js with App Router</li>
                      <li>• Tailwind CSS & shadcn/ui</li>
                      <li>• TypeScript</li>
                      <li>• tRPC for type-safety</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Backend
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Node.js with tRPC</li>
                      <li>• PostgreSQL (NeonDB)</li>
                      <li>• Prisma ORM</li>
                      <li>• Docker & Docker Compose</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      AI/ML
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Gemini for embeddings</li>
                      <li>• AssemblyAI transcription</li>
                      <li>• LangChain integration</li>
                      <li>• Code summarization</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Integrations
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• GitHub API</li>
                      <li>• Clerk Authentication</li>
                      <li>• Real-time updates</li>
                      <li>• Microservices architecture</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl opacity-90">
              Join developers who are making collaboration effortless, context-rich, and intelligent
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://github.com/nayiswftw/Kitsune" target="_blank">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Github className="mr-2 w-5 h-5" />
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