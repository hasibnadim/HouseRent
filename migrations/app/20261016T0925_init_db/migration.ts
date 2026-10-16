#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/8f895945e72e4f9fad8ab89a7e7c8c3a7169ad696ee5d69bc9ef8edafaced15b/contract';
import endContract from '../../snapshots/8f895945e72e4f9fad8ab89a7e7c8c3a7169ad696ee5d69bc9ef8edafaced15b/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  lit,
  primaryKey,
  sql,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'mytour' }),
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'mytour',
        table: 'Account',
        columns: [
          col('access_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expires_at', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('id_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('oauth_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('oauth_token_secret', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('providerAccountId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('refresh_token', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('scope', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('session_state', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('token_type', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'AuditLog',
        columns: [
          col('action', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('actorId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('targetId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('targetType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'AvailabilityBlock',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('endsAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('listingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('startsAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'Booking',
        columns: [
          col('advanceAmount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('approvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('cancelledAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('checkIn', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('checkOut', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('completedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('declineReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('declinedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('discountAmount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('listingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('monthlyRentSnapshot', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('renterId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('renterNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('serviceChargeAmount', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalAmount', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Booking_status_check_cd3064cb',
            sql`"status" IN ('PENDING', 'APPROVED', 'DECLINED', 'CANCELLED', 'COMPLETED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'Favorite',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('listingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('userId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'Listing',
        columns: [
          col('addressNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('advanceAmount', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('amenities', 'text[]', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1', many: true },
          }),
          col('area', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('availableFrom', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('availableTo', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('bathrooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('bedrooms', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('city', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('furnished', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('houseRules', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('monthlyRent', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('ownerId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('propertyType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('serviceChargeNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('sizeSqft', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('DRAFT'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Listing_amenities_elem_not_null_8aca8596',
            sql`array_position("amenities", NULL) IS NULL`,
          ),
          checkExpression(
            'Listing_propertyType_check_64a3c017',
            sql`"propertyType" IN ('APARTMENT', 'HOUSE', 'ROOM', 'VILLA', 'OTHER')`,
          ),
          checkExpression(
            'Listing_status_check_962311ea',
            sql`"status" IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'ListingPhoto',
        columns: [
          col('caption', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('listingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('url', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'ListingReport',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('listingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('reason', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('reporterId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('resolutionNote', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('resolvedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('resolvedById', 'character(36)', {
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('status', 'text', {
            notNull: true,
            default: lit('OPEN'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'ListingReport_status_check_029bb120',
            sql`"status" IN ('OPEN', 'REVIEWED', 'DISMISSED')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'Review',
        columns: [
          col('bookingId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('comment', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('rating', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('revieweeId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('reviewerId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'Session',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('expires', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('sessionToken', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('emailVerified', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('image', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('isAdmin', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('isSuspended', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', {
            notNull: true,
            default: lit('RENTER'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_role_check_e7d7f8cc', sql`"role" IN ('RENTER', 'OWNER')`),
        ],
      }),
      this.createTable({
        schema: 'mytour',
        table: 'VerificationToken',
        columns: [
          col('expires', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'character(36)', {
            notNull: true,
            codecRef: { codecId: 'sql/char@1', typeParams: { length: 36 } },
          }),
          col('identifier', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('token', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'Account',
        constraint: 'Account_provider_providerAccountId_key',
        columns: ['provider', 'providerAccountId'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'Favorite',
        constraint: 'Favorite_userId_listingId_key',
        columns: ['userId', 'listingId'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'Review',
        constraint: 'Review_bookingId_reviewerId_key',
        columns: ['bookingId', 'reviewerId'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'Session',
        constraint: 'Session_sessionToken_key',
        columns: ['sessionToken'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'User',
        constraint: 'User_phone_key',
        columns: ['phone'],
      }),
      this.addUnique({
        schema: 'mytour',
        table: 'VerificationToken',
        constraint: 'VerificationToken_identifier_token_key',
        columns: ['identifier', 'token'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Account',
        index: 'Account_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'AuditLog',
        index: 'audit_actor_recent_0e9f1adf',
        columns: ['actorId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'AvailabilityBlock',
        index: 'AvailabilityBlock_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'AvailabilityBlock',
        index: 'availability_listing_start_7b8c2bae',
        columns: ['listingId', 'startsAt'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Booking',
        index: 'booking_listing_dates_533749d6',
        columns: ['listingId', 'status', 'checkIn', 'checkOut'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Booking',
        index: 'booking_renter_status_9a7f078e',
        columns: ['renterId', 'status'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Favorite',
        index: 'Favorite_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Favorite',
        index: 'Favorite_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Listing',
        index: 'listing_browse_3a3c3d1e',
        columns: ['status', 'monthlyRent'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Listing',
        index: 'listing_location_be494fa7',
        columns: ['city', 'area'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Listing',
        index: 'listing_owner_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'ListingPhoto',
        index: 'ListingPhoto_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'ListingPhoto',
        index: 'listing_photo_order_c6074c87',
        columns: ['listingId', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'ListingReport',
        index: 'report_listing_status_1b030a2f',
        columns: ['listingId', 'status'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'ListingReport',
        index: 'report_reporter_aa245831',
        columns: ['reporterId'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Review',
        index: 'review_reviewee_recent_c43c7af7',
        columns: ['revieweeId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'mytour',
        table: 'Session',
        index: 'Session_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'Account',
        foreignKey: {
          name: 'Account_userId_fkey',
          columns: ['userId'],
          references: { schema: 'mytour', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'AvailabilityBlock',
        foreignKey: {
          name: 'AvailabilityBlock_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'mytour', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'Favorite',
        foreignKey: {
          name: 'Favorite_userId_fkey',
          columns: ['userId'],
          references: { schema: 'mytour', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'Favorite',
        foreignKey: {
          name: 'Favorite_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'mytour', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'ListingPhoto',
        foreignKey: {
          name: 'ListingPhoto_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'mytour', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'mytour',
        table: 'Session',
        foreignKey: {
          name: 'Session_userId_fkey',
          columns: ['userId'],
          references: { schema: 'mytour', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
