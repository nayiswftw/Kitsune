import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { pollCommits, syncGithubIssues, syncGithubPullRequests, createGithubIssue, addCommentToIssue, approvePullRequest, requestChangesOnPullRequest, mergePullRequest, addCommentToPullRequest, getPullRequestReviews, getPullRequestCommits, getPullRequestComments, getIssueComments, getIssueTimeline, getPullRequestFiles } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { clerkClient } from "@clerk/nextjs/server";

export const projectRouter = createTRPCRouter({

    createProject: protectedProcedure.input(
        z.object({
            name: z.string(),
            githubUrl: z.string(),
            githubToken: z.string().optional()
        })
    ).mutation(async ({ ctx, input }) => {
        // Ensure user exists in database (handle cases where user wasn't synced)
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(ctx.user.userId!);

        await ctx.db.user.upsert({
            where: {
                id: ctx.user.userId!
            },
            update: {},
            create: {
                id: ctx.user.userId!,
                emailAddress: clerkUser.emailAddresses[0]?.emailAddress,
                firstName: clerkUser.firstName,
                lastName: clerkUser.lastName,
                imageUrl: clerkUser.imageUrl,
            }
        });

        const project = await ctx.db.project.create({
            data: {
                githubUrl: input.githubUrl,
                name: input.name,
                userToProjects: {
                    create: {
                        userId: ctx.user.userId!,

                    }
                }
            }
        })
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id);
        return project;
    }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
        return await ctx.db.project.findMany({
            where: {
                userToProjects: {
                    some: {
                        userId: ctx.user.userId!
                    }
                },
                deletedAt: null
            }
        })
    }),
    getCommits: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        pollCommits(input.projectId).then().catch(console.error);
        return await ctx.db.commit.findMany({ where: { projectId: input.projectId } })
    }),
    saveAnswer: protectedProcedure.input(z.object({
        projectId: z.string(),
        answer: z.string(),
        question: z.string(),
        filesReferences: z.array(z.object({
            fileName: z.string(),
            sourceCode: z.string(),
            summary: z.string()
        }))
    })).mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
            data: {
                answer: input.answer,
                filesReferences: JSON.stringify(input.filesReferences),
                projectId: input.projectId,
                question: input.question,
                userId: ctx.user.userId!,
            }
        })
    }),
    getQuestions: protectedProcedure.input(z.object({
        projectId: z.string()
    })).query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
            where: {
                projectId: input.projectId,
            },
            include: {
                user: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    }),
    uploadMeeting: protectedProcedure.input(z.object({ projectId: z.string(), meetingUrl: z.string(), name: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const meeting = await ctx.db.meeting.create({
                data: {
                    meetingUrl: input.meetingUrl,
                    name: input.name,
                    projectId: input.projectId,
                    status: 'PROCESSING'
                }
            })
            return meeting;
        }),
    getMeetings: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
            where: {
                projectId: input.projectId,
            }, include: {
                issues: true
            }
        })
    }),
    deleteMeeting: protectedProcedure.input(z.object({ meetingId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.meeting.delete({ where: { id: input.meetingId } })
    }),
    getMeetingById: protectedProcedure.input(z.object({ meetingId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
            where: { id: input.meetingId },
            include: { issues: true }
        })
    }),
    archiveProject: protectedProcedure.input(z.object({ projectId: z.string() })).mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
            where: { id: input.projectId },
            data: { deletedAt: new Date() }
        })
    }),
    getteamMembers: protectedProcedure.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({
            where: { projectId: input.projectId },
            include: { user: true }
        })
    }),
    getGithubIssues: protectedProcedure.input(z.object({
        projectId: z.string(),
        state: z.enum(['open', 'closed', 'all']).optional()
    })).query(async ({ ctx, input }) => {
        // Sync in background
        syncGithubIssues(input.projectId).then().catch(console.error);

        return await ctx.db.githubIssue.findMany({
            where: {
                projectId: input.projectId,
                ...(input.state && input.state !== 'all' ? { state: input.state } : {})
            },
            orderBy: {
                githubUpdatedAt: 'desc'
            }
        });
    }),

    syncGithubIssues: protectedProcedure.input(z.object({
        projectId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const count = await syncGithubIssues(input.projectId);
        return { success: true, count };
    }),

    createGithubIssue: protectedProcedure.input(z.object({
        projectId: z.string(),
        title: z.string(),
        body: z.string(),
        labels: z.array(z.string()).optional(),
        assignees: z.array(z.string()).optional()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await createGithubIssue(
            project.githubUrl,
            input.title,
            input.body,
            input.labels,
            input.assignees
        );

        // Sync to get the new issue in DB
        await syncGithubIssues(input.projectId);

        return result;
    }),

    addCommentToIssue: protectedProcedure.input(z.object({
        projectId: z.string(),
        issueNumber: z.number(),
        comment: z.string()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await addCommentToIssue(
            project.githubUrl,
            input.issueNumber,
            input.comment
        );

        return result;
    }),

    // ============ GitHub Pull Requests Procedures ============

    getGithubPullRequests: protectedProcedure.input(z.object({
        projectId: z.string(),
        state: z.enum(['open', 'closed', 'all']).optional()
    })).query(async ({ ctx, input }) => {
        // Sync in background
        syncGithubPullRequests(input.projectId).then().catch(console.error);

        return await ctx.db.githubPullRequest.findMany({
            where: {
                projectId: input.projectId,
                ...(input.state && input.state !== 'all' ? { state: input.state } : {})
            },
            orderBy: {
                githubUpdatedAt: 'desc'
            }
        });
    }),

    syncGithubPullRequests: protectedProcedure.input(z.object({
        projectId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const count = await syncGithubPullRequests(input.projectId);
        return { success: true, count };
    }),

    approvePullRequest: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number(),
        comment: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await approvePullRequest(
            project.githubUrl,
            input.prNumber,
            input.comment
        );

        // Update the PR in the database
        await syncGithubPullRequests(input.projectId);

        return result;
    }),

    requestChangesOnPR: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number(),
        comment: z.string()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await requestChangesOnPullRequest(
            project.githubUrl,
            input.prNumber,
            input.comment
        );

        await syncGithubPullRequests(input.projectId);

        return result;
    }),

    mergePullRequest: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number(),
        mergeMethod: z.enum(['merge', 'squash', 'rebase']).optional(),
        commitTitle: z.string().optional(),
        commitMessage: z.string().optional()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await mergePullRequest(
            project.githubUrl,
            input.prNumber,
            input.mergeMethod,
            input.commitTitle,
            input.commitMessage
        );

        await syncGithubPullRequests(input.projectId);

        return result;
    }),

    addCommentToPR: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number(),
        comment: z.string()
    })).mutation(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const result = await addCommentToPullRequest(
            project.githubUrl,
            input.prNumber,
            input.comment
        );

        return result;
    }),

    getPRReviews: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const reviews = await getPullRequestReviews(
            project.githubUrl,
            input.prNumber
        );

        return reviews;
    }),

    getPRCommits: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const commits = await getPullRequestCommits(
            project.githubUrl,
            input.prNumber
        );

        return commits;
    }),

    getPRComments: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const comments = await getPullRequestComments(
            project.githubUrl,
            input.prNumber
        );

        return comments;
    }),

    getIssueComments: protectedProcedure.input(z.object({
        projectId: z.string(),
        issueNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const comments = await getIssueComments(
            project.githubUrl,
            input.issueNumber
        );

        return comments;
    }),

    getIssueTimeline: protectedProcedure.input(z.object({
        projectId: z.string(),
        issueNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const timeline = await getIssueTimeline(
            project.githubUrl,
            input.issueNumber
        );

        return timeline;
    }),

    getPRFiles: protectedProcedure.input(z.object({
        projectId: z.string(),
        prNumber: z.number()
    })).query(async ({ ctx, input }) => {
        const project = await ctx.db.project.findUnique({
            where: { id: input.projectId },
            select: { githubUrl: true }
        });

        if (!project?.githubUrl) {
            throw new Error('Project not found');
        }

        const files = await getPullRequestFiles(
            project.githubUrl,
            input.prNumber
        );

        return files;
    }),
});

