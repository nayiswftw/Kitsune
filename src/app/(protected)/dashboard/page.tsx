'use client'

import useProject from '@/hooks/use-project';
import { ExternalLink, Github } from 'lucide-react';
import Link from 'next/link';

import React from 'react'
import CommitLog from './commit-log';
import AskQuestionCard from './ask-question-card';
import MeetingCard from './meeting-card';
import GithubIssues from './github-issues';
import GithubPullRequests from './github-prs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArchiveButton from './archive-button';
import InviteButton from './invite-button';
import TeamMembers from './team-members';

const DashboardPage = () => {
    const { project } = useProject();
    return (
        <div>

            <div className='flex items-center justify-between flex-wrap gap-y-4'>

                {/* Github Link */}
                <div className='w-fit rounded-md bg-primary px-4 py-3'>
                    <div className="flex items-center">

                        <Github className='text-white size-5' />
                        <div className='ml-2'>
                            <p className='text-sm font-medium text-white'>

                                This project is linked to {' '}
                                <Link href={project?.githubUrl ?? ""} className='inline-flex items-center text-white/80 hover:underline'>
                                    {project?.githubUrl}
                                    <ExternalLink className='ml-1 size-4' />
                                </Link>
                            </p>

                        </div>
                    </div>
                </div>


                <div className='h-4'></div>

                <div className="flex items-center gap-4">
                    <TeamMembers />
                    <InviteButton />
                    <ArchiveButton />


                </div>


            </div>

            <div className="mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                    <AskQuestionCard />
                    <MeetingCard />
                </div>
            </div>

            <div className="mt-8"></div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="commits" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="commits">Commits</TabsTrigger>
                    <TabsTrigger value="issues">Issues</TabsTrigger>
                    <TabsTrigger value="prs">Pull Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="commits" className="mt-6">
                    <CommitLog />
                </TabsContent>

                <TabsContent value="issues" className="mt-6">
                    <GithubIssues />
                </TabsContent>

                <TabsContent value="prs" className="mt-6">
                    <GithubPullRequests />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default DashboardPage