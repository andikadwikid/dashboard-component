"use client"

import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Home,
    Inbox,
    Plus,
    Projector,
    Search,
    Settings,
    User,
} from "lucide-react"
import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { LucideIcon } from "lucide-react"

// ✅ Data dinamis untuk menu
type MenuItem = {
    title: string
    url?: string
    icon?: LucideIcon
    badge?: string | number
    children?: MenuItem[]
    collapsible?: boolean
}

const menuGroups: {
    label: string
    action?: { icon: LucideIcon; label: string }
    items: MenuItem[]
}[] = [
        {
            label: "Application",
            items: [
                { title: "Home", url: "/", icon: Home },
                { title: "Inbox", url: "/inbox", icon: Inbox, badge: 2 },
                { title: "Calendar", url: "/calendar", icon: Calendar },
                { title: "Search", url: "/search", icon: Search },
                { title: "Settings", url: "/settings", icon: Settings },
            ],
        },
        {
            label: "Project",
            action: { icon: Plus, label: "Add Project" },
            items: [
                { title: "See All Project", url: "/projects", icon: Projector },
                { title: "Add Project", url: "/projects/add", icon: Plus },
            ],
        },
        {
            label: "Help",
            items: [
                { title: "See All Project", url: "/help/projects", icon: Projector },
                { title: "Add Project", url: "/help/add", icon: Plus },
            ],
        },
        {
            label: "Nested Item",
            items: [
                {
                    title: "See All Project",
                    url: "/nested",
                    icon: Projector,
                    children: [
                        { title: "Add Project", url: "/nested/add", icon: Plus },
                        { title: "Add Category", url: "/nested/category", icon: Plus },
                    ],
                },
            ],
        },
    ]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/">
                                🌱 <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator />
            </SidebarHeader>

            <SidebarContent>
                {menuGroups.map((group, idx) => {

                    // Default group
                    return (
                        <Collapsible key={idx} defaultOpen className="group/collapsible">
                            <SidebarGroup>
                                <SidebarGroupLabel asChild>
                                    <CollapsibleTrigger>
                                        {group.label}
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </CollapsibleTrigger>
                                </SidebarGroupLabel>

                                <CollapsibleContent>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {group.items.map((item) => (
                                                <SidebarMenuItem key={item.title}>
                                                    <SidebarMenuButton asChild>
                                                        <Link href={item.url || "#"}>
                                                            {item.icon && <item.icon />}
                                                            <span>{item.title}</span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                    {item.badge && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}

                                                    {/* nested */}
                                                    {item.children && (
                                                        <SidebarMenuSub>
                                                            {item.children.map((child) => (
                                                                <SidebarMenuSubItem key={child.title}>
                                                                    <SidebarMenuSubButton asChild>
                                                                        <Link href={child.url || "#"}>
                                                                            {child.icon && <child.icon />}
                                                                            <span>{child.title}</span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            ))}
                                                        </SidebarMenuSub>
                                                    )}
                                                </SidebarMenuItem>
                                            ))}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </CollapsibleContent>
                            </SidebarGroup>
                        </Collapsible>
                    )
                })}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User /> John Doe <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                                <DropdownMenuItem>Account</DropdownMenuItem>
                                <DropdownMenuItem>Setting</DropdownMenuItem>
                                <DropdownMenuItem>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}