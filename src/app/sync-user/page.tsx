import { db } from '@/server/db'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'

type Props = {
    searchParams: Promise<{ redirect?: string }>
}

const SyncUser = async (props: Props) => {
    const { userId } = await auth()
    
    if (!userId) {
        throw new Error('User not found')
    }
    
    const client = await clerkClient()
    const user = await client.users.getUser(userId)

    if (!user.emailAddresses[0]?.emailAddress) {
        return notFound()
    }

    // Upsert user to database
    await db.user.upsert({
        where: {
            emailAddress: user.emailAddresses[0].emailAddress
        },
        update: {
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        },
        create: {
            id: userId,
            emailAddress: user.emailAddresses[0].emailAddress,
            imageUrl: user.imageUrl,
            firstName: user.firstName,
            lastName: user.lastName,
        }
    })

    // Handle redirect parameter
    const searchParams = await props.searchParams
    const redirectPath = searchParams.redirect || '/dashboard'
    
    return redirect(redirectPath)
}

export default SyncUser
