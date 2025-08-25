"use client"

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import React from "react";

const chartConfig = {
    penjualan: {
        label: "Penjualan",
        color: "var(--chart-1)",
    },

} satisfies ChartConfig

const chartData = [
    { sales: "Joe", penjualan: 186 },
    { sales: "David", penjualan: 305 },
    { sales: "Alice", penjualan: 237 },
    { sales: "Mark", penjualan: 73 },
    { sales: "Katie", penjualan: 209 },
    { sales: "Chris", penjualan: 214 },
    { sales: "John", penjualan: 120 },
    { sales: "Jane", penjualan: 150 },
    { sales: "Fiona", penjualan: 101 },
    { sales: "Paul", penjualan: 109 }

]
const AppBarChart = () => {
    return (
        <div className="">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                        <h1 className="text-lg font-medium mb-2">Top 10 Sales</h1>

                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Periode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Periode</SelectLabel>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2025">2025</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <BarChart accessibilityLayer data={chartData.sort((a, b) => b.penjualan - a.penjualan)}>
                            <CartesianGrid vertical={false} horizontal={true} />
                            <XAxis
                                dataKey="sales"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            // tickFormatter={(value) => value.slice(0, 3)}
                            />

                            <YAxis
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />

                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />

                            <Bar dataKey="penjualan" fill="var(--chart-4)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )

}

export default AppBarChart