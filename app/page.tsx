import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Footer } from "@/components/atutori/footer"
import { BookOpen, Sparkles, Star, Trophy, Zap, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.5} />
              <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">atutori</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            AI-Powered Learning for Kids
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl text-balance">
            Learning Made Fun with
            <span className="text-primary"> AI Magic</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            Atutori transforms education into an exciting adventure. With personalized AI tutoring, 
            gamified lessons, and engaging quizzes, your child will love learning!
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link href="/sign-up">
                Start Learning Free
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg" asChild>
              <Link href="/sign-in">I Have an Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why Kids Love Atutori
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Star}
              title="Earn XP & Level Up"
              description="Complete lessons and quizzes to earn experience points, unlock achievements, and climb the leaderboard!"
              color="oklch(0.9 0.15 95)"
            />
            <FeatureCard
              icon={Sparkles}
              title="AI Tutor Magic"
              description="Our friendly AI tutor adapts to your learning pace, explaining concepts in fun and easy-to-understand ways."
              color="oklch(0.65 0.18 175)"
            />
            <FeatureCard
              icon={Trophy}
              title="Fun Quizzes"
              description="Test your knowledge with interactive quizzes that feel more like games than tests!"
              color="oklch(0.7 0.18 145)"
            />
          </div>
        </div>
      </section>

      {/* Subjects Preview */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            Explore Amazing Subjects
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            From Math to Music, Science to Art - discover engaging lessons across all your favorite subjects!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Math", "English", "Science", "Art", "Music"].map((subject) => (
              <div
                key={subject}
                className="rounded-2xl bg-card border-2 border-border px-6 py-4 text-lg font-medium text-foreground shadow-sm"
              >
                {subject}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary to-primary/80 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <Users className="h-16 w-16 text-primary-foreground/90" />
              </div>
              <h2 className="text-3xl font-bold text-primary-foreground mb-4">
                Join Thousands of Happy Learners!
              </h2>
              <p className="text-primary-foreground/90 mb-8 max-w-lg mx-auto">
                Start your learning adventure today. It only takes a minute to create an account!
              </p>
              <Button size="lg" className="h-14 px-8 text-lg bg-white text-primary hover:bg-white/90" asChild>
                <Link href="/sign-up">Create Free Account</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

function FeatureCard({ icon: Icon, title, description, color }: FeatureCardProps) {
  return (
    <Card className="rounded-2xl border-2 hover:border-primary/20 transition-colors">
      <CardContent className="p-6">
        <div 
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-6 w-6 text-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
