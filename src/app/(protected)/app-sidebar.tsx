'use client'

import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import useProject from "@/hooks/use-project"
import { cn } from "@/lib/utils"
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"


const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Q&A",
        url: "/qa",
        icon: Bot
    },
    {
        title: "Meetings",
        url: "/meetings",
        icon: Presentation
    },
    {
        title: "Billing",
        url: "/billing",
        icon: CreditCard
    }
]
// const projects = [
//     {
//         name: "Project 1",
//     },
//     {
//         name: "Project 2",
//     },
//     {
//         name: "Project 3",
//     }

// ]
export function AppSidebar() {
    const pathname = usePathname();
    const { open } = useSidebar();
    const { projects, projectId, setProjectId } = useProject();

    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Logo" width={40} height={40} />
                    {open && (
                    <Image src="/nologo.svg" alt="Logo" width={164} height={40} />
                        // <h1 className="text-xl font-bold text-primary/80">
                        //     Kitsune
                        // </h1>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(item => {
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.url} className={cn({
                                                '!bg-primary !text-white': pathname == item.url
                                            })}>
                                                <item.icon size={16} />
                                                <span className="ml-2">{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects?.map(project => {
                                return (
                                    <SidebarMenuItem key={project.name}>
                                        <SidebarMenuButton asChild>
                                            <div onClick={() => {
                                                setProjectId(project.id)
                                            }}>
                                                <div className={cn(
                                                    'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                                                    {
                                                        'bg-primary text-white': project.id === projectId
                                                    }
                                                )}>
                                                    {project.name[0]}
                                                </div>
                                                <span>{project.name}</span>
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                            <div className="h-2"></div>
                            {open && (
                                <SidebarMenuItem>
                                    <Link href="/create">
                                        <Button variant="outline" size="sm" className="w-fit">
                                            <Plus />
                                            Create Project
                                        </Button>
                                    </Link>
                                </SidebarMenuItem>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}