import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Container, 
  IconButton, 
  Button, 
  Grid, 
  useMediaQuery, 
  useTheme,
  Fab
} from '@mui/material';
import { 
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Add as AddIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';
import ProductUploadModal from '@/components/ProductUploadModal';
import SuccessDialog from '@/components/SuccessDialog';
import { type Product } from '@/lib/types';

export default function Home() {
  const [openModal, setOpenModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<number | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { data: products = [], isLoading, refetch } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });
  
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  
  const handleProductCreated = (productId: number) => {
    setCreatedProductId(productId);
    setOpenModal(false);
    setShowSuccess(true);
    refetch();
  };
  
  const handleAddAnother = () => {
    setShowSuccess(false);
    setOpenModal(true);
  };
  
  const handleViewProduct = () => {
    setShowSuccess(false);
    // In a real app, navigate to the product page
    console.log(`View product ${createdProductId}`);
  };
  
  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={2}>
        <Toolbar>
          <StoreIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SellEasy
          </Typography>
          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
            Your Products
          </Typography>
          {!isMobile && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Add Product
            </Button>
          )}
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Loading products...</Typography>
          </Box>
        ) : products.length > 0 ? (
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <EmptyState onAddProduct={handleOpenModal} />
        )}
      </Container>
      
      {isMobile && (
        <Fab 
          color="secondary" 
          aria-label="add" 
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            boxShadow: '0 6px 10px 0 rgba(0,0,0,0.14), 0 1px 18px 0 rgba(0,0,0,0.12), 0 3px 5px -1px rgba(0,0,0,0.2)',
          }}
          onClick={handleOpenModal}
        >
          <AddIcon />
        </Fab>
      )}
      
      <ProductUploadModal 
        open={openModal} 
        onClose={handleCloseModal} 
        onProductCreated={handleProductCreated}
      />
      
      <SuccessDialog 
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        onAddAnother={handleAddAnother}
        onViewProduct={handleViewProduct}
      />
    </Box>
  );
}
