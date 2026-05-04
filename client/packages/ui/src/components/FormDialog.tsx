import type { PropsWithChildren, ReactNode } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, type ButtonProps } from '@mui/material'

interface FormDialogProps extends PropsWithChildren {
  open: boolean
  title: string
  description?: ReactNode
  submitLabel?: string
  cancelLabel?: string
  onClose: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  submitDisabled?: boolean
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg'
  secondaryAction?: ReactNode
  submittingLabel?: string
  submitButtonColor?: ButtonProps['color']
}

export function FormDialog({
  open,
  title,
  description,
  submitLabel,
  cancelLabel = 'Cancel',
  onClose,
  onSubmit,
  isSubmitting = false,
  submitDisabled = false,
  maxWidth = 'sm',
  secondaryAction,
  submittingLabel = 'Saving…',
  submitButtonColor = 'primary',
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
          {children}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={isSubmitting} color="inherit">
          {cancelLabel}
        </Button>
        {secondaryAction}
        {submitLabel && onSubmit ? (
          <Button onClick={onSubmit} disabled={submitDisabled || isSubmitting} variant="contained" color={submitButtonColor}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
