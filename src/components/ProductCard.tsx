import { 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Box 
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { type Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Format time distance ("2 days ago", etc)
  const timeAgo = formatDistanceToNow(new Date(product.createdAt), { addSuffix: true });
  
  // Get the first media item for display
  const media = product.media && product.media.length > 0 
    ? product.media[0] 
    : null;
  
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: '0 3px 3px -2px rgba(0,0,0,0.2), 0 3px 4px 0 rgba(0,0,0,0.14), 0 1px 8px 0 rgba(0,0,0,0.12)',
        },
        cursor: 'pointer',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={media ? media.url : "/placeholder-product.svg"}
          alt={product.title}
          sx={{ objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'rgba(33, 33, 33, 0.8)',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
          }}
        >
          ${product.price.toFixed(2)}
        </Box>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {product.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mb: 1 }}>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
          <Typography variant="caption">{timeAgo}</Typography>
          <Typography variant="caption">{product.views} views</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
