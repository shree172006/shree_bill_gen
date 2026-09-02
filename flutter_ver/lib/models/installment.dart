class Installment {
  final int srNo;
  final String dueDate;
  final String? paidDate;
  final String status; // 'PAID' or 'PENDING'
  final double amount;
  final String paymentMode; // 'Cash', 'UPI', 'Net Banking', 'Cheque', etc.
  final String transactionDetails;

  Installment({
    required this.srNo,
    required this.dueDate,
    this.paidDate,
    required this.status,
    required this.amount,
    this.paymentMode = '',
    this.transactionDetails = '',
  });

  bool get isPaid => status.toUpperCase() == 'PAID';

  Installment copyWith({
    int? srNo,
    String? dueDate,
    String? paidDate,
    String? status,
    double? amount,
    String? paymentMode,
    String? transactionDetails,
  }) {
    return Installment(
      srNo: srNo ?? this.srNo,
      dueDate: dueDate ?? this.dueDate,
      paidDate: paidDate ?? this.paidDate,
      status: status ?? this.status,
      amount: amount ?? this.amount,
      paymentMode: paymentMode ?? this.paymentMode,
      transactionDetails: transactionDetails ?? this.transactionDetails,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'srNo': srNo,
      'dueDate': dueDate,
      'paidDate': paidDate,
      'status': status,
      'amount': amount,
      'paymentMode': paymentMode,
      'transactionDetails': transactionDetails,
    };
  }

  factory Installment.fromJson(Map<String, dynamic> json) {
    return Installment(
      srNo: json['srNo'] is int ? json['srNo'] : int.tryParse(json['srNo'].toString()) ?? 1,
      dueDate: json['dueDate']?.toString() ?? '',
      paidDate: json['paidDate']?.toString(),
      status: json['status']?.toString() ?? 'PENDING',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : double.tryParse(json['amount']?.toString() ?? '0') ?? 0.0,
      paymentMode: json['paymentMode']?.toString() ?? '',
      transactionDetails: json['transactionDetails']?.toString() ?? '',
    );
  }
}
