import { AssemblyAI } from "assemblyai";
const client = new AssemblyAI({apiKey: process.env.ASSEMBLYAI_API_KEY!});

function msToTime(ms:number) {
    const seconds = ms/ 1000;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export const processMeeting = async (meetingUrl: string) => {
    try {
        console.log('Starting transcription for URL:', meetingUrl)
        
        const transcript = await client.transcripts.transcribe({
            audio: meetingUrl,
            auto_chapters: true,
        })
        
        console.log('Transcription completed. Status:', transcript.status)
        
        if (transcript.status === 'error') {
            console.error('Transcription error:', transcript.error)
            throw new Error(`Transcription failed: ${transcript.error}`)
        }
        
        if(!transcript.text) {
            throw new Error("No transcript text found");
        }

        const summaries = transcript.chapters?.map(chapter => ({
            start: msToTime(chapter.start),
            end: msToTime(chapter.end),
            gist: chapter.gist,
            headline: chapter.headline,
            summary: chapter.summary
        })) || [];
        
        console.log('Summaries generated:', summaries.length)

        return {
            transcript, summaries
        }
    } catch (error) {
        console.error('Error in processMeeting:', error)
        throw error
    }
}
