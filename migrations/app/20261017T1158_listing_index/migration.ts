#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/1e0d04de4cb1b4588f91d6e44640d8e9c59bc6ff22cb1e4085b6bd49da231e49/contract';
import startContract from '../../snapshots/1e0d04de4cb1b4588f91d6e44640d8e9c59bc6ff22cb1e4085b6bd49da231e49/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f1d50e8d632142575872dd8c6b94e9155ff6f7c86471a71548d17eb1dbe0cc52/contract';
import endContract from '../../snapshots/f1d50e8d632142575872dd8c6b94e9155ff6f7c86471a71548d17eb1dbe0cc52/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'liveBnb', table: 'AuditLog' }),
      this.dropTable({ schema: 'liveBnb', table: 'AvailabilityBlock' }),
      this.dropTable({ schema: 'liveBnb', table: 'Favorite' }),
      this.dropTable({ schema: 'liveBnb', table: 'ListingReport' }),
      this.dropTable({ schema: 'liveBnb', table: 'Review' }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Booking',
        index: 'booking_listing_status_1b030a2f',
        columns: ['listingId', 'status'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Booking',
        index: 'booking_renter_created_63c3c59b',
        columns: ['renterId', 'createdAt'],
      }),
      this.createIndex({
        schema: 'liveBnb',
        table: 'Listing',
        index: 'listing_owner_updated_f0929af1',
        columns: ['ownerId', 'updatedAt'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
