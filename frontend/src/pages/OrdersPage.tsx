import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api/client';
import { Order, OrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const OrdersPage: React.FC = () => {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setIsUpdating(true);
    try {
      await ordersApi.updateStatus(orderId, nextStatus);
      await loadOrders();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-cream-200 pb-5">
        <h1 className="text-2xl font-black text-forest-950">Direct Market Orders</h1>
        <p className="text-xs sm:text-sm text-forest-700 mt-0.5">
          Track fulfillment, dispatch, and delivery of accepted produce contracts.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-forest-700">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl bg-white border border-cream-200 p-12 text-center text-forest-700">
          <Package className="mx-auto h-12 w-12 text-forest-400 mb-3" />
          <h3 className="text-lg font-bold text-forest-950">No confirmed orders yet</h3>
          <p className="text-xs text-forest-600 mt-1 max-w-sm mx-auto">
            When a farmer accepts a buyer offer using NetProfit Match, a binding order is created here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-cream-200 p-6 shadow-xs hover:border-forest-300 transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cream-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forest-700">
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <h3 className="font-bold text-forest-950 text-base mt-1">
                      {order.listing?.produce_name || 'Produce Contract'}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-semibold text-forest-600 block">
                      Contract Value
                    </span>
                    <span className="text-xl font-black text-forest-950">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl bg-cream-50 p-2.5 border border-cream-200">
                    <span className="text-forest-600 text-[10px] block">Contracted Rate</span>
                    <span className="font-bold text-forest-950">
                      ₹{order.agreed_price_per_kg}/kg
                    </span>
                  </div>

                  <div className="rounded-xl bg-cream-50 p-2.5 border border-cream-200">
                    <span className="text-forest-600 text-[10px] block">Quantity</span>
                    <span className="font-bold text-forest-950">
                      {order.quantity_kg.toLocaleString('en-IN')} kg
                    </span>
                  </div>

                  <div className="rounded-xl bg-cream-50 p-2.5 border border-cream-200">
                    <span className="text-forest-600 text-[10px] block">Grower</span>
                    <span className="font-bold text-forest-950 truncate block">
                      {order.farmer?.full_name || 'Rameshwar Patil'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-cream-50 p-2.5 border border-cream-200">
                    <span className="text-forest-600 text-[10px] block">Buyer</span>
                    <span className="font-bold text-forest-950 truncate block">
                      {order.buyer?.business_name || order.buyer?.full_name || 'Sandeep Khurana'}
                    </span>
                  </div>
                </div>

                {/* Status Advancement Actions */}
                <div className="mt-5 pt-4 border-t border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-forest-700">
                    <Clock className="h-4 w-4 text-forest-600" />
                    <span>
                      Created: {new Date(order.created_at).toLocaleDateString('en-IN')} at{' '}
                      {new Date(order.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'confirmed' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'in_transit')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-3.5 py-1.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
                      >
                        <Truck className="h-3.5 w-3.5" /> Mark In Transit
                      </button>
                    )}

                    {order.status === 'in_transit' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-forest-700 px-3.5 py-1.5 text-xs font-bold text-cream-50 hover:bg-forest-800 transition active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Delivery
                      </button>
                    )}

                    {order.status === 'delivered' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 transition active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete Contract
                      </button>
                    )}

                    {order.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Contract Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
