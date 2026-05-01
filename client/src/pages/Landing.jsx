

"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, UserCheck, ArrowRight, BookOpen, Target, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import ProfileCompletionPopup from "./ProfileCompletionPopup"

export default function LandingPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [selectedRole, setSelectedRole] = useState("")
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [showProfilePopup, setShowProfilePopup] = useState(false)

    const handleSignIn = async () => {
        if (!email || !password) {
            alert("Please enter email and password!");
            return;
        }

        try {
                   const res = await axios.post("https://career-counselling-gray.vercel.app/api/users/login", {
            email,
            password,
        }, {

            withCredentials: true,
        });

            console.log("✅ Sign-in successful:", res.data);

            const loggedInUser = res.data.data.user; 
            setUser(loggedInUser);
            localStorage.setItem("user", JSON.stringify(loggedInUser));

            if (loggedInUser.role === "student") {
                navigate("/student-dashboard", { state: { user: loggedInUser } });
            } else if (loggedInUser.role === "parent") {
                navigate("/parent-dashboard", { state: { user: loggedInUser } });
            } else if (loggedInUser.role === "counselor") {
                navigate("/counselor-dashboard", { state: { user: loggedInUser } });
            }
        } catch (err) {
            console.error("❌ Sign-in error:", err.response?.data || err.message);
            alert("Invalid email or password. Please try again.");
        }
    };

    const handleRoleSelection = async (role) => {
        if (!name || !email || !password || !role) {
            alert("Please fill all fields!");
            return;
        }

        try {
         const res = await axios.post("https://career-counselling-gray.vercel.app/api/users/signup", {
            name,
            email,
            password,
            role
        }, {

            headers: {
                "Content-Type": "application/json"
            },
            withCredentials: true 
        });

            console.log("✅ User created:", res.data);
            alert("User data saved successfully!");

            const newUser = res.data.data.user; 
            setUser(newUser);

            localStorage.setItem("user", JSON.stringify(newUser));

            if (newUser.role === "student") {
                setShowProfilePopup(true);
            } else {

                if (newUser.role === "parent") navigate("/parent-dashboard", { state: { user: newUser } });
                if (newUser.role === "counselor") navigate("/counselor-dashboard", { state: { user: newUser } });
            }

            setEmail("");
            setPassword("");
            setSelectedRole("");
            setName(""); 
        } catch (err) {
            console.error("❌ Signup error:", err.response?.data || err.message);
            alert(err.response?.data?.error || "Error saving user data");
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold text-primary font-[var(--font-playfair)]">Career Advisor</h1>
                    </div>
                    <Button variant="outline" onClick={() => setIsSignUp(!isSignUp)}>
                        {isSignUp ? "Sign In" : "Sign Up"}
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {}
                    <div className="space-y-6">
                        <h2 className="text-4xl lg:text-5xl font-bold text-balance font-[var(--font-playfair)]">
                            Your Path to a<span className="text-primary"> Successful Career</span>
                        </h2>
                        <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                            Connect students, parents, and counselors on one comprehensive platform. Get personalized career guidance,
                            track progress, and make informed decisions about your future.
                        </p>

                        {}
                        <div className="grid gap-4 mt-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Personalized Career Paths</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Tailored recommendations based on your interests and goals
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Progress Tracking</h3>
                                    <p className="text-sm text-muted-foreground">Monitor your journey and celebrate milestones</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Expert Guidance</h3>
                                    <p className="text-sm text-muted-foreground">Connect with professional counselors and mentors</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {}
                    <Card className="w-full max-w-md mx-auto">
                        <CardHeader className="text-center">
                            <CardTitle className="font-[var(--font-playfair)]">
                                {isSignUp ? "Create Your Account" : "Welcome Back"}
                            </CardTitle>
                            <CardDescription>
                                {isSignUp
                                    ? "Join thousands of students on their career journey"
                                    : "Sign in to continue your career journey"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {isSignUp && (
                                <div className="space-y-2">
                                    <Label htmlFor="role">I am a...</Label>
                                    <Select onValueChange={setSelectedRole} value={selectedRole}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4" />
                                                    Student
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="parent">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4" />
                                                    Parent
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="counselor">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4" />
                                                    Counselor
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                className="w-full"
                                onClick={() => isSignUp ? handleRoleSelection(selectedRole) : handleSignIn()}
                                disabled={isSignUp && !selectedRole}
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                                <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline font-medium">
                                    {isSignUp ? "Sign in" : "Sign up"}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <section className="mt-20">
                    <div className="text-center mb-12">
                        <h3 className="text-3xl font-bold font-[var(--font-playfair)] mb-4">Choose Your Path</h3>
                        <p className="text-muted-foreground text-lg">Different roles, tailored experiences</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <Card
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => {
                                if (isSignUp) {
                                    handleRoleSelection("student");
                                } else {
                                    alert("Please use the form to sign in");
                                }
                            }}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                    <GraduationCap className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle>Students</CardTitle>
                                <CardDescription>Discover your potential and plan your future</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Personalized career assessments</li>
                                    <li>• Goal setting and tracking</li>
                                    <li>• Course recommendations</li>
                                    <li>• Progress monitoring</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => {
                                if (isSignUp) {
                                    handleRoleSelection("parent");
                                } else {
                                    alert("Please use the form to sign in");
                                }
                            }}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-secondary" />
                                </div>
                                <CardTitle>Parents</CardTitle>
                                <CardDescription>Support your child's career journey</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Track your child's progress</li>
                                    <li>• Access guidance resources</li>
                                    <li>• Connect with counselors</li>
                                    <li>• Stay informed on opportunities</li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => {
                                if (isSignUp) {
                                    handleRoleSelection("counselor");
                                } else {
                                    alert("Please use the form to sign in");
                                }
                            }}
                        >
                            <CardHeader className="text-center">
                                <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                                    <UserCheck className="h-8 w-8 text-accent" />
                                </div>
                                <CardTitle>Counselors</CardTitle>
                                <CardDescription>Guide students to success</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li>• Manage student portfolios</li>
                                    <li>• Track student progress</li>
                                    <li>• Schedule appointments</li>
                                    <li>• Generate insights and reports</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            </main>

            {}
            <footer className="border-t border-border bg-card/50 mt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-primary">Career Advisor</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © 2025 Career Advisor. Empowering futures, one student at a time.
                        </p>
                    </div>
                </div>
            </footer>

            {}
            {showProfilePopup && user && (
                <ProfileCompletionPopup
                    user={user}
                    onComplete={(profile) => {
                        setShowProfilePopup(false);
                        navigate("/student-dashboard", { state: { user } }); 
                    }}
                    onClose={() => setShowProfilePopup(false)}
                />
            )}
        </div>
    )
}

