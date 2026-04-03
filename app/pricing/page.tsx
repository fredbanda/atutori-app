"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Footer } from "@/components/atutori/footer"
import {
  CheckCircle,
  Star,
  Sparkles,
  GraduationCap,
  Users,
  Video,
  Brain,
  Trophy,
  ArrowLeft,
  Loader2,
  Zap,
} from "lucide-react"

interface Package {
  id: string
  name: string
  description: string
  price: number
  interval: string
  features: string[]
  maxStudents: number
  isPopular: boolean
}

export default function PricingPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  useEffect(() => {
    async function fetchPackages() {
      try {
        const response = await fetch("/api/packages")
        if (response.ok) {
          const data = await response.json()
          setPackages(data.packages || [])
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const getYearlyPrice = (monthlyPrice: number) => {
    // 20% discount for yearly
    return Math.round(monthlyPrice * 12 * 0.8)
  }

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "starter":
        return <Star className="h-6 w-6" />
      case "family":
        return <Users className="h-6 w-6" />
      case "premium":
        return <Sparkles className="h-6 w-6" />
      default:
        return <GraduationCap className="h-6 w-6" />
    }
  }

  const getGradient = (index: number, isPopular: boolean) => {
    if (isPopular) return "from-primary to-accent"
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-teal-500 to-green-500",
      "from-amber-500 to-orange-500",
    ]
    return gradients[index % gradients.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Simple, Affordable Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Choose the perfect plan for your family. All plans include access to our AI tutor and gamified learning experience.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingInterval === "monthly" ? "font-medium" : "text-muted-foreground"}>
              Monthly
            </span>
            <Switch
              checked={billingInterval === "yearly"}
              onCheckedChange={(checked) => setBillingInterval(checked ? "yearly" : "monthly")}
            />
            <span className={billingInterval === "yearly" ? "font-medium" : "text-muted-foreground"}>
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => {
            const displayPrice = billingInterval === "yearly" 
              ? getYearlyPrice(pkg.price) 
              : pkg.price

            return (
              <Card 
                key={pkg.id} 
                className={`relative overflow-hidden ${
                  pkg.isPopular 
                    ? "border-2 border-primary shadow-xl scale-105" 
                    : "border"
                }`}
              >
                {/* Popular Badge */}
                {pkg.isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <CardHeader className={pkg.isPopular ? "pt-12" : ""}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(index, pkg.isPopular)} flex items-center justify-center text-white mb-4`}>
                    {getIcon(pkg.name)}
                  </div>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <p className="text-muted-foreground">{pkg.description}</p>
                </CardHeader>

                <CardContent>
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatPrice(displayPrice)}</span>
                    <span className="text-muted-foreground">
                      /{billingInterval === "yearly" ? "year" : "month"}
                    </span>
                    {billingInterval === "yearly" && (
                      <p className="text-sm text-green-600 mt-1">
                        {formatPrice(Math.round(displayPrice / 12))}/month billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0" />
                      <span>Up to {pkg.maxStudents} student{pkg.maxStudents > 1 ? "s" : ""}</span>
                    </li>
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Button 
                    className="w-full rounded-xl h-12"
                    variant={pkg.isPopular ? "default" : "outline"}
                    onClick={() => router.push("/sign-up")}
                  >
                    Get Started
                    <Zap className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            All Plans Include
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Brain className="h-6 w-6" />, title: "AI-Powered Learning", desc: "Personalized lessons adapted to each student" },
              { icon: <Trophy className="h-6 w-6" />, title: "Gamified Experience", desc: "XP, levels, and achievements to stay motivated" },
              { icon: <Video className="h-6 w-6" />, title: "Video Lessons", desc: "Upload custom videos for your students" },
              { icon: <GraduationCap className="h-6 w-6" />, title: "Grade 1-12 Content", desc: "Curriculum for all grade levels" },
            ].map((feature, i) => (
              <Card key={i} className="text-center p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "Can I switch plans anytime?", a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle." },
              { q: "Is there a free trial?", a: "We offer a 7-day free trial on all plans. No credit card required to start." },
              { q: "What ages is Atutori suitable for?", a: "Atutori is designed for students from Grade 1 (ages 6-7) through Grade 12 (ages 17-18)." },
              { q: "Can parents track progress?", a: "Absolutely! The admin dashboard lets parents and tutors monitor student progress, assign videos, and view performance." },
            ].map((faq, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-white/80 mb-8">
            Join thousands of families using Atutori to make learning fun and effective.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="rounded-xl h-14 px-8"
            onClick={() => router.push("/sign-up")}
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
