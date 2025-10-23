Halo Qwen,

Saya sedang membangun WMS (Warehouse Management System) menggunakan **Laravel 12** dan starter kit **Inertia.js (React)**. Database saya menggunakan **PostgreSQL**.

**Kebutuhan Utama Front-End:**
Saya menggunakan library komponen **Ant Design (Antd)**. Tolong pastikan semua contoh kode komponen UI React (seperti Form, Table, Button, Modal, Select, Checkbox, dll.) yang Anda generate menggunakan komponen dari **Antd**.

**Arsitektur Teknis Backend:**

1.  **Koneksi Database `default` (core):** Menyimpan tabel `users` dan tabel aplikasi utama lainnya.
2.  **Koneksi Database `db-auth` (khusus otentikasi):** Saya ingin _semua_ tabel paket `spatie/laravel-permission` (seperti `roles`, `permissions`, `model_has_roles`, dll.) berada di koneksi `db-auth` ini.
3.  **Penggunaan UUID:** Semua model saya, termasuk `User`, `Role`, dan `Permission`, menggunakan UUID sebagai primary key.

Tolong generate kode lengkap untuk mengelola Role, Permission, dan User dalam tumpukan teknologi ini.

---

## Bagian 1: Konfigurasi Backend Spatie (UUID & Koneksi Terpisah)

Tolong berikan langkah-langkah konfigurasi backend yang tepat:

1.  **Konfigurasi `config/database.php`:** Contoh definisi koneksi `db-auth` untuk PostgreSQL.
2.  **Konfigurasi `config/permission.php`:** Perubahan yang diperlukan untuk:
    - Menggunakan koneksi `db-auth` (`'connection' => 'db-auth',`).
    - Mengaktifkan dukungan UUID (`'permission_uuids' => true,`).
3.  **Model `User` (`app/Models/User.php`):** Modifikasi model User untuk:
    - Secara eksplisit mengatur koneksi ke `default` (`protected $connection = 'default';`).
    - Menggunakan Trait `HasRoles` dari Spatie dan Trait `HasUuids` dari Laravel.
4.  **Migrasi Spatie:** Contoh modifikasi file migrasi Spatie (setelah di-publish) agar menggunakan `uuid('id')->primary()` dan `foreignUuid()` untuk semua relasi.

---

## Bagian 2: Permission Seeder

Tolong buatkan `PermissionSeeder.php`. Seeder ini harus membuat semua permission yang saya butuhkan di database `db-auth` dengan `guard_name` = `'web'`.

Daftar menu/fitur yang saya butuhkan (tolong generate permission berbasis `[aksi]-[menu]`, contoh: `create-location-suggestion`, `view-dashboard`):

1.  **Dashboard** (view)
2.  **CRUD Location Suggestion** (create, read, update, delete)
3.  **Search Product** (search)
4.  **Inbound Supplier** (create, read, update)
5.  **Inbound Return** (create, read, update)
6.  **RFID Tagging Inbound Supplier** (tag)
7.  **RFID Tagging Inbound Return** (tag)
8.  **Remove RFID** (remove)
9.  **Inbound QC** (process)
10. **Penyimpanan / Putaway** (read, process)
11. **Stock Opname** (read, process)
12. **Receiving Order Store** (read, process)
13. **Receiving Order Ecommerce** (read, process)
14. **Outbound QC** (process)
15. **Packing Order Store** (read, process)
16. **Packing Order Ecommerce** (read, process)
17. **Outbound** (read, process)
18. **Staging** (process)
19. **Manajemen Role** (create, read, update, delete, assign-permission)
20. **Manajemen User** (create, read, update, delete, assign-role, assign-warehouse)

---

## Bagian 3: CRUD Role & Permission (Inertia + React + Antd)

Tolong generate kode untuk **Inertia Controller** dan **Komponen React Antd**.

1.  **Controller (`RoleController.php`):**
    - Generate full CRUD (index, create, store, edit, update, destroy).
    - Metode `index` mengembalikan `Inertia::render('Roles/Index', ...)`.
    - Metode `create` dan `edit` mengembalikan `Inertia::render()` dan mengirimkan _props_ berisi daftar _semua permission_ dari `db-auth`.
    - Metode `store` dan `update` menangani validasi dan `syncPermissions()`.
2.  **Controller (`PermissionController.php`):**
    - Hanya metode `index` yang mengembalikan `Inertia::render('Permissions/Index', ...)`.
3.  **Komponen React + Antd (`resources/js/Pages/Roles/`):**
    - `Index.jsx`: Komponen React yang menggunakan `Table` dari Antd. Kolom 'Aksi' harus berisi `Button` Antd (Edit) dan `Popconfirm` Antd (Hapus) yang memanggil `router.delete()` dari Inertia.
    - `Create.jsx`: Komponen React dengan `Form` dari Antd. Gunakan `Form.Item` dengan `Input` untuk nama role. Untuk daftar permission, gunakan `Form.Item` dengan `Checkbox.Group` Antd.
    - `Edit.jsx`: Sama seperti `Create.jsx`, tapi `Form` Antd sudah terisi data (gunakan `form.setFieldsValue()` atau `initialValues`) termasuk permission yang sudah ter-check.
