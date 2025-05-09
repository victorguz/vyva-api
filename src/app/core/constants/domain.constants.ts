export enum UserDocumentType {
  CC = 'CC',
  TI = 'TI',
  CE = 'CE',
  PP = 'PP',
}

export enum UserGender {
  M = 'M',
  F = 'F',
}
export enum UserRole {
  superadmin = 'superadmin',
  admin = 'admin',
  assistant = 'assistant',
  trainer = 'trainer',
  customer = 'customer',
  vyva = 'vyva',
}
export enum PaymentMethodType {
  cash = 'cash',
  transfer = 'transfer',
  card = 'card',
  link = 'link',
}
export enum PaymentMethodIcon {
  card = 'credit_card',
  transfer = 'sync_alt',
  cash = 'payments',
}

export enum TransactionStates {
  done = 'done',
  voided = 'voided',
}
export enum TransactionVoidCauses {
  void = 'void',
}

export const maxPaymentReference: number = 50;

export enum ProductOutputReasons {
  sale = 'sale',
  institutionalUse = 'institutionalUse',
  expiration = 'expiration',
  gift = 'gift',
}

export enum ProductInputReasons {
  supply = 'supply',
  productChange = 'productChange',
  institutionalSupplies = 'institutionalSupplies',
  voidedSale = 'voidedSale',
}

export enum ProductMovementReasonIcon {
  sale = 'shopping_cart',
  supply = 'box_add',
  productChange = 'swap_horiz',
  institutionalUse = 'store',
  expiration = 'date_range',
  gift = 'featured_seasonal_and_gifts',
  voidedSale = 'assignment_return',
  institutionalSupplies = 'store',
}

export enum ProductMovementType {
  input = 'input',
  output = 'output',
}

export enum MeasurementUnits {
  und = 'und',
  ml = 'ml',
  l = 'l',
  g = 'g',
  kg = 'kg',
  cm = 'cm',
  m = 'm',
  day = 'day',
}

export enum MembershipDurations {
  oneDay = '1',
  oneMonth = '30',
  threeMonths = '90',
  sixMonths = '180',
  oneYear = '365',
  other = 'Otro',
}

export enum ProductStatus {
  published = 'published',
  draft = 'draft',
  deleted = 'deleted',
}

export enum PaymentOrderStatusDescription {
  pending = 'Pendiente',
  paid = 'Pagado',
  canceled = 'Cancelado',
}
