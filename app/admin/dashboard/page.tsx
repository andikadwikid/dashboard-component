"use client"

import AppBarChart from "@/components/AppBarChart";
import IndonesiaMap from "@/components/AppChartMapIndo";
import AppPieChart from "@/components/AppPieChart";
import TodoList from "@/components/TodoList";
import CardSection from "@/components/CardSection";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState } from "react";
import { formatRupiah } from "@/lib/utils";
import AppTopSales from "@/components/AppTopSales";

export default function DashboardPage() {
    const [timeRange, setTimeRange] = useState<string>("90d")

    return (
        <>
            <div className="p-0 lg:p-4 rounded-lg flex flex-col md:flex-row justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-semibold">Dashboard</h1>
                </div>

                <ToggleGroup
                    type="single"
                    value={timeRange}
                    onValueChange={setTimeRange}
                    variant="outline"
                    className="*:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
                >
                    <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
                    <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                    <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4 mb-4">

                <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                    <CardSection
                        title={"Total Revenue"}
                        total={formatRupiah(100000000)}
                        description={`Nilai Revenue ${timeRange}`}
                    />
                </div>

                <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                    <CardSection
                        title={"Total Order"}
                        total="50"
                        description={`Total Order ${timeRange}`}
                    />
                </div>

                <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                    <CardSection
                        title={"Total Request Sample"}
                        total="80"
                        description={`Total Request Sample ${timeRange}`}
                    />
                </div>

                <div className="p-4 rounded-lg col-span-1 lg:col-span-1 xl:col-span-1 2xl:col-span-1">
                    <CardSection
                        title={"Total Penjualan"}
                        total="30"
                        description={`Nilai Penjualan ${timeRange}`}
                    />
                </div>

                <div className="p-4 rounded-lg col-span-1 lg:col-span-4 xl:col-span-4 2xl:col-span-4">
                    <IndonesiaMap />
                </div>
                <div className="p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                    <AppBarChart />
                </div>
                <div className="p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                    <AppTopSales />
                </div>
                <div className="bg-card border-1 p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                    <AppPieChart />
                </div>
                <div className="bg-card border-1 p-4 rounded-lg col-span-1 lg:col-span-2 xl:col-span-2 2xl:col-span-2">
                    <TodoList />
                </div>
            </div>
        </>
    );
}