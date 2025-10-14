import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react'

type Props = { params: Promise<{ projectId: string }> }

const JoinHandler = async (props: Props) => {
    const { projectId } = await props.params;
    const { userId } = await auth();
    
    if (!userId) {
        redirect("/sign-in")
    }

    // Check if user exists in database
    const dbUser = await db.user.findUnique({
        where: { id: userId }
    })

    // If user doesn't exist in DB, redirect to sync-user first
    if (!dbUser) {
        redirect(`/sync-user?redirect=/join/${projectId}`)
    }

    // Verify project exists
    const project = await db.project.findUnique({
        where: { id: projectId }
    })

    if (!project) {
        redirect('/dashboard')
    }

    // Add user to project (if not already a member)
    try {
        await db.userToProject.create({
            data: {
                userId,
                projectId
            }
        })
    } catch (error) {
        // User is already a member of the project
        console.log("User already in project:", error)
    }
    
    return redirect('/dashboard')
}

export default JoinHandler