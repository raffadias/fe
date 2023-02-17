import React, { useState } from 'react';
import { Order } from '../../types/Order';
import { api } from '../../utils/api';
import { OrderModal } from '../OrderModal';
import { Board, OrdersContainer } from './styles';
import { toast } from 'react-toastify';

interface OrdersBoardProps {
  icon: string;
  title: string;
  orders: Array<Order>;
  onCancelOrder: (orderId: string) => void;
  onChangeOrderStatus: (orderId: string, status: Order['status']) => void;
}

export function OrdersBoard({ icon, title, orders, onCancelOrder, onChangeOrderStatus }: OrdersBoardProps) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function handleCloseModal() {
    setIsModalVisible(false);
    setSelectedOrder(null);
  }

  function handleOpenModal(order: Order) {
    setSelectedOrder(order);
    setIsModalVisible(true);
  }

  async function handleChangeStatus() {
    setIsLoading(true);
    const status = selectedOrder?.status === 'WAITING' ? 'IN_PRODUCTION' : 'DONE';
    await api.patch(`/orders/${selectedOrder?._id}`, { status });

    toast.success(status === 'IN_PRODUCTION' ?  `O pedido da mesa ${selectedOrder?.table} está em produção.` : `O pedido da mesa ${selectedOrder?.table} está pronto.`);
    onChangeOrderStatus(selectedOrder!._id, status);
    setIsLoading(false);
    setIsModalVisible(false);
  }

  async function handleCancelOrder() {
    setIsLoading(true);
    await api.delete(`/orders/${selectedOrder?._id}`);

    toast.success(`O pedido da mesa ${selectedOrder?.table} foi cancelado.`);
    onCancelOrder(selectedOrder!._id);
    setIsLoading(false);
    setIsModalVisible(false);
  }

  return (
    <Board>
      <OrderModal
        closeModal={handleCloseModal}
        visible={isModalVisible}
        order={selectedOrder}
        onCancelOrder={handleCancelOrder}
        onChangeOrderStatus={handleChangeStatus}
        isLoading={isLoading}
      />
      <header>
        <span>{icon}</span>
        <strong>{title}</strong>
        <span>({orders.length})</span>
      </header>
      {orders.length > 0 && (
        <OrdersContainer>
          {orders.map((order) => (
            <button
              type="button"
              key={order._id}
              onClick={() => handleOpenModal(order)}
            >
              <strong>Mesa {order.table}</strong>
              <span>{order.products.length} {order.products.length === 1 ? 'item' : 'itens'}</span>
            </button>
          ))}
        </OrdersContainer>
      )}
    </Board>
  );
}
