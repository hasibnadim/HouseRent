#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/1e0d04de4cb1b4588f91d6e44640d8e9c59bc6ff22cb1e4085b6bd49da231e49/contract';
import endContract from '../../snapshots/1e0d04de4cb1b4588f91d6e44640d8e9c59bc6ff22cb1e4085b6bd49da231e49/contract.json' with { type: 'json' };
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
      this.createSchema({ schema: 'liveBnb' }),
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
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
        schema: 'liveBnb',
        table: 'Account',
        constraint: 'Account_provider_providerAccountId_key',
        columns: ['provider', 'providerAccountId'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'Favorite',
        constraint: 'Favorite_userId_listingId_key',
        columns: ['userId', 'listingId'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'Review',
        constraint: 'Review_bookingId_reviewerId_key',
        columns: ['bookingId', 'reviewerId'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'Session',
        constraint: 'Session_sessionToken_key',
        columns: ['sessionToken'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'User',
        constraint: 'User_phone_key',
        columns: ['phone'],
      }),
      this.addUnique({
        schema: 'liveBnb',
        table: 'VerificationToken',
        constraint: 'VerificationToken_identifier_token_key',
        columns: ['identifier', 'token'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Account',
        index: 'Account_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'AuditLog',
        index: 'audit_actor_recent_0e9f1adf',
        columns: ['actorId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'AvailabilityBlock',
        index: 'AvailabilityBlock_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'AvailabilityBlock',
        index: 'availability_listing_start_7b8c2bae',
        columns: ['listingId', 'startsAt'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Booking',
        index: 'booking_listing_dates_533749d6',
        columns: ['listingId', 'status', 'checkIn', 'checkOut'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Booking',
        index: 'booking_renter_status_9a7f078e',
        columns: ['renterId', 'status'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Favorite',
        index: 'Favorite_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Favorite',
        index: 'Favorite_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Listing',
        index: 'listing_browse_3a3c3d1e',
        columns: ['status', 'monthlyRent'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Listing',
        index: 'listing_location_be494fa7',
        columns: ['city', 'area'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Listing',
        index: 'listing_owner_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'ListingPhoto',
        index: 'ListingPhoto_listingId_idx_953decda',
        columns: ['listingId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'ListingPhoto',
        index: 'listing_photo_order_c6074c87',
        columns: ['listingId', 'sortOrder'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'ListingReport',
        index: 'report_listing_status_1b030a2f',
        columns: ['listingId', 'status'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'ListingReport',
        index: 'report_reporter_aa245831',
        columns: ['reporterId'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Review',
        index: 'review_reviewee_recent_c43c7af7',
        columns: ['revieweeId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Session',
        index: 'Session_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'Account',
        foreignKey: {
          name: 'Account_userId_fkey',
          columns: ['userId'],
          references: { schema: 'liveBnb', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'AvailabilityBlock',
        foreignKey: {
          name: 'AvailabilityBlock_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'liveBnb', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'Favorite',
        foreignKey: {
          name: 'Favorite_userId_fkey',
          columns: ['userId'],
          references: { schema: 'liveBnb', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'Favorite',
        foreignKey: {
          name: 'Favorite_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'liveBnb', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'ListingPhoto',
        foreignKey: {
          name: 'ListingPhoto_listingId_fkey',
          columns: ['listingId'],
          references: { schema: 'liveBnb', table: 'Listing', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'liveBnb',
        table: 'Session',
        foreignKey: {
          name: 'Session_userId_fkey',
          columns: ['userId'],
          references: { schema: 'liveBnb', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
