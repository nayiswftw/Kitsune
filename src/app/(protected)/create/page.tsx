'use client'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Coins, Loader2, TrendingDown } from 'lucide-react';
import confetti from "canvas-confetti";
import { Alert, AlertDescription } from '@/components/ui/alert';

type FormInput = {
    repoUrl: string;
    projectName: string;
    githubToken?: string;
}
const CreatePage = () => {
    const { register, handleSubmit, reset } = useForm<FormInput>();
    const createProject = api.project.createProject.useMutation();
    const refresh = useRefetch()
    const [showCreditDeduction, setShowCreditDeduction] = React.useState(false);

    function onSubmit(data: FormInput) {
        setShowCreditDeduction(true);
        createProject.mutate(
            {
                githubUrl: data.repoUrl,
                name: data.projectName,
                githubToken: data.githubToken
            }, {
            onSuccess: (data) => {
                toast.success(`Project created successfully! ${data.creditsUsed} credits used.`);
                refresh();
                reset();
                setShowCreditDeduction(false);
                
                // Show confetti for successful project creation
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.6 }
                });
            },
            onError: (error) => {
                toast.error(error.message || "Error creating project");
                setShowCreditDeduction(false);
            }
        }
        )
        return true;
    }
    return (
        <div className='flex items-center gap-12 h-full justify-center'>
            <img src='undraw.svg' className='w-auto h-56' />
            <div className='w-full max-w-md'>
                {/* Credit Deduction Indicator */}
                {showCreditDeduction && (
                    <Alert className="mb-6 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                        <TrendingDown className="h-4 w-4 text-orange-700 dark:text-orange-400 animate-pulse" />
                        <AlertDescription className="text-orange-700 dark:text-orange-400 font-medium">
                            Deducting 100 credits and indexing repository...
                        </AlertDescription>
                    </Alert>
                )}

                <div>
                    <h1 className='font-semibold text-2xl'>
                        Link your GitHub Repository
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Enter the URL of your respository to link it to Kitsune
                    </p>
                </div>
                <div className="h-4"></div>
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            {...register('projectName', { required: true })}
                            placeholder='Project Name'
                            required
                            disabled={createProject.isPending}
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register('repoUrl', { required: true })}
                            placeholder='Github URL'
                            type='url'
                            required
                            disabled={createProject.isPending}
                        />
                        <div className="h-2"></div>
                        <Input
                            {...register('githubToken')}
                            placeholder='Github Token (optional)'
                            disabled={createProject.isPending}
                        />
                        <div className="h-4"></div>
                        <Button type='submit' disabled={createProject.isPending} className='w-full text-white'>
                            {createProject.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Project...
                                </>
                            ) : (
                                <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    Create Project (100 credits)
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage