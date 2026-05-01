"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { GraduationCap, Target, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import apiClient from "@/lib/api"

export function StudentProfileModal({ open, onOpenChange, onComplete }) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    qualification: "",
    interests: [],
    goals: "",
  })

  const interestOptions = [
    { id: "arts", label: "Arts & Creative Fields" },
    { id: "science", label: "Science & Technology" },
    { id: "commerce", label: "Commerce & Business" },
    { id: "vocational", label: "Vocational & Trade Skills" },
    { id: "healthcare", label: "Healthcare & Medicine" },
    { id: "engineering", label: "Engineering" },
    { id: "education", label: "Education & Teaching" },
    { id: "sports", label: "Sports & Fitness" },
    { id: "other", label: "Other" },
  ]

  const handleInterestChange = (interestId, checked) => {
    setFormData((prev) => ({
      ...prev,
      interests: checked ? [...prev.interests, interestId] : prev.interests.filter((id) => id !== interestId),
    }))
  }

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      console.log("[v0] Submitting student profile:", formData)

      const response = await apiClient.createStudentProfile(formData)

      if (response.success) {
        console.log("[v0] Profile saved successfully:", response.data)
        onComplete(formData)
        onOpenChange(false)
      } else {
        throw new Error(response.message || "Failed to save profile")
      }
    } catch (error) {
      console.error("[v0] Error saving profile:", error)

      alert("Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.qualification !== ""
      case 2:
        return formData.interests.length > 0
      case 3:
        return formData.goals.trim() !== ""
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-[var(--font-playfair)]">
            <Sparkles className="h-6 w-6 text-primary" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Help us personalize your career journey by sharing some information about yourself.
          </DialogDescription>
        </DialogHeader>

        {}
        <div className="flex items-center justify-center gap-2 my-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNumber === step
                    ? "bg-primary text-primary-foreground"
                    : stepNumber < step
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && <div className={`h-1 w-12 mx-2 ${stepNumber < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Educational Background
              </CardTitle>
              <CardDescription>Tell us about your current educational level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Current Qualification</Label>
                <Select
                  value={formData.qualification}
                  onValueChange={(value) => setFormData({ ...formData, qualification: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class-10">Class 10 (Secondary)</SelectItem>
                    <SelectItem value="class-12">Class 12 (Higher Secondary)</SelectItem>
                    <SelectItem value="undergraduate">Undergraduate</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  This helps us recommend appropriate career paths and educational opportunities based on your current
                  level.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-secondary" />
                Areas of Interest
              </CardTitle>
              <CardDescription>Select all fields that interest you (choose multiple)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interestOptions.map((interest) => (
                  <div key={interest.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest.id}
                      checked={formData.interests.includes(interest.id)}
                      onCheckedChange={(checked) => handleInterestChange(interest.id, checked)}
                    />
                    <Label
                      htmlFor={interest.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {interest.label}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your interests help us suggest relevant career paths, courses, and opportunities that align with your
                  passions.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Future Goals
              </CardTitle>
              <CardDescription>Share your career aspirations and what you hope to achieve</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Describe your career goals and aspirations</Label>
                <Textarea
                  id="goals"
                  placeholder="Tell us about your dream career, what you want to achieve, any specific companies or roles you're interested in, or skills you want to develop..."
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your goals help us create a personalized roadmap and recommend specific actions to help you achieve
                  your dreams.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="bg-transparent"
          >
            Back
          </Button>

          <div className="flex items-center gap-2">
            {step < 3 ? (
              <Button onClick={handleNext} disabled={!isStepValid() || isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {}
        <div className="text-center text-sm text-muted-foreground">Step {step} of 3</div>
      </DialogContent>
    </Dialog>
  )
}
