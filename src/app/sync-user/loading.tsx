import { Loader2 } from "lucide-react";

export default function SyncUserLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
            <div className="text-center space-y-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Setting up your account...</h2>
                    <p className="text-muted-foreground">
                        We're syncing your profile with Kitsune
                    </p>
                </div>
            </div>
        </div>
    );
}
