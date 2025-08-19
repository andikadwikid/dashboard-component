"use client"

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export default function TodoList() {

    const [date, setDate] = useState<Date | undefined>(new Date());
    const [open, setOpen] = useState(false);

    return (
        <div className="">
            <h1 className="text-lg font-medium mb-6">Todo List</h1>
            {/* CALENDER */}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button className="w-full">
                        <CalendarIcon />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-auto">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setDate(date);
                            setOpen(false);
                        }}
                        className="rounded-lg border"
                    />
                </PopoverContent>
            </Popover>

            {/* LIST */}
            <ScrollArea className="max-h-[400px] mt-4 overflow-y-auto">
                <div className="flex flex-col gap-4">
                    {/* LIST ITEM */}
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                    <Card className="p-4">
                        <div className="flex items-center gap-4">
                            <Checkbox id="item1" checked />
                            <label htmlFor="item1" className="text-sm">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio, officiis?
                            </label>
                        </div>
                    </Card>
                </div>
            </ScrollArea>
        </div>
    )
}