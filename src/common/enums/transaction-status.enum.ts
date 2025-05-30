export enum TransactionStatus {
  PENDING = 'pending', // Chờ thanh toán
  CANCELLED = 'cancelled', // Hủy thanh toán
  FINISHED = 'finished', // Tiêm thành công
  NO_SHOW = 'no_show', // Vắng mặt lúc tiêm
  REFUNDED = 'refunded', // Hoàn tiền
  PAID = 'paid', // Đã thanh toán
}
