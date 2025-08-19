import CardList from "@/components/CardList"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Progress } from "@/components/ui/progress"
import { BadgeCheck, Candy, Citrus, Shield } from "lucide-react"

import {
    Sheet,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import EditUser from "@/components/EditUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function SinglePage() {
    return (
        <div className="">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/users">Users</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>John Doe</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* CONTAINER */}
            <div className="mt-4 flex flex-col xl:flex-row gap-8">
                {/* LEFT */}
                <div className="w-full xl:w-1/3 space-y-6">
                    {/* USER BADGES CONTAINER */}
                    <div className="bg-card p-4 rounded-lg border-2">
                        <h1 className="text-xl font-semibold">
                            User Badges
                        </h1>
                        <div className="flex gap-4 mt-4">
                            <HoverCard>
                                <HoverCardTrigger>
                                    <BadgeCheck size={36} className="rounded-full bg-blue-500/30 border-1 border-blue-500/50 p-2" />
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <h1 className="font-bold mb-2">Verified User</h1>
                                    <p className="text-sm text-muted-foreground">This user has been verified by the admin</p>
                                </HoverCardContent>
                            </HoverCard>

                            <HoverCard>
                                <HoverCardTrigger>
                                    <Shield size={36} className="rounded-full bg-green-500/30 border-1 border-green-500/50 p-2" />
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <h1 className="font-bold mb-2">Admin</h1>
                                    <p className="text-sm text-muted-foreground">
                                        Admin users have full access to the dashboard
                                    </p>
                                </HoverCardContent>
                            </HoverCard>

                            <HoverCard>
                                <HoverCardTrigger>
                                    <Candy size={36} className="rounded-full bg-yellow-500/30 border-1 border-yellow-500/50 p-2" />
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <h1 className="font-bold mb-2">Awarded</h1>
                                    <p className="text-sm text-muted-foreground">
                                        This user has been awarded a badge
                                    </p>
                                </HoverCardContent>
                            </HoverCard>

                            <HoverCard>
                                <HoverCardTrigger>
                                    <Citrus size={36} className="rounded-full bg-orange-500/30 border-1 border-orange-500/50 p-2" />
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    <h1 className="font-bold mb-2">Popular</h1>
                                    <p className="text-sm text-muted-foreground">
                                        This user has been popular in the community
                                    </p>
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </div>

                    {/* INFORMATION CONTAINER */}
                    <div className="bg-card p-4 rounded-lg border-2">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-semibold">User Information</h1>

                            <div>
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button>Edit Profile</Button>
                                    </SheetTrigger>
                                    <EditUser />
                                </Sheet>
                            </div>
                        </div>
                        <div className="space-y-4 mt-4">
                            <div className="flex flex-col gap-2 mb-8">
                                <p className="text-sm text-muted-foreground">Profile Completion</p>
                                <Progress value={33} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">Username :</span>
                                <span>John Doe</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-bold">Email :</span>
                                <span>johndoe@mail.com</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-bold">Phone :</span>
                                <span>+1 234 567 890</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-bold">Location :</span>
                                <span>New York</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="font-bold">Role :</span>
                                <Badge>Admin</Badge>
                            </div>
                        </div>

                        <p className="text-sm text-muted-foreground mt-4">Joined on 2025.01.01</p>
                    </div>

                    {/* CARD LIST CONTAINER */}
                    <div className="bg-card p-4 rounded-lg border-2">
                        <CardList title="Recent Transactions" />
                    </div>
                </div>
                {/* RIGHT */}
                <div className="w-full xl:w-2/3 space-y-6">
                    {/* USER CARD CONTAINER */}
                    <div className="bg-card p-4 rounded-lg border-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <Avatar className="size-12">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <h1 className="text-xl font-semibold">John Doe</h1>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            Expedita maxime at similique ullam error dicta, suscipit iusto quam officiis placeat!
                        </p>
                    </div>

                    {/* CHART CONTAINER */}
                    <div className="bg-card p-4 rounded-lg border-2">
                        Chart
                    </div>
                </div>
            </div>
        </div>
    )
}