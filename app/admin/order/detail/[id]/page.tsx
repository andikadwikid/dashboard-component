'use client';

import React, { useState } from 'react';
import { notFound } from 'next/navigation';
import { getOrderById, cancelOrder } from '@/actions/order';
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
import { ArrowLeft, User, MapPin, Phone, Building, Mountain, Leaf, X } from 'lucide-react';
import Link from 'next/link';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { formatDate, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

    React.useEffect(() => {
        const loadOrder = async () => {
            try {
                const resolvedParams = await params;
                const orderData = await getOrderById(resolvedParams.id);
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
    }, [params]);

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
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                                <p className="font-mono text-sm">{order.id}</p>
                            </div>
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

                        {order.sales && (
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Sales</label>
                                <p className="text-sm">{order.sales.name}</p>
                            </div>
                        )}
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
                                            Kontak
                                        </label>
                                        <p className="text-sm">{order.customer_history.contact}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            Nama Peternakan
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
                {/* Cancel Order Button - Only show if order is pending or processing */}
                {(order.status === 'pending' || order.status === 'processing') && (
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