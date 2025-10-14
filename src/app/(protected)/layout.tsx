'use client'
import { SidebarProvider } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import React from 'react'
import { AppSidebar } from './app-sidebar'
import { api } from '@/trpc/react'
import { Coins } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

type Props = {
    children: React.ReactNode
}

const SidebarLayout = ({ children }: Props) => {
    const { data: balance } = api.billing.getBalance.useQuery();

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className='w-full m-2'>
                <div className='flex items-center gap-2 border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4'>
                     {/* Credit Balance Display */}
                     <Link href="/billing">
                        <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/40 transition-colors">
                            <div className="p-1.5 bg-primary/10 rounded-full">
                                <Coins className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-muted-foreground leading-none">Credits</span>
                                <span className="text-lg font-bold leading-none mt-0.5">{balance ?? 0}</span>
                            </div>
                        </Button>
                     </Link>
                     
                     <div className="ml-auto"></div>
                     <AnimatedThemeToggler className="mr-2 p-2 hover:bg-accent rounded-md transition-colors" />
                     <UserButton /> 
                </div>
                <div className="h-4"></div>
                <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-6rem)] p-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}

export default SidebarLayout