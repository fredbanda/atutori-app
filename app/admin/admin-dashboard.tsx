"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import {
  CreditCard,
  Users,
  Video,
  Settings,
  LogOut,
  Crown,
  CheckCircle,
  AlertCircle,
  Plus,
  Calendar,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  id: string;
  packageName: string;
  status: string;
  currentPeriodEnd: string;
  price: number;
  interval: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  features: string[];
  maxStudents: number;
  isPopular: boolean;
}

export function AdminDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchData() {
      try {
        const [subRes, pkgRes] = await Promise.all([
          fetch("/api/subscription"),
          fetch("/api/packages"),
        ]);

        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData.subscription);
        }

        if (pkgRes.ok) {
          const pkgData = await pkgRes.json();
          setPackages(pkgData.packages || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Eatutori Admin</h1>
              <p className="text-sm text-muted-foreground">
                Manage your subscription
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Current Plan Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Plan
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {subscription?.packageName || "No Plan"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscription
                      ? `${formatPrice(subscription.price)}/${
                          subscription.interval
                        }`
                      : "Choose a plan to get started"}
                  </p>
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Status
                  </CardTitle>
                  {subscription?.status === "active" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold capitalize">
                    {subscription?.status || "Inactive"}
                  </div>
                  {subscription && (
                    <p className="text-sm text-muted-foreground">
                      Renews {formatDate(subscription.currentPeriodEnd)}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Students Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0 / 3</div>
                  <p className="text-sm text-muted-foreground">
                    Active student accounts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => setActiveTab("subscription")}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <span className="font-medium">Manage Subscription</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => setActiveTab("students")}
              >
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Add Student</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => setActiveTab("media")}
              >
                <Video className="h-5 w-5 text-primary" />
                <span className="font-medium">Upload Video</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2"
              >
                <Settings className="h-5 w-5 text-primary" />
                <span className="font-medium">Settings</span>
              </Button>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            {subscription ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div>
                        <h4 className="font-bold text-lg">
                          {subscription.packageName}
                        </h4>
                        <p className="text-muted-foreground">
                          {formatPrice(subscription.price)} /{" "}
                          {subscription.interval}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subscription.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Next billing date
                        </p>
                        <p className="font-medium">
                          {formatDate(subscription.currentPeriodEnd)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline">Change Plan</Button>
                      <Button variant="destructive" className="bg-red-600">
                        Cancel Subscription
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">
                  No Active Subscription
                </h3>
                <p className="text-muted-foreground mb-6">
                  Choose a plan to unlock all features and start learning!
                </p>
                <Button onClick={() => router.push("/pricing")}>
                  View Pricing Plans
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Available Plans */}
            <h3 className="text-lg font-bold mt-8 mb-4">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={pkg.isPopular ? "border-primary border-2" : ""}
                >
                  {pkg.isPopular && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">
                      {formatPrice(pkg.price)}
                      <span className="text-base font-normal text-muted-foreground">
                        /{pkg.interval}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {pkg.description}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={pkg.isPopular ? "default" : "outline"}
                    >
                      {subscription?.packageName === pkg.name
                        ? "Current Plan"
                        : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Students</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No students added yet</p>
                  <p className="text-sm">
                    Add students to track their progress
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Uploaded Videos</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No videos uploaded yet</p>
                  <p className="text-sm">
                    Upload educational videos for your students
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

