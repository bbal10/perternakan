import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Pengguna',
    plural: 'Pengguna',
  },
  auth: true,
  admin: {
    group: 'Sistem',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description: 'Akun yang bisa login ke admin & dashboard.',
  },
  access: {
    // Allow unauthenticated create so first-user setup works; after that only logged-in users.
    create: () => true,
    read: ({ req }) => !!req.user,
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nama',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Staff', value: 'staff' },
      ],
      defaultValue: 'admin',
      label: 'Peran',
    },
  ],
  timestamps: true,
}
