import { Loader2, Users } from "lucide-react";

export default function JoinLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted">
            <div className="text-center space-y-6">
                <div className="relative">
                    <div className="relative w-20 h-20 mx-auto">
                        <Users className="w-20 h-20 text-primary" />
                        <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">Joining project...</h2>
                    <p className="text-muted-foreground">
                        Please wait while we add you to the team
                    </p>
                </div>
            </div>
        </div>
    );
}
