import { db } from '@/server/db';
import { Octokit } from 'octokit';
import axios from 'axios';
import { aiSummariseCommit } from './gemini';


export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
})

const githubUrl = 'https://github.com/docker/genai-stock';

type Response = {
    commitHash: string;
    commitMessage: string;
    commitAuthorName: string;
    commitAuthorAvatar: string;
    commitDate: string;
}
export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo
    });

    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author?.date).getTime() - new Date(a.commit.author?.date).getTime());

    return sortedCommits.slice(0, 15).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? "",
    }));
}

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessedCommits = await filterUnprocessedCommits(projectId, commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessedCommits.map(commit => {
        return summariseCommit(project.githubUrl, commit.commitHash);
    }))

    const summaries = summaryResponses.map((response) => {
        if(response.status === 'fulfilled') {
            return response.value as string;
        } 
        return "";
    })

    const commits = await db.commit.createMany({
        data:summaries.map((summary, index) => {
            return {
                projectId: projectId,
                commitHash: unprocessedCommits[index]!.commitHash,
                commitMessage: unprocessedCommits[index]!.commitMessage,
                commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
                commitDate: unprocessedCommits[index]!.commitDate,
                summary,
            }
        })
    })
    return commits;
}

async function summariseCommit(githubUrl: string, commitHash: string) {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            'Accept': 'application/vnd.github.v3.diff',
        }
    });

    return await aiSummariseCommit(data) || "";
}

async function fetchProjectGithubUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { githubUrl: true },
    });
    if (!project?.githubUrl) {
        throw new Error('Project not found or GitHub URL is missing');
    }
    return { project, githubUrl: project?.githubUrl }
}

async function filterUnprocessedCommits(projectId: string, commitHashes: Response[]) {
    const processedCommits = await db.commit.findMany({
        where: { projectId }
    });
    const unprocessedCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommits) => processedCommits.commitHash === commit.commitHash));
    return unprocessedCommits
}

// ============ GitHub Issues Functions ============

export const fetchGithubIssues = async (githubUrl: string, state: 'open' | 'closed' | 'all' = 'all') => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state,
        per_page: 50,
        sort: 'updated',
        direction: 'desc'
    });

    // Filter out pull requests (GitHub API includes PRs in issues)
    const issues = data.filter(issue => !issue.pull_request);

    return issues.map((issue: any) => ({
        issueNumber: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        author: issue.user?.login ?? 'unknown',
        authorAvatar: issue.user?.avatar_url ?? '',
        labels: issue.labels.map((label: any) => typeof label === 'string' ? label : label.name),
        assignees: issue.assignees?.map((assignee: any) => assignee.login) ?? [],
        comments: issue.comments ?? 0,
        githubCreatedAt: new Date(issue.created_at),
        githubUpdatedAt: new Date(issue.updated_at),
        url: issue.html_url,
    }));
};

export const syncGithubIssues = async (projectId: string) => {
    const { githubUrl } = await fetchProjectGithubUrl(projectId);
    const issues = await fetchGithubIssues(githubUrl);

    // Upsert issues
    for (const issue of issues) {
        await db.githubIssue.upsert({
            where: {
                projectId_issueNumber: {
                    projectId,
                    issueNumber: issue.issueNumber
                }
            },
            update: {
                title: issue.title,
                body: issue.body,
                state: issue.state,
                author: issue.author,
                authorAvatar: issue.authorAvatar,
                labels: issue.labels,
                assignees: issue.assignees,
                comments: issue.comments,
                githubUpdatedAt: issue.githubUpdatedAt,
                url: issue.url,
            },
            create: {
                projectId,
                ...issue
            }
        });
    }

    return issues.length;
};

export const createGithubIssue = async (
    githubUrl: string,
    title: string,
    body: string,
    labels?: string[],
    assignees?: string[]
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body,
        labels,
        assignees
    });

    return {
        issueNumber: data.number,
        url: data.html_url,
    };
};

export const addCommentToIssue = async (
    githubUrl: string,
    issueNumber: number,
    comment: string
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: issueNumber,
        body: comment
    });

    return data;
};

export const getIssueComments = async (
    githubUrl: string,
    issueNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data: comments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100
    });

    return comments.map((comment: any) => ({
        id: comment.id,
        body: comment.body ?? '',
        author: comment.user?.login ?? 'Unknown',
        authorAvatar: comment.user?.avatar_url ?? '',
        createdAt: new Date(comment.created_at),
        updatedAt: new Date(comment.updated_at),
        url: comment.html_url
    }));
};

export const getIssueTimeline = async (
    githubUrl: string,
    issueNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data: timeline } = await octokit.rest.issues.listEventsForTimeline({
        owner,
        repo,
        issue_number: issueNumber,
        per_page: 100
    });

    return timeline.map((event: any) => ({
        id: event.id,
        event: event.event,
        actor: event.actor?.login ?? 'Unknown',
        actorAvatar: event.actor?.avatar_url ?? '',
        createdAt: new Date(event.created_at),
        body: event.body,
        // For different event types
        label: event.label?.name,
        assignee: event.assignee?.login,
        milestone: event.milestone?.title,
        rename: event.rename,
        // For commented events
        htmlUrl: event.html_url
    }));
};

// ============ GitHub Pull Requests Functions ============

export const fetchGithubPullRequests = async (githubUrl: string, state: 'open' | 'closed' | 'all' = 'all') => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state,
        per_page: 50,
        sort: 'updated',
        direction: 'desc'
    });

    // Fetch detailed info for each PR to get accurate stats
    const detailedPRs = await Promise.all(
        data.map(async (pr: any) => {
            try {
                // Get detailed PR info which includes additions/deletions/changed_files
                const { data: detailedPR } = await octokit.rest.pulls.get({
                    owner,
                    repo,
                    pull_number: pr.number
                });

                return {
                    prNumber: detailedPR.number,
                    title: detailedPR.title,
                    body: detailedPR.body || '',
                    state: detailedPR.merged_at ? 'merged' : detailedPR.state,
                    author: detailedPR.user?.login ?? 'unknown',
                    authorAvatar: detailedPR.user?.avatar_url ?? '',
                    labels: detailedPR.labels.map((label: any) => typeof label === 'string' ? label : label.name),
                    reviewStatus: null,
                    mergeable: detailedPR.mergeable ?? false,
                    draft: detailedPR.draft ?? false,
                    baseBranch: detailedPR.base.ref,
                    headBranch: detailedPR.head.ref,
                    additions: detailedPR.additions ?? 0,
                    deletions: detailedPR.deletions ?? 0,
                    changedFiles: detailedPR.changed_files ?? 0,
                    githubCreatedAt: new Date(detailedPR.created_at),
                    githubUpdatedAt: new Date(detailedPR.updated_at),
                    url: detailedPR.html_url,
                };
            } catch (error) {
                // Fallback to basic info if detailed fetch fails
                console.error(`Failed to fetch details for PR #${pr.number}:`, error);
                return {
                    prNumber: pr.number,
                    title: pr.title,
                    body: pr.body || '',
                    state: pr.merged_at ? 'merged' : pr.state,
                    author: pr.user?.login ?? 'unknown',
                    authorAvatar: pr.user?.avatar_url ?? '',
                    labels: pr.labels.map((label: any) => typeof label === 'string' ? label : label.name),
                    reviewStatus: null,
                    mergeable: pr.mergeable ?? false,
                    draft: pr.draft ?? false,
                    baseBranch: pr.base.ref,
                    headBranch: pr.head.ref,
                    additions: 0,
                    deletions: 0,
                    changedFiles: 0,
                    githubCreatedAt: new Date(pr.created_at),
                    githubUpdatedAt: new Date(pr.updated_at),
                    url: pr.html_url,
                };
            }
        })
    );

    return detailedPRs;
};

export const syncGithubPullRequests = async (projectId: string) => {
    const { githubUrl } = await fetchProjectGithubUrl(projectId);
    const pullRequests = await fetchGithubPullRequests(githubUrl);

    // Upsert PRs
    for (const pr of pullRequests) {
        await db.githubPullRequest.upsert({
            where: {
                projectId_prNumber: {
                    projectId,
                    prNumber: pr.prNumber
                }
            },
            update: {
                title: pr.title,
                body: pr.body,
                state: pr.state,
                author: pr.author,
                authorAvatar: pr.authorAvatar,
                labels: pr.labels,
                reviewStatus: pr.reviewStatus,
                mergeable: pr.mergeable,
                draft: pr.draft,
                baseBranch: pr.baseBranch,
                headBranch: pr.headBranch,
                additions: pr.additions,
                deletions: pr.deletions,
                changedFiles: pr.changedFiles,
                githubUpdatedAt: pr.githubUpdatedAt,
                url: pr.url,
            },
            create: {
                projectId,
                ...pr
            }
        });
    }

    return pullRequests.length;
};

export const approvePullRequest = async (
    githubUrl: string,
    prNumber: number,
    comment?: string
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event: 'APPROVE',
        body: comment
    });

    return data;
};

export const requestChangesOnPullRequest = async (
    githubUrl: string,
    prNumber: number,
    comment: string
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: prNumber,
        event: 'REQUEST_CHANGES',
        body: comment
    });

    return data;
};

export const mergePullRequest = async (
    githubUrl: string,
    prNumber: number,
    mergeMethod: 'merge' | 'squash' | 'rebase' = 'merge',
    commitTitle?: string,
    commitMessage?: string
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number: prNumber,
        merge_method: mergeMethod,
        commit_title: commitTitle,
        commit_message: commitMessage
    });

    return data;
};

export const getPullRequestCommits = async (
    githubUrl: string,
    prNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.listCommits({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100
    });

    return data.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author?.name ?? commit.author?.login ?? 'Unknown',
        authorAvatar: commit.author?.avatar_url ?? '',
        date: new Date(commit.commit.author?.date ?? new Date()),
        url: commit.html_url
    }));
};

export const getPullRequestComments = async (
    githubUrl: string,
    prNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    // Get issue comments (general comments on the PR)
    const { data: issueComments } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: prNumber,
        per_page: 100
    });

    // Get review comments (code-specific comments)
    const { data: reviewComments } = await octokit.rest.pulls.listReviewComments({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100
    });

    const allComments = [
        ...issueComments.map((comment: any) => ({
            id: comment.id,
            body: comment.body ?? '',
            author: comment.user?.login ?? 'Unknown',
            authorAvatar: comment.user?.avatar_url ?? '',
            createdAt: new Date(comment.created_at),
            type: 'comment' as const,
            url: comment.html_url
        })),
        ...reviewComments.map((comment: any) => ({
            id: comment.id,
            body: comment.body ?? '',
            author: comment.user?.login ?? 'Unknown',
            authorAvatar: comment.user?.avatar_url ?? '',
            createdAt: new Date(comment.created_at),
            type: 'review' as const,
            path: comment.path,
            url: comment.html_url
        }))
    ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return allComments;
};

export const getPullRequestFiles = async (
    githubUrl: string,
    prNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data: files } = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber,
        per_page: 100
    });

    return files.map((file: any) => ({
        filename: file.filename,
        status: file.status, // 'added', 'removed', 'modified', 'renamed', etc.
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch,
        blobUrl: file.blob_url,
        rawUrl: file.raw_url,
        contentsUrl: file.contents_url,
        previousFilename: file.previous_filename, // for renamed files
    }));
};

export const addCommentToPullRequest = async (
    githubUrl: string,
    prNumber: number,
    comment: string
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber, // PRs use the same endpoint as issues for comments
        body: comment
    });

    return data;
};

export const getPullRequestReviews = async (
    githubUrl: string,
    prNumber: number
) => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL');
    }

    const { data } = await octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber
    });

    return data;
};