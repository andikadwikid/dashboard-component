'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { getOrderById, cancelOrder, completeOrder } from '@/actions/order';
import { getProgressStagesStatus } from '@/actions/order-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, User, MapPin, Phone, Building, Mountain, Leaf, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { formatDate, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { OrderProgressManager } from '@/components/order-progress/OrderProgressManager';

interface OrderDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

const OrderDetailPage = ({ params }: OrderDetailPageProps) => {
    const router = useRouter();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [isResultCompleted, setIsResultCompleted] = useState(false);

    // Resolve params once and store the ID
    React.useEffect(() => {
        const resolveParams = async () => {
            try {
                const resolvedParams = await params;
                setOrderId(resolvedParams.id);
            } catch (error) {
                console.error('Error resolving params:', error);
                toast.error('Invalid order ID');
            }
        };
        resolveParams();
    }, [params]);

    // Load order data when orderId is available
    React.useEffect(() => {
        if (!orderId) return;

        const loadOrder = async () => {
            try {
                setLoading(true);
                const orderData = await getOrderById(orderId);
                if (!orderData) {
                    notFound();
                }
                setOrder(orderData);
            } catch (error) {
                console.error('Error loading order:', error);
                toast.error('Failed to load order');
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId]);

    // Function to refresh order data
    const refreshOrderData = React.useCallback(async () => {
        if (!orderId) return;
        
        try {
            const orderData = await getOrderById(orderId);
            if (orderData) {
                setOrder(orderData);
            }
        } catch (error) {
            console.error('Error refreshing order data:', error);
        }
    }, [orderId]);

    // Check if result stage is completed
    React.useEffect(() => {
        const checkResultStatus = async () => {
            if (!order) return;

            try {
                const progressStatus = await getProgressStagesStatus(order.id);
                if (progressStatus.success && progressStatus.data) {
                    const resultStage = progressStatus.data.find(stage => stage.stage === 'result');
                    setIsResultCompleted(resultStage?.completed || false);
                }
            } catch (error) {
                console.error('Error checking progress status:', error);
            }
        };
        checkResultStatus();
    }, [order]);

    const handleCancelOrder = async () => {
        if (!order) return;

        setCancelling(true);
        try {
            const result = await cancelOrder(order.id);
            if (result.success) {
                toast.success(result.success);
                // Refresh order data
                const updatedOrder = await getOrderById(order.id);
                if (updatedOrder) {
                    setOrder(updatedOrder);
                }
            } else {
                toast.error(result.error || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!order) return;

        setCompleting(true);
        try {
            const result = await completeOrder(order.id);
            if (result.success) {
                toast.success(result.success);
                // Refresh order data
                const updatedOrder = await getOrderById(order.id);
                if (updatedOrder) {
                    setOrder(updatedOrder);
                }
            } else {
                toast.error(result.error || 'Failed to complete order');
            }
        } catch (error) {
            console.error('Error completing order:', error);
            toast.error('Failed to complete order');
        } finally {
            setCompleting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Loading order...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!order) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                    <Link href="/admin/order">
                        <Button variant="outline" size="sm" className="cursor-pointer">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Detail Order</h1>
                        {/* <p className="text-muted-foreground">Order ID: {order.id}</p> */}
                    </div>
                </div>
                <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Informasi Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {order.sales && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Sales</label>
                                    <p className="text-sm">{order.sales.name}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-1">
                                    <Badge className={getStatusColor(order.status)}>
                                        {order.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Tanggal Dibuat</label>
                                <p className="text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Terakhir Diupdate</label>
                                <p className="text-sm">{formatDate(order.updatedAt)}</p>
                            </div>
                        </div>


                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.customer_history && (
                            <>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Nama PIC
                                        </label>
                                        <p className="font-medium">{order.customer_history.name}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Contact
                                        </label>
                                        <p className="text-sm">{order.customer_history.contact}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Farm Name
                                        </label>
                                        <p className="text-sm">{order.customer_history.farm_name}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Alamat Pengiriman
                                        </label>
                                        <p className="text-sm">{order.customer_history.address}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Wilayah
                                            </label>
                                            <p className="text-sm">{order.customer_history.region_name}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                                <Mountain className="h-4 w-4" />
                                                Altitude
                                            </label>
                                            <p className="text-sm">{order.customer_history.altitude}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Leaf className="h-4 w-4" />
                                            Varietas
                                        </label>
                                        <p className="text-sm">{order.customer_history.variety}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Order Progress Section */}
            <OrderProgressManager orderId={order.id} orderStatus={order?.status} onProgressUpdate={refreshOrderData} />

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                {/* Complete Order Button - Only show if result stage is completed and order is not completed or cancelled */}
                {isResultCompleted && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="default" disabled={completing} className='cursor-pointer'>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {completing ? 'Completing...' : 'Complete Order'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Complete Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to mark this order as completed? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCompleteOrder}
                                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                                >
                                    Yes, Complete Order
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}

                {/* Cancel Order Button - Only show if order is pending or processing and not completed */}
                {order.status !== 'completed' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={cancelling} className='cursor-pointer'>
                                <X className="h-4 w-4 mr-2" />
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to cancel this order? This action cannot be undone.
                                    {/* Order ID: <span className="font-mono">{order.id}</span> */}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleCancelOrder}
                                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                                >
                                    Yes, Cancel Order
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;