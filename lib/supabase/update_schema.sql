-- UPDATE PRODUCTS SCHEMA TO MATCH MOCK DATA
-- Run this BEFORE running the seed data to ensure all columns exist

-- Add missing columns from mock data structure
alter table products 
  add column if not exists materials text[],
  add column if not exists dimensions text,
  add column if not exists care_instructions text,
  add column if not exists story text;
