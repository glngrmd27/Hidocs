-- =========================================================
-- SQL Seeder & Migration Script untuk Role 'superadmin'
-- HiDocs Backend API
-- =========================================================

-- 1. Penyesuaian Query untuk Membuat Role Baru (Constraint/Schema Role)
-- Kolom 'role' pada tabel 'users' menggunakan VARCHAR(20) DEFAULT 'user'.
-- Jika basis data Anda menerapkan CHECK constraint pada kolom role, jalankan query berikut:
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'user'));

-- 2. Query Seeder untuk Membuat Akun SuperAdmin Pertama
-- Email    : superadmin@hidocs.id
-- Password : superadmin123
-- Note     : Hash password di bawah menggunakan Bcrypt cost 10 untuk "superadmin123"

INSERT INTO users (id, name, email, password_hash, role, is_active, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'Almer Superadmin',
    'almerriwanto004@gmail.com',
    '$2a$12$YoZeFL8Bq.hBhcZQIdKtvudFGMDHslKhQHuCehMQ4r/O5EX7Rg3D2', -- bcrypt hash for almer2304
    'superadmin',
    TRUE,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE 
SET role = 'superadmin',
    is_active = TRUE,
    updated_at = NOW();
