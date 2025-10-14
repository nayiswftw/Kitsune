"use client"
import MDEditor from '@uiw/react-md-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import useProject from '@/hooks/use-project'
import Image from 'next/image';
import React from 'react'
import { askQuestion } from './action';
import { readStreamableValue } from "@ai-sdk/rsc"
import CodeReferences from './code-references';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import useRefetch from '@/hooks/use-refetch';
import { useTheme } from 'next-themes';


function AskQuestionCard() {
    const { project } = useProject()
    const [open, setOpen] = React.useState(false);
    const [question, setQuestion] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [filesReferences, setFilesReferences] = React.useState<{ fileName: string, sourceCode: string, summary: string }[]>([])
    const [answer, setAnswer] = React.useState('')
    const [mounted, setMounted] = React.useState(false);
    const { resolvedTheme } = useTheme();
    
    // Ensure component is mounted before using theme
    React.useEffect(() => {
        setMounted(true);
    }, []);
    
    // Use light logo in dark mode
    const isDark = mounted && resolvedTheme === 'dark';
    const logoSrc = isDark ? '/logo-light.svg' : '/logo.svg';

    const saveAnswer = api.project.saveAnswer.useMutation();

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        setAnswer('')
        setFilesReferences([])
        e.preventDefault();
        if (!project?.id) return;
        setLoading(true);

        const { output, filesReferences } = await askQuestion(question, project.id);
        setOpen(true);
        setFilesReferences(filesReferences)

        for await (const delta of readStreamableValue(output)) {
            if (delta) {
                setAnswer((ans) => ans + delta)
            }
        }
        setLoading(false);
    }
    const refetch = useRefetch();

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='sm:max-w-5xl max-h-[90vh] overflow-hidden flex flex-col'>
                    <DialogHeader className='flex-shrink-0'>
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <Image src={logoSrc} alt="Kitsune" width={40} height={40} />
                                <DialogTitle className="text-lg font-semibold">Kitsune Answer</DialogTitle>
                            </div>
                            <Button 
                                disabled={saveAnswer.isPending} 
                                variant='outline' 
                                onClick={() => {
                                    saveAnswer.mutate({
                                        projectId: project!.id,
                                        question,
                                        answer,
                                        filesReferences
                                    }, {
                                        onSuccess: () => {
                                            toast.success("Answer saved!")
                                            refetch();
                                        },
                                        onError: () => {
                                            toast.error("Failed to save answer!")
                                        }
                                    })
                                }}
                                className="ml-2"
                            >
                                Save Answer
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                        <MDEditor.Markdown 
                            source={answer} 
                            className='max-w-full !h-full prose prose-sm max-w-none prose-invert bg-transparent' 
                        />
                    </div>

                    <div className="">
                        <CodeReferences fileReferences={filesReferences} />
                        <div className="mt-4 w-full">
                            <Button onClick={() => { setOpen(false) }} type='button' className="w-full text-white">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>Ask a question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which files should I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)} />
                        <div className="h-4"></div>
                        <Button type='submit' disabled={loading} className='w-full text-white' >
                            Ask Kitsune!
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard