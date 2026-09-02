class InstituteSettings {
  final String instituteName;
  final String tagline;
  final String address;
  final String phone;
  final String email;
  final String website;
  final String gstNumber;
  final bool showGst;
  final double gstRate;
  final String receiptPrefix;
  final List<String> terms;

  InstituteSettings({
    this.instituteName = 'SHREE SAI CLASSES',
    this.tagline = 'Inspiring Excellence in Education | Commerce & Science',
    this.address = 'Plot 12, Sai Complex, Station Road, Thane (W), Mumbai 400601',
    this.phone = '+91 98200 12345 / +91 98200 67890',
    this.email = 'info@shreesaiclasses.edu.in',
    this.website = 'www.shreesaiclasses.edu.in',
    this.gstNumber = '27AABCS7846J1Z6',
    this.showGst = false,
    this.gstRate = 18.0,
    this.receiptPrefix = 'SSC-REC',
    this.terms = const [
      '1. The receipt is subject to realisation of payment.',
      '2. This receipt should be carefully preserved and must be produced on demand.',
      '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
      '4. Shree Sai Classes reserves all rights for admission & schedule changes.',
    ],
  });

  InstituteSettings copyWith({
    String? instituteName,
    String? tagline,
    String? address,
    String? phone,
    String? email,
    String? website,
    String? gstNumber,
    bool? showGst,
    double? gstRate,
    String? receiptPrefix,
    List<String>? terms,
  }) {
    return InstituteSettings(
      instituteName: instituteName ?? this.instituteName,
      tagline: tagline ?? this.tagline,
      address: address ?? this.address,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      website: website ?? this.website,
      gstNumber: gstNumber ?? this.gstNumber,
      showGst: showGst ?? this.showGst,
      gstRate: gstRate ?? this.gstRate,
      receiptPrefix: receiptPrefix ?? this.receiptPrefix,
      terms: terms ?? this.terms,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'instituteName': instituteName,
      'tagline': tagline,
      'address': address,
      'phone': phone,
      'email': email,
      'website': website,
      'gstNumber': gstNumber,
      'showGst': showGst,
      'gstRate': gstRate,
      'receiptPrefix': receiptPrefix,
      'terms': terms,
    };
  }

  factory InstituteSettings.fromJson(Map<String, dynamic> json) {
    return InstituteSettings(
      instituteName: json['instituteName']?.toString() ?? 'SHREE SAI CLASSES',
      tagline: json['tagline']?.toString() ?? 'Inspiring Excellence in Education | Commerce & Science',
      address: json['address']?.toString() ?? 'Plot 12, Sai Complex, Station Road, Thane (W), Mumbai 400601',
      phone: json['phone']?.toString() ?? '+91 98200 12345 / +91 98200 67890',
      email: json['email']?.toString() ?? 'info@shreesaiclasses.edu.in',
      website: json['website']?.toString() ?? 'www.shreesaiclasses.edu.in',
      gstNumber: json['gstNumber']?.toString() ?? '27AABCS7846J1Z6',
      showGst: json['showGst'] is bool ? json['showGst'] : false,
      gstRate: (json['gstRate'] is num) ? (json['gstRate'] as num).toDouble() : 18.0,
      receiptPrefix: json['receiptPrefix']?.toString() ?? 'SSC-REC',
      terms: (json['terms'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? const [
        '1. The receipt is subject to realisation of payment.',
        '2. This receipt should be carefully preserved and must be produced on demand.',
        '3. Fees once paid are strictly non-refundable and non-transferable under any circumstances.',
        '4. Shree Sai Classes reserves all rights for admission & schedule changes.',
      ],
    );
  }
}
