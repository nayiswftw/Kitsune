import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { addCredits, getUserCredits, getTransactionHistory } from "@/lib/credits";
import { TransactionType } from "@prisma/client";

export const billingRouter = createTRPCRouter({
    /**
     * Get available credit packages
     */
    getPackages: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.creditPackage.findMany({
            where: { isActive: true },
            orderBy: { price: "asc" }
        });
    }),

    /**
     * Get user's current credit balance
     */
    getBalance: protectedProcedure.query(async ({ ctx }) => {
        return await getUserCredits(ctx.user.userId!);
    }),

    /**
     * Get transaction history
     */
    getTransactions: protectedProcedure
        .input(z.object({
            limit: z.number().optional().default(50)
        }))
        .query(async ({ ctx, input }) => {
            return await getTransactionHistory(ctx.user.userId!, input.limit);
        }),

    /**
     * Purchase credits (demo - in production would integrate with payment provider)
     */
    purchaseCredits: protectedProcedure
        .input(z.object({
            packageId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            // Get package details
            const creditPackage = await ctx.db.creditPackage.findUnique({
                where: { id: input.packageId }
            });

            if (!creditPackage) {
                throw new Error("Package not found");
            }

            if (!creditPackage.isActive) {
                throw new Error("Package is not available");
            }

            // In a real app, you would:
            // 1. Create a payment intent with your payment provider
            // 2. Wait for payment confirmation
            // 3. Then add credits
            
            // For demo purposes, we'll just add the credits immediately
            const newBalance = await addCredits(
                ctx.user.userId!,
                creditPackage.credits,
                TransactionType.PURCHASE,
                `Purchased ${creditPackage.name}`,
                creditPackage.id
            );

            return {
                success: true,
                newBalance,
                message: `Successfully added ${creditPackage.credits} credits!`
            };
        }),

    /**
     * Admin: Create a credit package
     */
    createPackage: protectedProcedure
        .input(z.object({
            name: z.string(),
            credits: z.number().positive(),
            price: z.number().positive(),
            description: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // In production, add admin check here
            return await ctx.db.creditPackage.create({
                data: {
                    name: input.name,
                    credits: input.credits,
                    price: input.price,
                    description: input.description,
                    isActive: true
                }
            });
        }),

    /**
     * Admin: Initialize default packages (run once)
     */
    initializeDefaultPackages: protectedProcedure.mutation(async ({ ctx }) => {
        // Check if packages already exist
        const existingPackages = await ctx.db.creditPackage.count();
        if (existingPackages > 0) {
            return { message: "Packages already initialized" };
        }

        const defaultPackages = [
            {
                name: "Starter Pack",
                credits: 100,
                price: 9.99,
                description: "Perfect for small projects"
            },
            {
                name: "Professional Pack",
                credits: 500,
                price: 39.99,
                description: "Great for growing teams"
            },
            {
                name: "Enterprise Pack",
                credits: 2000,
                price: 129.99,
                description: "For large-scale operations"
            },
            {
                name: "Mega Pack",
                credits: 5000,
                price: 299.99,
                description: "Maximum value for power users"
            }
        ];

        await ctx.db.creditPackage.createMany({
            data: defaultPackages
        });

        return { message: "Default packages created successfully" };
    }),

    /**
     * Get usage statistics
     */
    getUsageStats: protectedProcedure.query(async ({ ctx }) => {
        const transactions = await ctx.db.creditTransaction.findMany({
            where: {
                userId: ctx.user.userId!,
                type: TransactionType.USAGE
            },
            orderBy: { createdAt: "desc" },
            take: 100
        });

        const totalUsed = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const last30Days = transactions.filter(
            t => t.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
        const usedLast30Days = last30Days.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
            totalUsed,
            usedLast30Days,
            transactionCount: transactions.length,
            last30DaysCount: last30Days.length
        };
    })
});
