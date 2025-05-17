import { 
  Dialog, 
  DialogContent, 
  Box, 
  Typography, 
  Button, 
  Stack,
  Zoom
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

interface SuccessDialogProps {
  open: boolean;
  onClose: () => void;
  onViewProduct: () => void;
  onAddAnother: () => void;
}

export default function SuccessDialog({
  open,
  onClose,
  onViewProduct,
  onAddAnother
}: SuccessDialogProps) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
      TransitionComponent={Zoom}
    >
      <DialogContent>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            textAlign: 'center',
            py: 2
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'success.light',
              color: 'success.contrastText',
              mb: 3,
              opacity: 0.9
            }}
          >
            <CheckCircleIcon fontSize="large" />
          </Box>
          
          <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 500 }}>
            Product Listed Successfully
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your product is now visible to millions of potential buyers
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              fullWidth
              onClick={onViewProduct}
            >
              View Product
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              onClick={onAddAnother}
            >
              Add Another
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
