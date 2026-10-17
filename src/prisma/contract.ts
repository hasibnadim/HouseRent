import { defineContract, enumType, member } from '@prisma/orm-postgres/contract-builder';

const NAMESPACE = 'liveBnb';

export const contract = defineContract({ namespaces: [NAMESPACE] }, ({ field, model, rel }) => {
  const UserRole = enumType(
    'UserRole',
    { codecId: 'pg/text@1' },
    member('RENTER'),
    member('OWNER'),
  );
  const ListingType = enumType(
    'ListingType',
    { codecId: 'pg/text@1' },
    member('APARTMENT'),
    member('HOUSE'),
    member('ROOM'),
    member('VILLA'),
    member('OTHER'),
  );
  const ListingStatus = enumType(
    'ListingStatus',
    { codecId: 'pg/text@1' },
    member('DRAFT'),
    member('PUBLISHED'),
    member('UNPUBLISHED'),
    member('ARCHIVED'),
  );
  const BookingStatus = enumType(
    'BookingStatus',
    { codecId: 'pg/text@1' },
    member('PENDING'),
    member('APPROVED'),
    member('DECLINED'),
    member('CANCELLED'),
    member('COMPLETED'),
  );

  const User = model('User', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      name: field.text().optional(),
      email: field.text().unique(),
      emailVerified: field.temporal.timestamptzString().optional(),
      image: field.text().optional(),
      passwordHash: field.text().optional(),
      phone: field.text().optional().unique(),
      role: field.namedType(UserRole).default(UserRole.members.RENTER),
      isAdmin: field.boolean().default(false),
      isSuspended: field.boolean().default(false),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  });

  const Account = model('Account', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      userId: field.uuidString(),
      type: field.text(),
      provider: field.text(),
      providerAccountId: field.text(),
      refresh_token: field.text().optional(),
      access_token: field.text().optional(),
      expires_at: field.int().optional(),
      token_type: field.text().optional(),
      scope: field.text().optional(),
      id_token: field.text().optional(),
      session_state: field.text().optional(),
      oauth_token_secret: field.text().optional(),
      oauth_token: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.provider, fields.providerAccountId])],
  }));

  const Session = model('Session', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      sessionToken: field.text().unique(),
      userId: field.uuidString(),
      expires: field.temporal.timestamptzString(),
      createdAt: field.temporal.createdAtString(),
    },
  });

  const VerificationToken = model('VerificationToken', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      identifier: field.text(),
      token: field.text(),
      expires: field.temporal.timestamptzString(),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.identifier, fields.token])],
  }));

  const Listing = model('Listing', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      ownerId: field.uuidString(),
      title: field.text(),
      description: field.text(),
      city: field.text(),
      area: field.text(),
      addressNote: field.text().optional(),
      sizeSqft: field.int(),
      bedrooms: field.int(),
      bathrooms: field.int(),
      propertyType: field.namedType(ListingType),
      furnished: field.boolean().default(false),
      amenities: field.text().many(),
      monthlyRent: field.int(),
      advanceAmount: field.int().optional(),
      serviceChargeNote: field.text().optional(),
      houseRules: field.text().optional(),
      availableFrom: field.temporal.timestamptzString().optional(),
      availableTo: field.temporal.timestamptzString().optional(),
      status: field.namedType(ListingStatus).default(ListingStatus.members.DRAFT),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.city, cols.area], { name: 'listing_location' }),
      constraints.index([cols.status, cols.monthlyRent], { name: 'listing_browse' }),
      constraints.index([cols.ownerId], { name: 'listing_owner' }),
      constraints.index([cols.ownerId, cols.updatedAt], { name: 'listing_owner_updated' }),
    ],
  }));

  const ListingPhoto = model('ListingPhoto', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      listingId: field.uuidString(),
      url: field.text(),
      caption: field.text().optional(),
      sortOrder: field.int().default(0),
      createdAt: field.temporal.createdAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [constraints.index([cols.listingId, cols.sortOrder], { name: 'listing_photo_order' })],
  }));


  const Booking = model('Booking', {
    namespace: NAMESPACE,
    fields: {
      id: field.id.uuidv7String(),
      listingId: field.uuidString(),
      renterId: field.uuidString(),
      checkIn: field.temporal.timestamptzString(),
      checkOut: field.temporal.timestamptzString(),
      status: field.namedType(BookingStatus).default(BookingStatus.members.PENDING),
      monthlyRentSnapshot: field.int(),
      serviceChargeAmount: field.int().default(0),
      discountAmount: field.int().default(0),
      advanceAmount: field.int().default(0),
      totalAmount: field.int(),
      renterNote: field.text().optional(),
      declineReason: field.text().optional(),
      approvedAt: field.temporal.timestamptzString().optional(),
      declinedAt: field.temporal.timestamptzString().optional(),
      cancelledAt: field.temporal.timestamptzString().optional(),
      completedAt: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.listingId, cols.status, cols.checkIn, cols.checkOut], { name: 'booking_listing_dates' }),
      constraints.index([cols.renterId, cols.status], { name: 'booking_renter_status' }),
      constraints.index([cols.renterId, cols.createdAt], { name: 'booking_renter_created' }),
      constraints.index([cols.listingId, cols.status], { name: 'booking_listing_status' }),
    ],
  }));





  return {
    enums: { UserRole, ListingType, ListingStatus, BookingStatus },
    models: {
      User: User.relations({
        accounts: rel.hasMany(Account, { by: 'userId' }),
        sessions: rel.hasMany(Session, { by: 'userId' }),
        listings: rel.hasMany(Listing, { by: 'ownerId' }),
        bookings: rel.hasMany(Booking, { by: 'renterId' }),
      }),
      Account: Account.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      Session: Session.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      VerificationToken,
      Listing: Listing.relations({
        owner: rel.belongsTo(User, { from: 'ownerId', to: 'id' }),
        photos: rel.hasMany(ListingPhoto, { by: 'listingId' }),
        bookings: rel.hasMany(Booking, { by: 'listingId' }),
      }),
      ListingPhoto: ListingPhoto.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      Booking: Booking.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }),
        renter: rel.belongsTo(User, { from: 'renterId', to: 'id' }),
      }),
    },
  };
});
