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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ExternalLink, RefreshCw, GitPullRequest, GitMerge, CheckCircle2, XCircle, Clock, MessageSquare, ThumbsUp, AlertCircle, GitBranch, FileCode, Plus, Minus, Files, Tag, GitCommit } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MDEditor from '@uiw/react-md-editor'
import { cn } from '@/lib/utils'

type PRState = 'all' | 'open' | 'closed';

type PullRequestType = {
    id: string;
    prNumber: number;
    title: string;
    body: string | null;
    state: string;
    author: string;
    authorAvatar: string | null;
    labels: string[];
    reviewStatus: string | null;
    mergeable: boolean;
    draft: boolean;
    baseBranch: string;
    headBranch: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    githubCreatedAt: Date;
    githubUpdatedAt: Date;
    url: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
}

const GithubPullRequests = () => {
    const { project } = useProject()
    const [selectedState, setSelectedState] = useState<PRState>('open')
    const [selectedPR, setSelectedPR] = useState<number | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedPRDetail, setSelectedPRDetail] = useState<PullRequestType | null>(null)
    const [approveDialogOpen, setApproveDialogOpen] = useState(false)
    const [mergeDialogOpen, setMergeDialogOpen] = useState(false)
    const [approveComment, setApproveComment] = useState('')
    const [comment, setComment] = useState('')
    const [mergeMethod, setMergeMethod] = useState<'merge' | 'squash' | 'rebase'>('merge')

    const { data: pullRequests, isLoading, refetch } = api.project.getGithubPullRequests.useQuery({
        projectId: project?.id ?? '',
        state: selectedState
    }, {
        enabled: !!project?.id,
        refetchInterval: 30000 // Refetch every 30 seconds
    })

    const syncMutation = api.project.syncGithubPullRequests.useMutation()
    const approveMutation = api.project.approvePullRequest.useMutation()
    const mergeMutation = api.project.mergePullRequest.useMutation()
    const addCommentMutation = api.project.addCommentToPR.useMutation()

    // Fetch commits and comments for selected PR
    const { data: prCommits } = api.project.getPRCommits.useQuery({
        projectId: project?.id ?? '',
        prNumber: selectedPRDetail?.prNumber ?? 0
    }, {
        enabled: !!project?.id && !!selectedPRDetail && isSheetOpen
    })

    const { data: prComments } = api.project.getPRComments.useQuery({
        projectId: project?.id ?? '',
        prNumber: selectedPRDetail?.prNumber ?? 0
    }, {
        enabled: !!project?.id && !!selectedPRDetail && isSheetOpen
    })

    const { data: prFiles } = api.project.getPRFiles.useQuery({
        projectId: project?.id ?? '',
        prNumber: selectedPRDetail?.prNumber ?? 0
    }, {
        enabled: !!project?.id && !!selectedPRDetail && isSheetOpen
    })

    const handleSync = async () => {
        if (!project?.id) return
        
        toast.promise(syncMutation.mutateAsync({ projectId: project.id }), {
            loading: 'Syncing pull requests from GitHub...',
            success: (data) => {
                refetch()
                return `Synced ${data.count} pull requests successfully`
            },
            error: 'Failed to sync pull requests'
        })
    }

    const handleMerge = async () => {
        if (!project?.id || !selectedPRDetail) return

        toast.promise(
            mergeMutation.mutateAsync({
                projectId: project.id,
                prNumber: selectedPRDetail.prNumber,
                mergeMethod
            }),
            {
                loading: 'Merging pull request...',
                success: () => {
                    setMergeDialogOpen(false)
                    setIsSheetOpen(false)
                    refetch()
                    return 'Pull request merged successfully'
                },
                error: 'Failed to merge pull request'
            }
        )
    }

    const handleApprove = async () => {
        if (!project?.id || !selectedPRDetail) return

        toast.promise(
            approveMutation.mutateAsync({
                projectId: project.id,
                prNumber: selectedPRDetail.prNumber,
                comment: approveComment || undefined
            }),
            {
                loading: 'Approving pull request...',
                success: () => {
                    setApproveDialogOpen(false)
                    setApproveComment('')
                    refetch()
                    return 'Pull request approved successfully'
                },
                error: 'Failed to approve pull request'
            }
        )
    }

    const handleAddComment = async () => {
        if (!project?.id || !selectedPRDetail || !comment.trim()) return

        toast.promise(
            addCommentMutation.mutateAsync({
                projectId: project.id,
                prNumber: selectedPRDetail.prNumber,
                comment
            }),
            {
                loading: 'Adding comment...',
                success: () => {
                    setComment('')
                    return 'Comment added successfully'
                },
                error: 'Failed to add comment'
            }
        )
    }

    const handlePRClick = (pr: PullRequestType) => {
        setSelectedPRDetail(pr)
        setIsSheetOpen(true)
    }

    const getStateIcon = (state: string, draft: boolean) => {
        if (draft) return <AlertCircle className="size-4 text-gray-600" />
        if (state === 'open') return <Clock className="size-4 text-green-600" />
        if (state === 'merged') return <GitMerge className="size-4 text-purple-600" />
        if (state === 'closed') return <XCircle className="size-4 text-red-600" />
        return <XCircle className="size-4 text-gray-600" />
    }

    const getStateColor = (state: string, draft: boolean) => {
        if (draft) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        if (state === 'open') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        if (state === 'merged') return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
        if (state === 'closed') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        return 'bg-gray-100 text-gray-800'
    }

    const getStateBadgeText = (state: string, draft: boolean) => {
        if (draft) return 'Draft'
        if (state === 'merged') return 'Merged'
        return state.charAt(0).toUpperCase() + state.slice(1)
    }

    return (
        <Card className="col-span-3">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <GitPullRequest className="size-5" />
                            Pull Requests
                        </CardTitle>
                        <CardDescription>
                            Review, approve, and merge pull requests
                        </CardDescription>
                    </div>
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
            </CardHeader>
            <CardContent>
                <Tabs value={selectedState} onValueChange={(value) => setSelectedState(value as PRState)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="open">Open</TabsTrigger>
                        <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>

                    <TabsContent value={selectedState} className="space-y-4 mt-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading pull requests...
                            </div>
                        ) : !pullRequests || pullRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No {selectedState !== 'all' ? selectedState : ''} pull requests found
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pullRequests.map((pr) => (
                                    <Card 
                                        key={pr.id} 
                                        className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                                        onClick={() => handlePRClick(pr)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <Avatar className="size-8 mt-1">
                                                <AvatarImage src={pr.authorAvatar || ''} />
                                                <AvatarFallback>{pr.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-foreground">
                                                                #{pr.prNumber} {pr.title}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                                                            <span>by {pr.author}</span>
                                                            <span>•</span>
                                                            <span>{new Date(pr.githubUpdatedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={getStateColor(pr.state, pr.draft)}>
                                                            {getStateIcon(pr.state, pr.draft)}
                                                            <span className="ml-1">{getStateBadgeText(pr.state, pr.draft)}</span>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                
                                                {pr.body && (
                                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                        {pr.body}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        <GitBranch className="size-3 mr-1" />
                                                        {pr.headBranch} → {pr.baseBranch}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-xs">
                                                        <span className="text-green-600">+{pr.additions}</span>
                                                        <span className="mx-1 text-muted-foreground">/</span>
                                                        <span className="text-red-600">-{pr.deletions}</span>
                                                    </Badge>
                                                    {pr.changedFiles > 0 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Files className="size-3 mr-1" />
                                                            {pr.changedFiles}
                                                        </Badge>
                                                    )}
                                                    {pr.labels && pr.labels.length > 0 && (
                                                        <>
                                                            {pr.labels.slice(0, 2).map((label, idx) => (
                                                                <Badge key={idx} variant="secondary" className="text-xs">
                                                                    {label}
                                                                </Badge>
                                                            ))}
                                                            {pr.labels.length > 2 && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    +{pr.labels.length - 2}
                                                                </Badge>
                                                            )}
                                                        </>
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

                {/* Approve Dialog */}
                <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Approve Pull Request</DialogTitle>
                            <DialogDescription>
                                Approve pull request #{selectedPR}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="approve-comment">Comment (optional)</Label>
                                <Textarea
                                    id="approve-comment"
                                    value={approveComment}
                                    onChange={(e) => setApproveComment(e.target.value)}
                                    placeholder="Add a comment to your approval..."
                                    rows={4}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleApprove}
                                disabled={approveMutation.isPending}
                            >
                                {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Merge Dialog */}
                <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Merge Pull Request</DialogTitle>
                            <DialogDescription>
                                Merge pull request #{selectedPR} into the base branch
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="merge-method">Merge Method</Label>
                                <Select value={mergeMethod} onValueChange={(value: any) => setMergeMethod(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="merge">Create a merge commit</SelectItem>
                                        <SelectItem value="squash">Squash and merge</SelectItem>
                                        <SelectItem value="rebase">Rebase and merge</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleMerge}
                                disabled={mergeMutation.isPending}
                            >
                                {mergeMutation.isPending ? 'Merging...' : 'Merge Pull Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* PR Detail Sheet */}
                <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                    <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-6">
                        {selectedPRDetail && (
                            <>
                                <SheetHeader className="pb-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="size-10">
                                            <AvatarImage src={selectedPRDetail.authorAvatar || ''} />
                                            <AvatarFallback>
                                                {selectedPRDetail.author.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <SheetTitle className="text-xl">
                                                #{selectedPRDetail.prNumber} {selectedPRDetail.title}
                                            </SheetTitle>
                                            <SheetDescription className="flex items-center gap-2 mt-1">
                                                <span>Opened by {selectedPRDetail.author}</span>
                                                <span>•</span>
                                                <span>{new Date(selectedPRDetail.githubCreatedAt).toLocaleDateString()}</span>
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="mt-6 space-y-6">
                                    {/* Status and Metadata */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge className={getStateColor(selectedPRDetail.state, selectedPRDetail.draft)}>
                                            {getStateIcon(selectedPRDetail.state, selectedPRDetail.draft)}
                                            <span className="ml-1">{getStateBadgeText(selectedPRDetail.state, selectedPRDetail.draft)}</span>
                                        </Badge>
                                        {selectedPRDetail.mergeable && selectedPRDetail.state === 'open' && !selectedPRDetail.draft && (
                                            <Badge variant="outline" className="text-green-600">
                                                <CheckCircle2 className="size-3 mr-1" />
                                                Mergeable
                                            </Badge>
                                        )}
                                        {!selectedPRDetail.mergeable && selectedPRDetail.state === 'open' && (
                                            <Badge variant="outline" className="text-red-600">
                                                <XCircle className="size-3 mr-1" />
                                                Conflicts
                                            </Badge>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Branch Info */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <GitBranch className="size-4" />
                                            <span>Branches</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline" className="font-mono">
                                                {selectedPRDetail.headBranch}
                                            </Badge>
                                            <span className="text-muted-foreground">→</span>
                                            <Badge variant="outline" className="font-mono">
                                                {selectedPRDetail.baseBranch}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Code Statistics */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <FileCode className="size-4" />
                                            <span>Code Changes</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Badge variant="outline">
                                                <Files className="size-3 mr-1" />
                                                {selectedPRDetail.changedFiles} {selectedPRDetail.changedFiles === 1 ? 'file' : 'files'}
                                            </Badge>
                                            <Badge variant="outline" className="text-green-600">
                                                <Plus className="size-3 mr-1" />
                                                {selectedPRDetail.additions}
                                            </Badge>
                                            <Badge variant="outline" className="text-red-600">
                                                <Minus className="size-3 mr-1" />
                                                {selectedPRDetail.deletions}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Labels */}
                                    {selectedPRDetail.labels && selectedPRDetail.labels.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <Tag className="size-4" />
                                                <span>Labels</span>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {selectedPRDetail.labels.map((label, idx) => (
                                                    <Badge key={idx} variant="secondary">
                                                        {label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* File Changes */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <FileCode className="size-4" />
                                                Changed Files {prFiles && `(${prFiles.length})`}
                                            </h4>
                                        </div>
                                        {prFiles && prFiles.length > 0 ? (
                                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                                {prFiles.map((file, idx) => (
                                                    <div key={idx} className="p-3 bg-muted rounded-md border border-border hover:bg-muted/80 transition-colors">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Badge 
                                                                        variant={
                                                                            file.status === 'added' ? 'default' : 
                                                                            file.status === 'removed' ? 'destructive' : 
                                                                            file.status === 'modified' ? 'secondary' : 
                                                                            'outline'
                                                                        }
                                                                        className="text-xs capitalize"
                                                                    >
                                                                        {file.status}
                                                                    </Badge>
                                                                    {file.previousFilename && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            renamed from {file.previousFilename}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-sm font-mono break-all">
                                                                    {file.filename}
                                                                </p>
                                                                <div className="flex items-center gap-3 mt-2 text-xs">
                                                                    {file.additions > 0 && (
                                                                        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                                                            <Plus className="size-3" />
                                                                            {file.additions}
                                                                        </span>
                                                                    )}
                                                                    {file.deletions > 0 && (
                                                                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                                                            <Minus className="size-3" />
                                                                            {file.deletions}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-muted-foreground">
                                                                        {file.changes} {file.changes === 1 ? 'change' : 'changes'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-6 w-6 p-0 shrink-0"
                                                                asChild
                                                            >
                                                                <Link href={file.blobUrl} target="_blank">
                                                                    <ExternalLink className="size-3" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                        {file.patch && (
                                                            <details className="mt-2">
                                                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                                                    View diff
                                                                </summary>
                                                                <pre className="mt-2 text-xs bg-background p-2 rounded border border-border overflow-x-auto max-h-48">
                                                                    <code>{file.patch}</code>
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No file changes found</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Commits */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <GitCommit className="size-4" />
                                                Commits {prCommits && `(${prCommits.length})`}
                                            </h4>
                                        </div>
                                        {prCommits && prCommits.length > 0 ? (
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {prCommits.map((commit) => (
                                                    <div key={commit.sha} className="flex gap-3 p-3 bg-muted rounded-md hover:bg-muted/80 transition-colors">
                                                        <Avatar className="size-6 mt-0.5">
                                                            <AvatarImage src={commit.authorAvatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {commit.author.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium line-clamp-2">
                                                                {commit.message.split('\n')[0]}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                                <span>{commit.author}</span>
                                                                <span>•</span>
                                                                <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                                                                <span>•</span>
                                                                <span>{new Date(commit.date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            asChild
                                                        >
                                                            <Link href={commit.url} target="_blank">
                                                                <ExternalLink className="size-3" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic">No commits found</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Comments & Conversations */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                <MessageSquare className="size-4" />
                                                Conversation {prComments && `(${prComments.length})`}
                                            </h4>
                                        </div>
                                        <ul className="space-y-6 max-h-96 overflow-y-auto pr-2">
                                            {/* Initial PR description */}
                                            <li className="relative flex gap-x-4">
                                                <div className={cn(
                                                    prComments && prComments.length > 0 ? '-bottom-6' : 'h-6',
                                                    'absolute left-0 top-0 flex w-8 justify-center'
                                                )}>
                                                    <div className='w-px bg-border'></div>
                                                </div>
                                                <Avatar className="relative size-8 flex-none mt-1">
                                                    <AvatarImage src={selectedPRDetail.authorAvatar || ''} />
                                                    <AvatarFallback className="text-xs">
                                                        {selectedPRDetail.author.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-auto rounded-md bg-muted p-4">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <span className="text-sm font-medium">{selectedPRDetail.author}</span>
                                                        <Badge variant="outline" className="text-xs">Created PR</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(selectedPRDetail.githubCreatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {selectedPRDetail.body ? (
                                                        <div data-color-mode="light">
                                                            <MDEditor.Markdown 
                                                                source={selectedPRDetail.body} 
                                                                className="text-sm bg-transparent"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground italic">No description provided</p>
                                                    )}
                                                </div>
                                            </li>

                                            {/* Comments */}
                                            {prComments && prComments.length > 0 ? (
                                                <>
                                                    {prComments.map((comment, commentIdx) => (
                                                    <li key={comment.id} className="relative flex gap-x-4">
                                                        <div className={cn(
                                                            commentIdx === prComments.length - 1 ? 'h-6' : '-bottom-6',
                                                            'absolute left-0 top-0 flex w-8 justify-center'
                                                        )}>
                                                            <div className='w-px bg-border'></div>
                                                        </div>
                                                        <Avatar className="relative size-8 flex-none mt-1">
                                                            <AvatarImage src={comment.authorAvatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {comment.author.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-auto rounded-md bg-muted p-4">
                                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium">{comment.author}</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {comment.type === 'review' ? 'Code Review' : 'Comment'}
                                                                    </Badge>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    asChild
                                                                >
                                                                    <Link href={comment.url} target="_blank">
                                                                        <ExternalLink className="size-3" />
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                            {'path' in comment && comment.path && (
                                                                <p className="text-xs text-muted-foreground font-mono mb-2">
                                                                    📄 {comment.path}
                                                                </p>
                                                            )}
                                                            <div data-color-mode="light">
                                                                <MDEditor.Markdown 
                                                                    source={comment.body} 
                                                                    className="text-sm bg-transparent"
                                                                />
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                                </>
                                            ) : null}
                                        </ul>
                                    </div>

                                    <Separator />

                                    {/* Timeline */}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium">Timeline</h4>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="size-3" />
                                                <span>Created: {new Date(selectedPRDetail.githubCreatedAt).toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="size-3" />
                                                <span>Last updated: {new Date(selectedPRDetail.githubUpdatedAt).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    {selectedPRDetail.state === 'open' && !selectedPRDetail.draft && (
                                        <>
                                            <Separator />
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium">Actions</h4>
                                                <div className="flex gap-2 flex-wrap">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setApproveDialogOpen(true)}
                                                    >
                                                        <CheckCircle2 className="size-4 mr-2" />
                                                        Approve
                                                    </Button>
                                                    {selectedPRDetail.mergeable && (
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            onClick={() => setMergeDialogOpen(true)}
                                                        >
                                                            <GitMerge className="size-4 mr-2" />
                                                            Merge
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

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
                                                <Link href={selectedPRDetail.url} target="_blank">
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

export default GithubPullRequests
