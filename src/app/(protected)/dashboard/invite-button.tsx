'use client'
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import useProject from '@/hooks/use-project';
import React from 'react'
import { toast } from 'sonner';

const InviteButton = () => {
    const { projectId } = useProject();
    const [open, setOpen] = React.useState(false);
    const [inviteLink, setInviteLink] = React.useState('');

    // Set invite link only on client side
    React.useEffect(() => {
        if (typeof window !== 'undefined' && projectId) {
            setInviteLink(`${window.location.origin}/join/${projectId}`);
        }
    }, [projectId]);

    const handleCopyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            toast.success("Copied to clipboard");
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Members</DialogTitle>
                    </DialogHeader>
                    <p className='text-sm text-muted-foreground'>
                        Ask them to copy and paste this link
                    </p>
                    <Input 
                        readOnly
                        className='mt-4 cursor-pointer'
                        onClick={handleCopyToClipboard}
                        value={inviteLink}
                        placeholder="Loading invite link..."
                    />
                </DialogContent>
            </Dialog>
            <Button size={'sm'} onClick={() => setOpen(true)} className='text-white'>
                Invite Members
            </Button>
        </>
    )
}

export default InviteButton