import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import { generateEmbedding, summariseCode } from "./gemini";
import type { Document } from "@langchain/core/documents";
import { db } from "@/server/db";
export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['node_modules/**', 'vendor/**', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Gemfile.lock', 'Cargo.lock', 'composer.lock', 'poetry.lock', 'Pipfile.lock', 'dist/**', 'build/**', 'out/**', 'target/**', 'bin/**', 'obj/**', '*.exe', '*.dll', '*.so', '*.dylib', '*.class', '*.pyc', '*.pyo', '__pycache__/**', '.git/**', '.gitignore', '.vscode/**', '.idea/**', '*.swp', '*.swo', '*~', '*.bak', '.vs/**', '*.suo', '*.user', '.DS_Store', 'Thumbs.db', 'desktop.ini', '.env', '.env.*', '*.local', '*.log', 'logs/**', 'tmp/**', 'temp/**', '.cache/**', '.npm/**', '.yarn/**', '.pnp.*', '.next/**', '.nuxt/**', '.parcel-cache/**', '*.egg-info/**', 'coverage/**', '.nyc_output/**', '*.lcov', '*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.ico', '*.webp', '*.mp4', '*.mp3', '*.wav', '*.pdf', '*.ttf', '*.woff', '*.woff2', '*.eot', '*.min.js', '*.min.css', '*.bundle.js', 'CHANGELOG.md', 'LICENSE', 'LICENSE.md', 'CONTRIBUTING.md', '*.db', '*.sqlite', '*.sqlite3', '*.zip', '*.tar', '*.gz', '*.rar', '*.7z'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs;
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await generateEmbeddings(docs)

    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        console.log(`Processing embedding ${index} of ${allEmbeddings.length}`);
        if (!embedding) return

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileNamee,
                projectId
            }
        })

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "summaryEmbedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariseCode(doc);
        const embedding = await generateEmbedding(summary);
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileNamee: doc.metadata.source
        }
    }));
}