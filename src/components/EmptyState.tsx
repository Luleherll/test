import { 
  Box, 
  Typography, 
  Button, 
  Paper 
} from '@mui/material';
import { Inventory2 as InventoryIcon, Add as AddIcon } from '@mui/icons-material';

interface EmptyStateProps {
  onAddProduct: () => void;
}

export default function EmptyState({ onAddProduct }: EmptyStateProps) {
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        textAlign: 'center',
        maxWidth: 500,
        mx: 'auto',
        mt: 4
      }}
    >
      <InventoryIcon 
        sx={{ 
          fontSize: 64, 
          color: 'text.secondary',
          mb: 2
        }} 
      />
      <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 500 }}>
        No products yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Start selling by adding your first product
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={onAddProduct}
      >
        Add Product
      </Button>
    </Paper>
  );
}
