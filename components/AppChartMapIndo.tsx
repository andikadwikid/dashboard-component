"use client";

import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts/highmaps";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const IndonesiaMapChart: React.FC = () => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<Highcharts.Chart | null>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const initializeChart = async () => {
            if (!chartRef.current) return;

            try {
                const response = await fetch(
                    "https://code.highcharts.com/mapdata/countries/id/id-all.topo.json"
                );
                const topology = await response.json();

                const data: [string, number][] = [
                    ["id-3700", 10], ["id-ac", 0], ["id-jt", 12], ["id-be", 13],
                    ["id-bt", 14], ["id-kb", 15], ["id-bb", 16], ["id-ba", 17],
                    ["id-ji", 18], ["id-ks", 19], ["id-nt", 20], ["id-se", 21],
                    ["id-kr", 22], ["id-ib", 23], ["id-su", 24], ["id-ri", 25],
                    ["id-sw", 26], ["id-ku", 27], ["id-la", 28], ["id-sb", 29],
                    ["id-ma", 30], ["id-nb", 31], ["id-sg", 32], ["id-st", 33],
                    ["id-pa", 34], ["id-jr", 35], ["id-ki", 36], ["id-1024", 37],
                    ["id-jk", 38], ["id-go", 39], ["id-yo", 40], ["id-sl", 41],
                    ["id-sr", 42], ["id-ja", 43], ["id-kt", 44],
                ];

                const isDark = theme === "dark";

                const chartOptions: Highcharts.Options = {
                    chart: {
                        map: topology,
                        backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    },
                    title: {
                        text: "",
                        style: {
                            color: isDark ? "#f8fafc" : "#0f172a",
                        },
                    },
                    mapNavigation: {
                        enabled: true,
                        buttonOptions: { verticalAlign: "bottom" },
                    },
                    colorAxis: {
                        min: 0,
                        minColor: isDark ? "#374151" : "#b7fb97",
                        maxColor: isDark ? "#22c55e" : "#194802",
                    },
                    series: [
                        {
                            type: "map",
                            data,
                            name: "Penjualan",
                            states: {
                                hover: { color: isDark ? "#4ade80" : "#BADA55" },
                            },
                            dataLabels: {
                                enabled: true,
                                format: "{point.name}",
                                style: { color: isDark ? "#f8fafc" : "#0f172a" },
                            },
                        },
                    ],
                };

                // destroy chart kalau sudah ada
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                chartInstance.current = Highcharts.mapChart(
                    chartRef.current,
                    chartOptions
                );
            } catch (error) {
                console.error("Error initializing chart:", error);
            }
        };

        initializeChart();

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [theme]); // <- rerun tiap kali theme berubah

    return (
        // <div className="w-full h-full">
        <Card>
            <CardHeader>
                <h1 className="text-lg font-medium">
                    Data Penjualan di Indonesia
                </h1>
            </CardHeader>
            <CardContent>
                <div ref={chartRef} id="container" className="w-full h-96 min-h-96" />
            </CardContent>
        </Card>
        // </div> 
    );
};

export default IndonesiaMapChart;
