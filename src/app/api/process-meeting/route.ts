import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParse = z.object({
    meetingUrl: z.string(),
    meetingId: z.string()

})

export const maxDuration = 300 

export async function POST(req: NextRequest) {
    const { userId } = await auth()

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const { meetingUrl, meetingId } = bodyParse.parse(body)
        
        console.log('Processing meeting:', { meetingUrl, meetingId })
        
        const { summaries } = await processMeeting(meetingUrl)
        
        console.log('Summaries generated:', summaries.length)
        
        if (summaries.length === 0) {
            throw new Error('No summaries generated from meeting')
        }

        await db.issue.createMany({
            data: summaries.map(summary => ({
                start: summary.start,
                end: summary.end,
                gist: summary.gist,
                headline: summary.headline,
                summary: summary.summary,
                meetingId
            }))
        })
        
        await db.meeting.update({
            where: { id: meetingId },
            data: {
                status: "COMPLETED",
                name: summaries[0]!.headline,
            }
        })
        
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error) {
        console.error('Error in process-meeting API:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return NextResponse.json({ 
            error: "Internal Server Error",
            details: errorMessage 
        }, { status: 500 })
    }
}