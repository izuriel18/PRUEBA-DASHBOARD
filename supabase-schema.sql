-- supabase-schema.sql
-- Ejecuta este script en el "SQL Editor" de tu Dashboard de Supabase

-- Crear la tabla principal de reportes
CREATE TABLE public.reports (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL,
    area TEXT NOT NULL,
    category TEXT NOT NULL,
    risk TEXT NOT NULL,
    description TEXT,
    reporter TEXT NOT NULL,
    status TEXT NOT NULL,
    resolution TEXT
);

-- Configurar políticas de seguridad básica (RLS)
-- Como estamos usando la anon key pública, habilitamos el acceso a todo para propósitos del dashboard
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir lecturas públicas
CREATE POLICY "Permitir lecturas anonimas" 
ON public.reports FOR SELECT 
USING (true);

-- Crear política para permitir inserciones públicas
CREATE POLICY "Permitir inserciones anonimas" 
ON public.reports FOR INSERT 
WITH CHECK (true);

-- Crear política para permitir actualizaciones públicas
CREATE POLICY "Permitir actualizaciones anonimas" 
ON public.reports FOR UPDATE 
USING (true);
