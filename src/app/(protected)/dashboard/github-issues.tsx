'use client'

import React, { useState } from 'react'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, MessageSquare, RefreshCw, Plus, GitPullRequest, CheckCircle2, XCircle, Clock, Users, Tag } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MDEditor from '@uiw/react-md-editor'
import { cn } from '@/lib/utils'

type IssueState = 'all' | 'open' | 'closed';

type IssueType = {
    id: string;
    issueNumber: number;
    title: string;
    body: string | null;
    state: string;
    author: string;
    authorAvatar: string | null;
    labels: string[];
    assignees: string[];
    comments: number;
    githubCreatedAt: Date;
    githubUpdatedAt: Date;
    url: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}

const GithubIssues = () => {
    const { project } = useProject()
    const [selectedState, setSelectedState] = useState<IssueState>('open')
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [newIssueTitle, setNewIssueTitle] = useState('')
    const [newIssueBody, setNewIssueBody] = useState('')
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedIssueDetail, setSelectedIssueDetail] = useState<IssueType | null>(null)
    const [comment, setComment] = useState('')

    const { data: issues, isLoading, refetch } = api.project.getGithubIssues.useQuery({
        projectId: project?.id ?? '',
        state: selectedState
    }, {
        enabled: !!project?.id,
        refetchInterval: 30000 // Refetch every 30 seconds
    })

    const syncMutation = api.project.syncGithubIssues.useMutation()
    const createMutation = api.project.createGithubIssue.useMutation()
    const addCommentMutation = api.project.addCommentToIssue.useMutation()

    // Fetch comments and timeline for selected issue
    const { data: issueComments, refetch: refetchComments } = api.project.getIssueComments.useQuery({
        projectId: project?.id ?? '',
        issueNumber: selectedIssueDetail?.issueNumber ?? 0
    }, {
        enabled: !!project?.id && !!selectedIssueDetail && isSheetOpen
    })

    const { data: issueTimeline } = api.project.getIssueTimeline.useQuery({
        projectId: project?.id ?? '',
        issueNumber: selectedIssueDetail?.issueNumber ?? 0
    }, {
        enabled: !!project?.id && !!selectedIssueDetail && isSheetOpen
    })

    const handleSync = async () => {
        if (!project?.id) return
        
        toast.promise(syncMutation.mutateAsync({ projectId: project.id }), {
            loading: 'Syncing issues from GitHub...',
            success: (data) => {
                refetch()
                return `Synced ${data.count} issues successfully`
            },
            error: 'Failed to sync issues'
        })
    }

    const handleCreateIssue = async () => {
        if (!project?.id || !newIssueTitle.trim()) return

        toast.promise(
            createMutation.mutateAsync({
                projectId: project.id,
                title: newIssueTitle,
                body: newIssueBody
            }),
            {
                loading: 'Creating issue...',
                success: (data) => {
                    setIsCreateDialogOpen(false)
                    setNewIssueTitle('')
                    setNewIssueBody('')
                    refetch()
                    return `Issue #${data.issueNumber} created successfully`
                },
                error: 'Failed to create issue'
            }
        )
    }

    const handleAddComment = async () => {
        if (!project?.id || !selectedIssueDetail || !comment.trim()) return

        toast.promise(
            addCommentMutation.mutateAsync({
                projectId: project.id,
                issueNumber: selectedIssueDetail.issueNumber,
                comment
            }),
            {
                loading: 'Adding comment...',
                success: () => {
                    setComment('')
                    refetchComments()
                    return 'Comment added successfully'
                },
                error: 'Failed to add comment'
            }
        )
    }

    const handleIssueClick = (issue: IssueType) => {
        setSelectedIssueDetail(issue)
        setIsSheetOpen(true)
    }

    const getStateIcon = (state: string) => {
        if (state === 'open') return <Clock className="size-4 text-green-600" />
        if (state === 'closed') return <CheckCircle2 className="size-4 text-purple-600" />
        return <XCircle className="size-4 text-gray-600" />
    }

    const getStateColor = (state: string) => {
        if (state === 'open') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        if (state === 'closed') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        return 'bg-gray-100 text-gray-800'
    }

    return (
        <Card className="col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <GitPullRequest className="size-5" />
                            GitHub Issues
                        </CardTitle>
                        <CardDescription>
                            Manage and track issues from your repository
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                    <Plus className="size-4 mr-2" />
                                    New Issue
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Issue</DialogTitle>
                                    <DialogDescription>
                                        Create a new issue in your GitHub repository
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={newIssueTitle}
                                            onChange={(e) => setNewIssueTitle(e.target.value)}
                                            placeholder="Issue title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="body">Description</Label>
                                        <Textarea
                                            id="body"
                                            value={newIssueBody}
                                            onChange={(e) => setNewIssueBody(e.target.value)}
                                            placeholder="Describe the issue..."
                                            rows={5}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={handleCreateIssue}
                                        disabled={!newIssueTitle.trim() || createMutation.isPending}
                                    >
                                        {createMutation.isPending ? 'Creating...' : 'Create Issue'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSync}
                            disabled={syncMutation.isPending}
                        >
                            <RefreshCw className={`size-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                            Sync
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={selectedState} onValueChange={(value) => setSelectedState(value as IssueState)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedState} className="space-y-4 mt-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading issues...
                            </div>
                        ) : !issues || issues.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No {selectedState !== 'all' ? selectedState : ''} issues found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {issues.map((issue) => (
                                    <Card 
                                        key={issue.id} 
                                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => handleIssueClick(issue)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="size-8 mt-1">
                                                <AvatarImage src={issue.authorAvatar || ''} />
                                                <AvatarFallback>{issue.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-foreground">
                                                                #{issue.issueNumber} {issue.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                                                            <span>by {issue.author}</span>
                                                            <span>•</span>
                                                            <span>{new Date(issue.githubUpdatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStateColor(issue.state)}>
                                                            {getStateIcon(issue.state)}
                                                            <span className="ml-1">{issue.state}</span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                {issue.body && (
                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                        {issue.body}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    {issue.labels && issue.labels.length > 0 && (
                                                        <div className="flex gap-1 flex-wrap">
                                                            {issue.labels.slice(0, 3).map((label, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">
                                                                    {label}
                                                                </Badge>
                                                            ))}
                                                            {issue.labels.length > 3 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{issue.labels.length - 3} more
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    )}
                                                    {issue.comments > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            <MessageSquare className="size-3 mr-1" />
                                                            {issue.comments}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Issue Detail Sheet */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
                        {selectedIssueDetail && (
                            <>
                                <SheetHeader className="pb-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage src={selectedIssueDetail.authorAvatar || ''} />
                                            <AvatarFallback>
                                                {selectedIssueDetail.author.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <SheetTitle className="text-xl">
                                                #{selectedIssueDetail.issueNumber} {selectedIssueDetail.title}
                                            </SheetTitle>
                                            <SheetDescription className="flex items-center gap-2 mt-1">
                                                <span>Opened by {selectedIssueDetail.author}</span>
                                                <span>•</span>
                                                <span>{new Date(selectedIssueDetail.githubCreatedAt).toLocaleDateString()}</span>
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="mt-6 space-y-6">
                                    {/* Status and Metadata */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={getStateColor(selectedIssueDetail.state)}>
                                            {getStateIcon(selectedIssueDetail.state)}
                                            <span className="ml-1 capitalize">{selectedIssueDetail.state}</span>
                                        </Badge>
                                        {selectedIssueDetail.comments > 0 && (
                                            <Badge variant="secondary">
                                                <MessageSquare className="size-3 mr-1" />
                                                {selectedIssueDetail.comments} {selectedIssueDetail.comments === 1 ? 'comment' : 'comments'}
                                            </Badge>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Labels */}
                                    {selectedIssueDetail.labels && selectedIssueDetail.labels.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Tag className="size-4" />
                                                <span>Labels</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedIssueDetail.labels.map((label, idx) => (
                                                    <Badge key={idx} variant="outline">
                                                        {label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Assignees */}
                                    {selectedIssueDetail.assignees && selectedIssueDetail.assignees.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Users className="size-4" />
                                                <span>Assignees</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedIssueDetail.assignees.map((assignee, idx) => (
                                                    <Badge key={idx} variant="secondary">
                                                        @{assignee}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Conversation & Timeline */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <MessageSquare className="size-4" />
                                                Conversation & Activity
                                            </h4>
                                        </div>
                                        
                                        {/* Merge comments and timeline events */}
                                        {issueComments || issueTimeline ? (
                                            <ul className="space-y-6 max-h-96 overflow-y-auto pr-2">
                                                {/* Initial issue creation */}
                                                <li className="relative flex gap-x-4">
                                                    <div className={cn(
                                                        '-bottom-6',
                                                        'absolute left-0 top-0 flex w-8 justify-center'
                                                    )}>
                                                        <div className='w-px bg-border'></div>
                                                    </div>
                                                    <Avatar className="relative size-8 flex-none mt-1">
                                                        <AvatarImage src={selectedIssueDetail.authorAvatar || ''} />
                                                        <AvatarFallback className="text-xs">
                                                            {selectedIssueDetail.author.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-auto rounded-md bg-muted p-4">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className="text-sm font-medium">{selectedIssueDetail.author}</span>
                                                            <Badge variant="outline" className="text-xs">Created Issue</Badge>
                                                            <span className="text-xs text-muted-foreground">
                                                                {new Date(selectedIssueDetail.githubCreatedAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {selectedIssueDetail.body ? (
                                                            <div data-color-mode="light">
                                                                <MDEditor.Markdown 
                                                                    source={selectedIssueDetail.body} 
                                                                    className="text-sm bg -transparent"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground italic">No description provided</p>
                                                        )}
                                                    </div>
                                                </li>

                                                {/* Render all timeline events and comments chronologically */}
                                                {(() => {
                                                    const allActivity = [
                                                        ...(issueComments || []).map(c => ({ ...c, type: 'comment' as const })),
                                                        // Filter out 'commented' events from timeline since we show actual comments above
                                                        ...(issueTimeline || [])
                                                            .filter(t => t.event !== 'commented')
                                                            .map(t => ({ ...t, type: 'timeline' as const }))
                                                    ].sort((a, b) => 
                                                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                                                    );

                                                    return allActivity.map((activity, activityIdx) => {
                                                        if (activity.type === 'comment') {
                                                            return (
                                                                <li key={`comment-${activity.id}`} className="relative flex gap-x-4">
                                                                    <div className={cn(
                                                                        activityIdx === allActivity.length - 1 ? 'h-6' : '-bottom-6',
                                                                        'absolute left-0 top-0 flex w-8 justify-center'
                                                                    )}>
                                                                        <div className='w-px bg-border'></div>
                                                                    </div>
                                                                    <Avatar className="relative size-8 flex-none mt-1">
                                                                        <AvatarImage src={activity.authorAvatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {activity.author.slice(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-auto rounded-md bg-muted p-4">
                                                                        <div className="flex items-center justify-between gap-2 mb-3">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-medium">{activity.author}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {new Date(activity.createdAt).toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="h-6 w-6 p-0"
                                                                                asChild
                                                                            >
                                                                                <Link href={activity.url} target="_blank">
                                                                                    <ExternalLink className="size-3" />
                                                                                </Link>
                                                                            </Button>
                                                                        </div>
                                                                        <div data-color-mode="light">
                                                                            <MDEditor.Markdown 
                                                                                source={activity.body} 
                                                                                className="text-sm bg-transparent"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            );
                                                        } else {
                                                            // Timeline events
                                                            const getEventBadge = (event: string) => {
                                                                switch (event) {
                                                                    case 'closed': return <Badge variant="destructive" className="text-xs">Closed</Badge>;
                                                                    case 'reopened': return <Badge variant="default" className="text-xs">Reopened</Badge>;
                                                                    case 'labeled': return <Badge variant="secondary" className="text-xs">Labeled</Badge>;
                                                                    case 'unlabeled': return <Badge variant="secondary" className="text-xs">Unlabeled</Badge>;
                                                                    case 'assigned': return <Badge variant="secondary" className="text-xs">Assigned</Badge>;
                                                                    case 'unassigned': return <Badge variant="secondary" className="text-xs">Unassigned</Badge>;
                                                                    case 'milestoned': return <Badge variant="secondary" className="text-xs">Milestoned</Badge>;
                                                                    case 'demilestoned': return <Badge variant="secondary" className="text-xs">Demilestoned</Badge>;
                                                                    case 'renamed': return <Badge variant="secondary" className="text-xs">Renamed</Badge>;
                                                                    case 'referenced': return <Badge variant="outline" className="text-xs">Referenced</Badge>;
                                                                    default: return <Badge variant="outline" className="text-xs">{event}</Badge>;
                                                                }
                                                            };

                                                            const getEventText = (activity: any) => {
                                                                switch (activity.event) {
                                                                    case 'closed': return 'closed this issue';
                                                                    case 'reopened': return 'reopened this issue';
                                                                    case 'labeled': return `added label: ${activity.label}`;
                                                                    case 'unlabeled': return `removed label: ${activity.label}`;
                                                                    case 'assigned': return `assigned ${activity.assignee}`;
                                                                    case 'unassigned': return `unassigned ${activity.assignee}`;
                                                                    case 'milestoned': return `added milestone: ${activity.milestone}`;
                                                                    case 'demilestoned': return `removed milestone: ${activity.milestone}`;
                                                                    case 'renamed': return `renamed from "${activity.rename?.from}" to "${activity.rename?.to}"`;
                                                                    default: return activity.event;
                                                                }
                                                            };

                                                            return (
                                                                <li key={`timeline-${activity.id}`} className="relative flex gap-x-4">
                                                                    <div className={cn(
                                                                        activityIdx === allActivity.length - 1 ? 'h-6' : '-bottom-6',
                                                                        'absolute left-0 top-0 flex w-8 justify-center'
                                                                    )}>
                                                                        <div className='w-px bg-border'></div>
                                                                    </div>
                                                                    <Avatar className="relative size-8 flex-none mt-1">
                                                                        <AvatarImage src={activity.actorAvatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {activity.actor.slice(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-auto rounded-md bg-muted/50 p-3 ring-1 ring-inset ring-border">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-sm font-medium">{activity.actor}</span>
                                                                            {getEventBadge(activity.event)}
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {new Date(activity.createdAt).toLocaleDateString()}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            {getEventText(activity)}
                                                                        </p>
                                                                    </div>
                                                                </li>
                                                            );
                                                        }
                                                    });
                                                })()}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">Loading conversation...</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Add Comment Section */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Add a Comment</h4>
                                        <Textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Write your comment..."
                                            rows={5}
                                            className="resize-none"
                                        />
                                        <div className="flex justify-between items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                asChild
                                            >
                                                <Link href={selectedIssueDetail.url} target="_blank">
                                                    <ExternalLink className="size-3 mr-2" />
                                                    View on GitHub
                                                </Link>
                                            </Button>
                                            <Button
                                                onClick={handleAddComment}
                                                disabled={!comment.trim() || addCommentMutation.isPending}
                                            >
                                                {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </SheetContent>
                </Sheet>
            </CardContent>
        </Card>
    )
}

export default GithubIssues
