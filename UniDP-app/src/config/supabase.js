/**
 * @file supabase.js
 * @description Inicialización del cliente Supabase.
 * Usa variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
 *
 * @usage
 * import { supabase } from './config/supabase';
 *
 * -- Run this in Supabase SQL Editor before using the app: --
 *
 * -- Profiles table (extends auth.users)
 * create table profiles (
 *   id      uuid references auth.users(id) on delete cascade primary key,
 *   nombre  text not null,
 *   email   text not null,
 *   role    text default 'student'
 * );
 * alter table profiles enable row level security;
 * create policy "Users can read own profile"
 *   on profiles for select using (auth.uid() = id);
 * create policy "Users can insert own profile"
 *   on profiles for insert with check (auth.uid() = id);
 *
 * -- Events table
 * create table events (
 *   id          uuid default gen_random_uuid() primary key,
 *   titulo      text not null,
 *   categoria   text not null check (categoria in ('Academia','Social','Bienestar','Tech')),
 *   descripcion text not null,
 *   ubicacion   text not null,
 *   duracion    text not null,
 *   autor_id    uuid references auth.users(id) on delete cascade,
 *   autor_email text not null,
 *   creado_en   timestamptz default now(),
 *   expires_at  timestamptz not null,
 *   estado      text default 'activo' check (estado in ('activo','inactivo','oculto'))
 * );
 * alter table events enable row level security;
 * create policy "Authenticated users can insert events"
 *   on events for insert with check (auth.uid() = autor_id);
 * create policy "Authenticated users can read active events"
 *   on events for select using (auth.role() = 'authenticated');
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);