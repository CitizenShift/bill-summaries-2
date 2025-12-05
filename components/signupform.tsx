"use client"

import type React from "react"
import { states } from "@/app/utils/constants/constants";

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'next/navigation'

const policyAreas = [
    "Civil & Human Rights",
    "Criminal Justice & Policing",
    "Immigration",
    "National Security & Defense",
    "Elections & Government Transparency",
    "Taxation & Fiscal Policy",
    "Employment & Labor Rights",
    "Business & Innovation",
    "Trade & Globalization",
    "Healthcare",
    "Education",
    "Housing & Urban Development",
    "Environmental Protection & Climate Change",
    "Food & Agriculture",
    "Transportation & Infrastructure",
    "Technology & Privacy",
    "Energy Policy",
    "Space & Research",
    "Gun Policy & Public Safety",
    "Social Welfare & Poverty Reduction",
]

const raceOptions = [
    "American Indian or Alaska Native",
    "Asian",
    "Black or African American",
    "Hispanic or Latino",
    "Native Hawaiian or Other Pacific Islander",
    "White",
    "Two or More Races",
    "Prefer not to say",
]

export default function SignUpForm() {
    const { signUp } = useAuth()
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        dateOfBirth: "",
        state: "",
        licenseFile: null as File | null,
        policyInterests: [] as string[],
        gender: "",
        race: "",
        politicalLeaning: "",
    })

    const totalSteps = 4
    const progress = (step / totalSteps) * 100

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1)
        }
    }

    const handlePrevious = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handlePolicyToggle = (policy: string) => {
        setFormData((prev) => ({
            ...prev,
            policyInterests: prev.policyInterests.includes(policy)
                ? prev.policyInterests.filter((p) => p !== policy)
                : [...prev.policyInterests, policy],
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormData((prev) => ({ ...prev, licenseFile: file }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        console.log("[v0] Form submitted:", formData)

        const { user, error: signUpError } = await signUp(
            formData.email,
            formData.password,
            {
                gender: formData.gender,
                race: formData.race,
                state: formData.state,
                dateOfBirth: formData.dateOfBirth,
                politicalLeaning: formData.politicalLeaning
            }
        )

        if (!signUpError) {
            router.push("/")
        }
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <CardTitle className="text-2xl">
                            Step {step} of {totalSteps}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {step === 1 && "Tell us about yourself"}
                            {step === 2 && "Upload your identification"}
                            {step === 3 && "Select your policy interests"}
                            {step === 4 && "Additional information"}
                        </CardDescription>
                    </div>
                </div>
                <Progress value={progress} className="h-2" />
            </CardHeader>
            <CardContent>
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                                    placeholder="Enter your first name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                                    placeholder="Enter your last name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter your password"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dateOfBirth">Date of Birth</Label>
                            <Input
                                id="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Select value={formData.state} onValueChange={(value) => setFormData((prev) => ({ ...prev, state: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.code} value={state.code}>
                                            {state.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label htmlFor="license">Driver's License Photo</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                                <input id="license" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                <label htmlFor="license" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                    <div className="text-sm text-muted-foreground">
                                        {formData.licenseFile ? (
                                            <span className="text-foreground font-medium">{formData.licenseFile.name}</span>
                                        ) : (
                                            <>
                                                <span className="text-primary font-medium">Click to upload</span> or drag and drop
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">PNG, JPG or JPEG (max. 10MB)</p>
                                </label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your identification will be securely stored and used only for verification purposes.
                            </p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <Label>Policy Areas of Interest</Label>
                            <p className="text-sm text-muted-foreground">
                                Select all areas you're interested in (you can select multiple)
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 border rounded-lg bg-muted/30">
                                {policyAreas.map((policy) => (
                                    <div key={policy} className="flex items-start gap-2">
                                        <Checkbox
                                            id={policy}
                                            checked={formData.policyInterests.includes(policy)}
                                            onCheckedChange={() => handlePolicyToggle(policy)}
                                        />
                                        <Label htmlFor={policy} className="text-sm leading-relaxed cursor-pointer font-normal">
                                            {policy}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {formData.policyInterests.length > 0 && (
                                <p className="text-sm text-muted-foreground">
                                    {formData.policyInterests.length} area
                                    {formData.policyInterests.length !== 1 ? "s" : ""} selected
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="non-binary">Non-binary</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="race">Race (Optional)</Label>
                            <Select
                                value={formData.race}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, race: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your race" />
                                </SelectTrigger>
                                <SelectContent>
                                    {raceOptions.map((option) => (
                                        <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, "-")}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Political Leaning</Label>
                            <RadioGroup
                                value={formData.politicalLeaning}
                                onValueChange={(value) => setFormData((prev) => ({ ...prev, politicalLeaning: value }))}
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="left" id="left" />
                                    <Label htmlFor="left" className="font-normal cursor-pointer">
                                        Left
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="center" id="center" />
                                    <Label htmlFor="center" className="font-normal cursor-pointer">
                                        Center
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="right" id="right" />
                                    <Label htmlFor="right" className="font-normal cursor-pointer">
                                        Right
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="decline" id="decline" />
                                    <Label htmlFor="decline" className="font-normal cursor-pointer">
                                        Decline to answer
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    {step > 1 ? (
                        <Button type="button" variant="outline" onClick={handlePrevious}>
                            Previous
                        </Button>
                    ) : (
                        <div />
                    )}
                    {step < totalSteps ? (
                        <Button type="button" onClick={handleNext} className="ml-auto">
                            Next Step
                        </Button>
                    ) : (
                        <Button type="button" className="ml-auto" onClick={handleSubmit}>
                            Create Account
                        </Button>
                    )}
                </div>

                <p className="mt-4 text-sm text-center text-muted-foreground w-full">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary underline">
                        Log in
                    </Link>
                </p>
            </CardContent>
        </Card>
    )
}