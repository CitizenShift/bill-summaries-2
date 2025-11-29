import SignUpForm from "@/components/signupform";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">Join Our Community</h1>
                    <p className="text-muted-foreground text-lg">
                        Create your account to engage with policy discussions and make your voice heard
                    </p>
                </div>
                <SignUpForm />
            </div>
        </div>
    )
}