"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Clock, Package, Truck, Sprout, BarChart3 } from "lucide-react";
import { getOrderProgress } from "@/actions/order-progress";
import { OrderProgressForm } from "./OrderProgressForm";
import { format } from "date-fns";

interface OrderProgressTimelineProps {
  orderId: string;
}

interface ProgressData {
  id: string;
  stage: string;
  data: any;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const stageConfig = {
  warehouse: {
    title: "Warehouse",
    icon: Package,
    description: "Barang keluar dari gudang",
    color: "bg-blue-500",
  },
  shipping: {
    title: "Shipping",
    icon: Truck,
    description: "Proses pengiriman",
    color: "bg-orange-500",
  },
  applied: {
    title: "Applied",
    icon: Sprout,
    description: "Aplikasi produk",
    color: "bg-green-500",
  },
  result: {
    title: "Result",
    icon: BarChart3,
    description: "Hasil yield",
    color: "bg-purple-500",
  },
};

const stageOrder = ["warehouse", "shipping", "applied", "result"];

export function OrderProgressTimeline({ orderId }: OrderProgressTimelineProps) {
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const result = await getOrderProgress(orderId);
      if (result.success && result.data) {
        setProgressData(result.data as ProgressData[]);
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [orderId]);

  const getStageProgress = (stage: string) => {
    return progressData.find((p) => p.stage === stage);
  };

  const getStageStatus = (stage: string) => {
    const progress = getStageProgress(stage);
    if (!progress) return "pending";
    return progress.data?.status ? "completed" : "in-progress";
  };

  const handleStageClick = (stage: string) => {
    setSelectedStage(stage);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedStage(null);
    fetchProgress(); // Refresh data
  };

  const renderStageData = (stage: string, data: any) => {
    if (!data) return null;

    switch (stage) {
      case "warehouse":
        return (
          <div className="text-sm text-muted-foreground">
            Status: {data.status ? "Keluar dari gudang" : "Belum keluar"}
          </div>
        );
      case "shipping":
        return (
          <div className="text-sm text-muted-foreground">
            <div>Status: {data.status ? "Sudah dikirim" : "Belum dikirim"}</div>
            {data.date_shipping && (
              <div>Tanggal: {format(new Date(data.date_shipping), "dd/MM/yyyy HH:mm")}</div>
            )}
          </div>
        );
      case "applied":
        return (
          <div className="text-sm text-muted-foreground">
            <div>Status: {data.status ? "Sudah diaplikasikan" : "Belum diaplikasikan"}</div>
            {data.est_applied_area && (
              <div>Luas area: {data.est_applied_area} ha</div>
            )}
          </div>
        );
      case "result":
        return (
          <div className="text-sm text-muted-foreground">
            <div>Status: {data.status ? "Ada hasil" : "Belum ada hasil"}</div>
            {data.gain_yield !== undefined && (
              <div>Gain Yield: {data.gain_yield ? "Ya" : "Tidak"}</div>
            )}
            {data.yield_amount && (
              <div>Jumlah yield: {data.yield_amount}</div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Order Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stageOrder.map((stage, index) => {
              const config = stageConfig[stage as keyof typeof stageConfig];
              const progress = getStageProgress(stage);
              const status = getStageStatus(stage);
              const Icon = config.icon;
              const isLast = index === stageOrder.length - 1;

              return (
                <div key={stage} className="relative">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 h-16 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${
                        status === "completed"
                          ? config.color
                          : status === "in-progress"
                          ? "bg-yellow-500"
                          : "bg-gray-200"
                      }`}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : status === "in-progress" ? (
                        <Clock className="h-6 w-6 text-white" />
                      ) : (
                        <Icon className="h-6 w-6 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">{config.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {config.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              status === "completed"
                                ? "default"
                                : status === "in-progress"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {status === "completed"
                              ? "Selesai"
                              : status === "in-progress"
                              ? "Proses"
                              : "Pending"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStageClick(stage)}
                          >
                            {progress ? "Edit" : "Update"}
                          </Button>
                        </div>
                      </div>

                      {/* Stage specific data */}
                      {progress && (
                        <div className="mt-2">
                          {renderStageData(stage, progress.data)}
                          <div className="text-xs text-muted-foreground mt-1">
                            Diperbarui: {format(new Date(progress.updatedAt), "dd/MM/yyyy HH:mm")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && selectedStage && (
        <OrderProgressForm
          orderId={orderId}
          stage={selectedStage}
          existingProgress={getStageProgress(selectedStage)}
          onClose={handleFormClose}
        />
      )}
    </>
  );
}