"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Coins, CreditCard, History, TrendingUp, Sparkles, CheckCircle2, Zap } from "lucide-react";
import confetti from "canvas-confetti";

export default function BillingPage() {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    // Queries
    const { data: balance, refetch: refetchBalance } = api.billing.getBalance.useQuery();
    const { data: packages } = api.billing.getPackages.useQuery();
    const { data: transactions } = api.billing.getTransactions.useQuery({ limit: 50 });
    const { data: stats } = api.billing.getUsageStats.useQuery();

    // Mutations
    const purchaseMutation = api.billing.purchaseCredits.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
            refetchBalance();
            setSelectedPackage(null);
            
            // Trigger confetti animation
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const initPackagesMutation = api.billing.initializeDefaultPackages.useMutation({
        onSuccess: (data) => {
            toast.success(data.message);
            window.location.reload();
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handlePurchase = (packageId: string) => {
        purchaseMutation.mutate({ packageId });
    };

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header with balance */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Billing & Credits</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your credits and purchase additional packages
                    </p>
                </div>
                <Card className="border-2 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Coins className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Current Balance</p>
                                <p className="text-3xl font-bold">{balance ?? 0}</p>
                                <p className="text-xs text-muted-foreground">credits</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Stats */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalUsed}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.transactionCount} transactions
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                            <History className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.usedLast30Days}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.last30DaysCount} transactions
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {Math.round(stats.usedLast30Days / 30)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                credits per day
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="packages" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="packages">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit Packages
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <History className="h-4 w-4 mr-2" />
                        Transaction History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="packages" className="space-y-6">
                    {/* Initialize button for first time setup */}
                    {packages?.length === 0 && (
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>No Packages Available</CardTitle>
                                <CardDescription>
                                    Initialize default credit packages to get started
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button 
                                    onClick={() => initPackagesMutation.mutate()}
                                    disabled={initPackagesMutation.isPending}
                                >
                                    {initPackagesMutation.isPending ? "Initializing..." : "Initialize Packages"}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Credit Packages Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {packages?.map((pkg) => (
                            <Card 
                                key={pkg.id}
                                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                                    selectedPackage === pkg.id ? "ring-2 ring-primary" : ""
                                }`}
                            >
                                {pkg.credits >= 2000 && (
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Best Value
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                                    <CardDescription>{pkg.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-4xl font-bold">
                                            ${pkg.price.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {pkg.credits} credits
                                        </p>
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex items-center text-sm">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                            <span>${(pkg.price / pkg.credits).toFixed(3)} per credit</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                            <span>Never expires</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                            <span>Instant delivery</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button 
                                        className="w-full text-white"
                                        onClick={() => handlePurchase(pkg.id)}
                                        disabled={purchaseMutation.isPending}
                                    >
                                        {purchaseMutation.isPending && selectedPackage === pkg.id
                                            ? "Processing..."
                                            : "Purchase Now"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    {/* Demo Notice */}
                    <Card className="border-yellow-500/50 bg-yellow-500/5">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-yellow-500" />
                                Demo Mode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                This is a demo billing system. In production, integrate with payment providers like:
                            </p>
                            <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                                <li><strong>Stripe</strong> - Industry standard payment processing</li>
                                <li><strong>PayPal</strong> - Wide consumer adoption</li>
                                <li><strong>Paddle</strong> - Merchant of record solution</li>
                                <li><strong>LemonSqueezy</strong> - Open-source friendly payments</li>
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {transactions && transactions.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>
                                    Your complete credit transaction history
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {transactions.map((transaction) => (
                                        <div 
                                            key={transaction.id}
                                            className="flex items-center justify-between p-4 border rounded-lg"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${
                                                    transaction.type === "PURCHASE" || transaction.type === "BONUS"
                                                        ? "bg-green-500/10"
                                                        : "bg-red-500/10"
                                                }`}>
                                                    {transaction.type === "PURCHASE" || transaction.type === "BONUS" ? (
                                                        <Coins className="h-5 w-5 text-green-500" />
                                                    ) : (
                                                        <Coins className="h-5 w-5 text-red-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{transaction.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(transaction.createdAt).toLocaleDateString()} at{" "}
                                                        {new Date(transaction.createdAt).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${
                                                    transaction.amount > 0 ? "text-green-500" : "text-red-500"
                                                }`}>
                                                    {transaction.amount > 0 ? "+" : ""}{transaction.amount}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Balance: {transaction.balanceAfter}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <History className="h-12 w-12 text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No transactions yet</p>
                                <p className="text-sm text-muted-foreground">
                                    Your transaction history will appear here
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
