-- Migration: add lat/lng/radius fields for map-based location selection.
-- realtors gets service area coordinates; buyer_leads gets buyer target coordinates.
-- Both fields are nullable so existing rows without coordinates continue to work
-- with the string-based matching fallback in lib/matching.ts.

alter table public.realtors
  add column if not exists service_lat      double precision,
  add column if not exists service_lng      double precision,
  add column if not exists service_radius_mi real;

alter table public.buyer_leads
  add column if not exists region_lat      double precision,
  add column if not exists region_lng      double precision,
  add column if not exists region_radius_mi real;
