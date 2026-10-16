import { defineContract, enumType, member } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({ namespaces: ['mytour'] }, ({ field, model, rel }) => {
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
  const ReportStatus = enumType(
    'ReportStatus',
    { codecId: 'pg/text@1' },
    member('OPEN'),
    member('REVIEWED'),
    member('DISMISSED'),
  );

  const User = model('User', {
    namespace: 'mytour',
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
    namespace: 'mytour',
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
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      sessionToken: field.text().unique(),
      userId: field.uuidString(),
      expires: field.temporal.timestamptzString(),
      createdAt: field.temporal.createdAtString(),
    },
  });

  const VerificationToken = model('VerificationToken', {
    namespace: 'mytour',
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
    namespace: 'mytour',
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
    ],
  }));

  const ListingPhoto = model('ListingPhoto', {
    namespace: 'mytour',
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

  const AvailabilityBlock = model('AvailabilityBlock', {
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      listingId: field.uuidString(),
      startsAt: field.temporal.timestamptzString(),
      endsAt: field.temporal.timestamptzString(),
      note: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [constraints.index([cols.listingId, cols.startsAt], { name: 'availability_listing_start' })],
  }));

  const Booking = model('Booking', {
    namespace: 'mytour',
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
    ],
  }));

  const Favorite = model('Favorite', {
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      userId: field.uuidString(),
      listingId: field.uuidString(),
      createdAt: field.temporal.createdAtString(),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.userId, fields.listingId])],
  }));

  const Review = model('Review', {
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      bookingId: field.uuidString(),
      reviewerId: field.uuidString(),
      revieweeId: field.uuidString(),
      rating: field.int(),
      comment: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).attributes(({ fields, constraints }) => ({
    uniques: [constraints.unique([fields.bookingId, fields.reviewerId])],
  })).sql(({ cols, constraints }) => ({
    indexes: [constraints.index([cols.revieweeId, cols.createdAt], { name: 'review_reviewee_recent' })],
  }));

  const ListingReport = model('ListingReport', {
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      listingId: field.uuidString(),
      reporterId: field.uuidString(),
      reason: field.text(),
      status: field.namedType(ReportStatus).default(ReportStatus.members.OPEN),
      resolutionNote: field.text().optional(),
      resolvedById: field.uuidString().optional(),
      resolvedAt: field.temporal.timestamptzString().optional(),
      createdAt: field.temporal.createdAtString(),
      updatedAt: field.temporal.updatedAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [
      constraints.index([cols.listingId, cols.status], { name: 'report_listing_status' }),
      constraints.index([cols.reporterId], { name: 'report_reporter' }),
    ],
  }));

  const AuditLog = model('AuditLog', {
    namespace: 'mytour',
    fields: {
      id: field.id.uuidv7String(),
      actorId: field.uuidString(),
      action: field.text(),
      targetType: field.text(),
      targetId: field.text(),
      note: field.text().optional(),
      createdAt: field.temporal.createdAtString(),
    },
  }).sql(({ cols, constraints }) => ({
    indexes: [constraints.index([cols.actorId, cols.createdAt], { name: 'audit_actor_recent' })],
  }));

  return {
    enums: { UserRole, ListingType, ListingStatus, BookingStatus, ReportStatus },
    models: {
      User: User.relations({
        accounts: rel.hasMany(Account, { by: 'userId' }),
        sessions: rel.hasMany(Session, { by: 'userId' }),
        listings: rel.hasMany(Listing, { by: 'ownerId' }),
        bookings: rel.hasMany(Booking, { by: 'renterId' }),
        favorites: rel.hasMany(Favorite, { by: 'userId' }),
        reviewsWritten: rel.hasMany(Review, { by: 'reviewerId' }),
        reviewsReceived: rel.hasMany(Review, { by: 'revieweeId' }),
        reports: rel.hasMany(ListingReport, { by: 'reporterId' }),
        reportsResolved: rel.hasMany(ListingReport, { by: 'resolvedById' }),
        auditLogs: rel.hasMany(AuditLog, { by: 'actorId' }),
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
        availabilityBlocks: rel.hasMany(AvailabilityBlock, { by: 'listingId' }),
        bookings: rel.hasMany(Booking, { by: 'listingId' }),
        favorites: rel.hasMany(Favorite, { by: 'listingId' }),
        reports: rel.hasMany(ListingReport, { by: 'listingId' }),
      }),
      ListingPhoto: ListingPhoto.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      AvailabilityBlock: AvailabilityBlock.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      Booking: Booking.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }),
        renter: rel.belongsTo(User, { from: 'renterId', to: 'id' }),
        reviews: rel.hasMany(Review, { by: 'bookingId' }),
      }),
      Favorite: Favorite.relations({
        user: rel.belongsTo(User, { from: 'userId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }).sql({ fk: { onDelete: 'cascade' } }),
      }),
      Review: Review.relations({
        booking: rel.belongsTo(Booking, { from: 'bookingId', to: 'id' }),
        reviewer: rel.belongsTo(User, { from: 'reviewerId', to: 'id' }),
        reviewee: rel.belongsTo(User, { from: 'revieweeId', to: 'id' }),
      }),
      ListingReport: ListingReport.relations({
        listing: rel.belongsTo(Listing, { from: 'listingId', to: 'id' }),
        reporter: rel.belongsTo(User, { from: 'reporterId', to: 'id' }),
        resolvedBy: rel.belongsTo(User, { from: 'resolvedById', to: 'id', optional: true }),
      }),
      AuditLog: AuditLog.relations({
        actor: rel.belongsTo(User, { from: 'actorId', to: 'id' }),
      }),
    },
  };
});
