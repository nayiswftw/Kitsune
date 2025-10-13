import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Document } from "@langchain/core/documents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

export const aiSummariseCommit = async (diff: string) => {
    const response = await model.generateContent([
        `You are an expert progammer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff --git a/lib/index.js b/lib/index.js
        index aaadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
        A line starting with \`+\` means it was added.
        A line starting with \`-\` means that line was deleted.
        A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
        It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        • Raised the amount of return recordings from \`10\` to \`100\` [packages/server/recording_api.ts]. [packages/server/constants.ts]
        • Fixed a type in the github action name [.gitjhub/workflows/git-commit-summarizer.yml]
        • Moved the \`octokit\` initialization to a separate file [src/ocotkit.ts], [src/index.ts]
        • Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        • Lowered numeric tolerance for text files 
        \`\`\`
        Most commits will have less comments than this example list.
        The last commit does not include the file names.
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only as an example of appropriate comments.`,

        `Please summarise the following diff file: \n\n${diff}`
    ]);
    return response.response.text();
}

export async function summariseCode(doc: Document) {
    console.log("getting summary for", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000);
    const response = await model.generateContent([
        `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects `,
        `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file. `,
        `Here is the code: 
        ---
        ${code}
        ---
           Give a summary no more than 100 words of the code above. `
    ]);
    return response.response.text();
}

export async function generateEmbedding(summary: string) {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await model.embedContent(summary);
    const embedding = result.embedding;
    return embedding.values;
}

