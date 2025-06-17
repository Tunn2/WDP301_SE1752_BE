export enum TransactionStatus {
  PENDING = 'pending', // Chờ thanh toán
  CANCELLED = 'cancelled', // Hủy thanh toán
  REFUNDED = 'refunded', // Hoàn tiền
  PAID = 'paid', // Đã thanh toán
}
