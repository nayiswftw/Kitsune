'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { api, type RouterOutputs } from '@/trpc/react'
import { VideoIcon } from 'lucide-react'
import React from 'react'

type Props = { meetingId: string }

const IssueList = ({ meetingId }: Props) => {
    const { data: meeting, isLoading } = api.project.getMeetingById.useQuery({ meetingId },
        { refetchInterval: 4000 }
    )
    if (isLoading || !meeting) return <div>Loading...</div>
    return (
        <>
            <div className="p-8">
                <div className="mx-auto flex max-w-2xl items-center justify-between gap-x-8 border-b pb-8 lg:mx-0 lg:max-w-none">
                    <div className="flex items-center gap-x-6">
                        <div className="rounded-full border bg-card p-3">
                            <VideoIcon className='h-6 w-6' />
                        </div>
                        <h1>
                            <div className="text-sm leading-6 text-muted-foreground">
                                Meeting on {"" + meeting.createdAt.toLocaleDateString()}
                            </div>
                            <div className="mt-1 text-base font-semibold leading-6 text-foreground">
                                {meeting.name}
                            </div>
                        </h1>
                    </div>
                </div>
                <div className="h-4"></div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {meeting.issues.map(issue => (
                        <IssueCard issue={issue} key={issue.id} />

                    ))}
                </div>
            </div>
        </>
    )
}

export default IssueList

function IssueCard({ issue }: { issue: NonNullable<RouterOutputs['project']['getMeetingById']>['issues'][number] }) {
    const [open, setOpen] = React.useState(false);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{issue.gist}</DialogTitle>
                        <DialogDescription>
                            {issue.createdAt.toLocaleDateString()}
                        </DialogDescription>
                        <p className='text-muted-foreground'>
                            {issue.headline}
                        </p>
                        <blockquote className='mt-2 border-l-4 border-border bg-muted p-4 '>
                            <span className='text-sm text-muted-foreground'>
                                {issue.start} - {issue.end}
                            </span>
                            <p className="font-medium italic leading-relaxed text-foreground">
                                {issue.summary}
                            </p>
                        </blockquote>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <Card className='relative '>
                <CardHeader>
                    <CardTitle className='text-xl'>
                        {issue.gist}
                    </CardTitle>
                    <CardDescription>
                        {issue.headline}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setOpen(true)} className='w-full text-white'>
                        Details
                    </Button>
                </CardContent>
            </Card>
        </>
    )
}