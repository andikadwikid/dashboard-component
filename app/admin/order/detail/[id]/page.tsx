import React from 'react';
import { notFound } from 'next/navigation';
import { getOrderById } from '@/actions/order';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MapPin, Phone, Building, Mountain, Leaf } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';

interface OrderDetailPageProps {
    params: Promise<{
        id: string;
    }>;
}

const OrderDetailPage = async ({ params }: OrderDetailPageProps) => {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-4">
                    <Link href="/admin/order">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Detail Order</h1>
                        <p className="text-muted-foreground">Order ID: {order.id}</p>
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
                <Link href={`/admin/order/edit/${order.id}`}>
                    <Button variant="outline">
                        Edit Order
                    </Button>
                </Link>
                <Button>
                    Update Status
                </Button>
            </div>
        </div>
    );
};

export default OrderDetailPage;