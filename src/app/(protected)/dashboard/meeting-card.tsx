'use client'
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadFile } from '@/lib/firebase';
import { Presentation, Upload } from 'lucide-react';
import React from 'react'
import { useDropzone } from 'react-dropzone';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useProject from '@/hooks/use-project';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
const MeetingCard = () => {
    const { project } = useProject();
    const processMeeting = useMutation({
        mutationFn: async (data: { meetingUrl: string, meetingId: string }) => {
            const { meetingUrl, meetingId } = data;
            const response = await axios.post('/api/process-meeting', { meetingUrl, meetingId })
            return response.data;
        },
        onError: (error: any) => {
            console.error('Error processing meeting:', error)
            const errorMessage = error.response?.data?.details || error.message || 'Failed to process meeting'
            toast.error(errorMessage)
        },
        onSuccess: () => {
            toast.success('Meeting processed successfully!')
        }
    })

    const router = useRouter();
    const [isUploading, setIsUploading] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const uploadMeeting = api.project.uploadMeeting.useMutation()

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a']
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if (!project) return;
            setIsUploading(true);
            console.log(acceptedFiles);
            const file = acceptedFiles[0];
            if (!file) return;
            const downloadUrl = await uploadFile(file as File, setProgress) as string
            uploadMeeting.mutate({
                projectId: project.id,
                meetingUrl: downloadUrl,
                name: file.name
            }, {
                onSuccess: (meeting) => {
                    toast.success("Meeting uploaded successfully")
                    router.push('/meetings')
                    processMeeting.mutateAsync({ meetingUrl: downloadUrl, meetingId: meeting.id })
                }
            })
            setIsUploading(false);

        }

    })
    return (
        <>
            <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()}>
                {!isUploading && (
                    <>
                        <Presentation className='h-10 w-10 animate-bounce' />
                        <h3 className="mt-2 text-sm font-semibold text-foreground">
                            Create a new meeting
                        </h3>
                        <p className="mt-1 text-center text-sm text-muted-foreground">
                            Analyse your meeting with Kitsune.
                            <br />
                            Powered by AI.
                        </p>
                        <div className="mt-6">
                            <Button disabled={isUploading} className='text-white'>
                                <Upload className='-ml-0.5 mr-1.5 h-5 w-5 ' aria-hidden="true" />
                                Upload Meeting
                                <input className='hidden' {...getInputProps()} />
                            </Button>
                        </div>
                    </>
                )}
                {isUploading && (
                    <div className=''>
                        <CircularProgressbar value={progress} text={`${progress}%`} className="size-20" styles={
                            buildStyles({
                                pathColor: 'hsl(var(--primary))',
                                textColor: 'hsl(var(--foreground))',
                            })
                        } />
                        <p className="text-sm text-muted-foreground text-center">Upload your meeting...</p>
                    </div>
                )}
            </Card>
        </>
    )
}

export default MeetingCard