'use client'

import React, { useRef } from 'react'
import {
  FormSubmit,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useHotkey,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'

/** Frontend dashboard (bukan /admin). */
const DASHBOARD_HREF = '/'

type Props = {
  label?: string
}

/**
 * Tombol Save admin: setelah **create** sukses, redirect ke dashboard utama.
 * Update dokumen tetap di halaman edit (perilaku default Payload).
 * Di dalam drawer (relationship) tidak redirect — biar alur relasi aman.
 */
export default function SaveButtonRedirectDashboard({ label: labelProp }: Props) {
  const { uploadStatus } = useDocumentInfo()
  const { t } = useTranslation()
  const { submit } = useForm()
  const modified = useFormModified()
  const label = labelProp || t('general:save')
  const ref = useRef<HTMLButtonElement>(null)
  const editDepth = useEditDepth()
  const operation = useOperation()

  const disabled =
    (operation === 'update' && !modified) || uploadStatus === 'uploading'

  useHotkey(
    {
      cmdCtrlKey: true,
      editDepth,
      keyCodes: ['s'],
    },
    (e) => {
      if (disabled) {
        // absorb
      }
      e.preventDefault()
      e.stopPropagation()
      if (ref?.current) {
        ref.current.click()
      }
    },
  )

  const handleSubmit = () => {
    if (uploadStatus === 'uploading') {
      return
    }

    void (async () => {
      const result = await submit()
      // Hanya create di level dokumen penuh (bukan drawer relasi)
      const shouldRedirectHome =
        operation === 'create' &&
        editDepth < 2 &&
        result?.res != null &&
        result.res.status < 400

      if (shouldRedirectHome && typeof window !== 'undefined') {
        window.location.assign(DASHBOARD_HREF)
      }
    })()
  }

  return (
    <FormSubmit
      buttonId="action-save"
      disabled={disabled}
      onClick={handleSubmit}
      ref={ref}
      size="medium"
      type="button"
    >
      {label}
    </FormSubmit>
  )
}
