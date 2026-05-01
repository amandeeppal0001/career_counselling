"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  LogOut,
  MessageCircle,
  BookOpen,
  Clock,
  User,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react"

export default function ParentDashboard() {

  const parentData = {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    children: [
      {
        id: 1,
        name: "Alex Johnson",
        grade: "Class 12",
        progress: 65,
        nextMeeting: "2024-01-25",
        recentActivity: "Completed SAT prep assessment",
        goals: 3,
        completedTasks: 12,
      },
    ],
    upcomingEvents: [
      { id: 1, title: "Parent-Teacher Conference", date: "2024-01-25", time: "2:00 PM", type: "meeting" },
      { id: 2, title: "College Application Deadline", date: "2024-02-01", time: "11:59 PM", type: "deadline" },
      { id: 3, title: "Career Fair", date: "2024-02-15", time: "10:00 AM", type: "event" },
    ],
    resources: [
      { id: 1, title: "Supporting Your Teen's Career Choices", type: "Article", readTime: "5 min" },
      { id: 2, title: "Understanding College Applications", type: "Guide", readTime: "15 min" },
      { id: 3, title: "Financial Planning for Education", type: "Webinar", duration: "45 min" },
    ],
  }

  return (
    <div className="min-h-screen bg-background">
      {}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary font-[var(--font-playfair)]">Career Advisor</h1>
              </div>
              <Badge variant="secondary" className="ml-4">
                Parent
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-[var(--font-playfair)] mb-2">Welcome, {parentData.name}!</h2>
          <p className="text-muted-foreground">
            Stay connected with your child's career journey and provide the support they need.
          </p>
        </div>

        {/* Child Overview Cards */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Your Children</h3>
          <div className="grid gap-6">
            {parentData.children.map((child) => (
              <Card key={child.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <CardDescription>{child.grade}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                      <div className="flex items-center gap-2">
                        <Progress value={child.progress} className="flex-1" />
                        <span className="text-sm font-medium">{child.progress}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                      <p className="text-2xl font-bold text-secondary">{child.goals}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                      <p className="text-2xl font-bold text-accent">{child.completedTasks}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Next Meeting</p>
                      <p className="text-sm font-medium">{new Date(child.nextMeeting).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Recent Activity:</span> {child.recentActivity}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>Important dates and meetings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {parentData.upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {event.type === "meeting" && <Users className="h-5 w-5 text-primary" />}
                        {event.type === "deadline" && <Clock className="h-5 w-5 text-destructive" />}
                        {event.type === "event" && <Calendar className="h-5 w-5 text-secondary" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()} at {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                      <MessageCircle className="h-6 w-6" />
                      <span>Message Counselor</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                      <Calendar className="h-6 w-6" />
                      <span>Schedule Meeting</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                      <TrendingUp className="h-6 w-6" />
                      <span>View Progress</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 bg-transparent">
                      <BookOpen className="h-6 w-6" />
                      <span>Access Resources</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tracking Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-[var(--font-playfair)] mb-2">Progress Tracking</h3>
              <p className="text-muted-foreground">Monitor your child's career development journey</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Progress Report</CardTitle>
                <CardDescription>Comprehensive view of your child's achievements and goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-primary/5">
                      <div className="text-3xl font-bold text-primary mb-2">65%</div>
                      <p className="text-sm text-muted-foreground">Overall Completion</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-secondary/5">
                      <div className="text-3xl font-bold text-secondary mb-2">3</div>
                      <p className="text-sm text-muted-foreground">Active Goals</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-accent/5">
                      <div className="text-3xl font-bold text-accent mb-2">12</div>
                      <p className="text-sm text-muted-foreground">Tasks Completed</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Your child is making excellent progress on their career planning journey. They have completed
                      several assessments and are actively working towards their college application goals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-[var(--font-playfair)] mb-2">Communication Hub</h3>
              <p className="text-muted-foreground">Stay connected with counselors and your child's progress</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </CardTitle>
                  <CardDescription>Recent communications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Ms. Rodriguez (Counselor)</p>
                        <p className="text-sm text-muted-foreground">2 days ago</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Alex has shown great improvement in their career assessment scores. Let's schedule a meeting to
                        discuss next steps.
                      </p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send New Message
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>Important contacts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Ms. Rodriguez</p>
                        <p className="text-sm text-muted-foreground">Career Counselor</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span className="text-xs">m.rodriguez@school.edu</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-xs">(555) 123-4567</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-[var(--font-playfair)] mb-2">Parent Resources</h3>
              <p className="text-muted-foreground">Helpful guides and materials for supporting your child</p>
            </div>

            <div className="grid gap-4">
              {parentData.resources.map((resource) => (
                <Card key={resource.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-semibold">{resource.title}</h4>
                          <Badge variant="outline">{resource.type}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {resource.readTime && <span>Read time: {resource.readTime}</span>}
                          {resource.duration && <span>Duration: {resource.duration}</span>}
                        </div>
                      </div>
                      <Button variant="outline">
                        Access
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
