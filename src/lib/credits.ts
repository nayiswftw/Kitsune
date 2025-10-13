import { db } from "@/server/db";
import { TransactionType } from "@prisma/client";

/**
 * Get user's current credit balance
 */
export async function getUserCredits(userId: string): Promise<number> {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });
    return user?.credits ?? 0;
}

/**
 * Deduct credits from user's balance
 * @param userId - User ID
 * @param amount - Amount to deduct (positive number)
 * @param description - Description of what the credits were used for
 * @returns New balance after deduction
 * @throws Error if user doesn't have enough credits
 */
export async function deductCredits(
    userId: string,
    amount: number,
    description: string
): Promise<number> {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.credits < amount) {
        throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user.credits}`);
    }

    const newBalance = user.credits - amount;

    // Update user credits and create transaction record
    const [updatedUser] = await db.$transaction([
        db.user.update({
            where: { id: userId },
            data: { credits: newBalance }
        }),
        db.creditTransaction.create({
            data: {
                userId,
                amount: -amount,
                type: TransactionType.USAGE,
                description,
                balanceAfter: newBalance
            }
        })
    ]);

    return updatedUser.credits;
}

/**
 * Add credits to user's balance
 * @param userId - User ID
 * @param amount - Amount to add (positive number)
 * @param type - Type of transaction (PURCHASE, BONUS, REFUND)
 * @param description - Description of transaction
 * @param packageId - Optional package ID for purchases
 * @returns New balance after addition
 */
export async function addCredits(
    userId: string,
    amount: number,
    type: TransactionType,
    description: string,
    packageId?: string
): Promise<number> {
    if (amount <= 0) {
        throw new Error("Amount must be positive");
    }

    const user = await db.user.findUnique({
        where: { id: userId },
        select: { credits: true }
    });

    if (!user) {
        throw new Error("User not found");
    }

    const newBalance = user.credits + amount;

    // Update user credits and create transaction record
    const [updatedUser] = await db.$transaction([
        db.user.update({
            where: { id: userId },
            data: { credits: newBalance }
        }),
        db.creditTransaction.create({
            data: {
                userId,
                amount,
                type,
                description,
                balanceAfter: newBalance,
                packageId
            }
        })
    ]);

    return updatedUser.credits;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const balance = await getUserCredits(userId);
    return balance >= amount;
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
    userId: string,
    limit: number = 50
) {
    return await db.creditTransaction.findMany({
        where: { userId },
        include: {
            package: true
        },
        orderBy: { createdAt: "desc" },
        take: limit
    });
}

/**
 * Credit costs for various operations
 */
export const CREDIT_COSTS = {
    ASK_QUESTION: 10,
    PROCESS_MEETING: 50,
    INDEX_REPOSITORY: 100,
    AI_CODE_REVIEW: 30,
} as const;
