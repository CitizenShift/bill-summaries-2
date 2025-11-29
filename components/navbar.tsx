"use client"
import type React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const Navbar = () => {
    const { user, logOut } = useAuth();
    const router = useRouter();

    const handleButtonClick = async () => {
        if (user) {
            const { error } = await logOut();

            if (!error) {
                router.push("/login");
            }
        }

        router.push("/login");
    }

    return (
        <header className="border-b">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <h1 className="text-xl font-bold">Bill Summaries</h1>
                <div className="flex items-center justify-center gap-x-4">
                    <p className="text-sm text-muted-foreground">Stay informed on legislation that matters</p>
                    <Button variant={user ? "outline" : "default"} onClick={handleButtonClick}>
                        {user ? "Sign Out" : "Login"}
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Navbar;