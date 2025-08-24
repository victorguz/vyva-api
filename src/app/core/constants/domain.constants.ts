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

export enum SalesOrderStatus {
  pending = 'pending',
  paid = 'paid',
  canceled = 'canceled',
}