4.  **Komponen React + Antd (`resources/js/Pages/Permissions/`):**
    - `Index.jsx`: Komponen React yang menampilkan `Table` Antd untuk daftar semua permission.
5.  **Routes (`routes/web.php`):** Sediakan rute resource untuk `RoleController` dan `PermissionController`.

---

## Bagian 4: CRUD User & Relasi (Inertia + React + Antd)

Ini adalah bagian penting. Saya perlu mengelola **Users** (dari `default` db) dan mengaitkannya dengan **Roles** (dari `db-auth`) serta **Warehouses** (dari `default` db).

- **Model `User` (`app/Models/User.php`):**
    - Tabel `users` memiliki fillable: `name`, `username`, `email`, `password`, `ecommerce_access`, `wms_access`, `backoffice_access`, `store_access`.
    - Tunjukkan relasi `belongsToMany` ke `Warehouse` melalui tabel pivot `warehouse_users`.

<!-- end list -->

1.  **Controller (`UserController.php`):**
    - Generate full CRUD (index, create, store, edit, update, destroy).
    - Metode `create` dan `edit` harus mengembalikan `Inertia::render()` dan mengirimkan **3 props**: `roles` (dari `db-auth`), `warehouses` (dari `default` db), dan `user` (opsional untuk edit).
    - Metode `store`: Harus membuat user (di `default`), lalu `assignRole()` (ke `db-auth`), dan `warehouses()->sync()` (ke `default`).
    - Metode `update`: Harus update data user, lalu `syncRoles()`, dan `warehouses()->sync()`.
2.  **Komponen React + Antd (`resources/js/Pages/Users/`):**
    - `Index.jsx`: Komponen React yang menampilkan `Table` Antd untuk daftar user.
    - `Create.jsx` / `Edit.jsx`: Komponen React dengan `Form` Antd yang lengkap (gunakan `useForm` dari Inertia dan `Form` Antd).
        - `Form.Item` dengan `Input` untuk `name`, `username`, `email`.
        - `Form.Item` dengan `Input.Password` untuk `password` (buat opsional saat edit).
        - `Form.Item` dengan `Switch` atau `Checkbox` Antd untuk field boolean (`ecommerce_access`, `wms_access`, dll.).
        - `Form.Item` dengan `Select` Antd (mode `multiple`) untuk memilih **Roles**.
        - `Form.Item` dengan `Select` Antd (mode `multiple`) atau `TreeSelect` Antd untuk memilih **Warehouses**.
3.  **Routes (`routes/web.php`):** Tambahkan rute resource untuk `UserController`.

---

## Bagian 5: Implementasi Izin di React + Antd (Sangat Penting)

Bagaimana saya menggunakan izin-izin ini di front-end React dengan Antd?

1.  **Share Permissions ke Inertia:** Tunjukkan cara membagikan (share) _semua_ izin dan role milik user yang sedang login ke front-end React secara global (di middleware `app/Http/Middleware/HandleInertiaRequests.php` pada method `share`).

2.  **Custom React Hook (`usePermission`):**
    - Buat _custom React hook_ bernama `usePermission()` (misalnya di `resources/js/Hooks/usePermission.js`).
    - Hook ini harus mengambil data izin global yang di-share dari `usePage().props`.
    - Hook ini harus menyediakan fungsi helper seperti: `hasPermission(permissionName)`, `hasRole(roleName)`, `hasAnyPermission([...])`.

3.  **Contoh Penggunaan di Komponen Antd:**
    - Tunjukkan contoh cara menggunakan hook `usePermission()` untuk menyembunyikan atau menonaktifkan komponen Antd secara kondisional.

    **Contoh 1: Menyembunyikan Tombol (Conditional Rendering):**

    ```jsx
    import { Button } from 'antd';
    import { Link } from '@inertiajs/react';
    import { usePermission } from '@/Hooks/usePermission'; // Asumsi path

    const { hasPermission } = usePermission();

    {
        hasPermission('create-user') && (
            <Link href={route('users.create')}>
                <Button type="primary">Buat User Baru</Button>
            </Link>
        );
    }
    ```

    **Contoh 2: Menonaktifkan Tombol (Disabled State):**

    ```jsx
    import { Button } from 'antd';
    import { usePermission } from '@/Hooks/usePermission'; // Asumsi path

    const { hasPermission } = usePermission();

    {
        hasPermission('update-user') && (
            <Button onClick={handleUpdateAction}>Simpan Perubahan</Button>
        );
    }
    ```

Terima kasih.
