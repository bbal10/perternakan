import type { CollectionConfig } from 'payload'

const isHttps =
  (process.env.NEXT_PUBLIC_SERVER_URL || '').startsWith('https://') ||
  process.env.NODE_ENV === 'production'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Pengguna',
    plural: 'Pengguna',
  },
  auth: {
    // HTTPS reverse-proxy (Caddy): Secure cookies required for reliable session after login
    cookies: {
      sameSite: 'Lax',
      secure: isHttps,
    },
    tokenExpiration: 60 * 60 * 24 * 7, // 7 days
    maxLoginAttempts: 10,
    lockTime: 600 * 1000,
    useSessions: true,
  },
  admin: {
    group: 'Sistem',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role'],
    description: 'Akun yang bisa login ke admin & dashboard.',
  },
  access: {
    // First-user bootstrap needs open create; after first user exists only admins create.
    create: async ({ req }) => {
      if (req.user) return true
      const users = await req.payload.find({
        collection: 'users',
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      return users.totalDocs === 0
    },
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
