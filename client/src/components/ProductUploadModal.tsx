import { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  useMediaQuery,
  useTheme,
  FormHelperText,
  Slide,
  Divider,
  Tooltip,
  Fab,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { 
  Close as CloseIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import MediaUpload from './MediaUpload';
import { apiRequest } from '@/lib/queryClient';
import { ProductFormData } from '@/lib/types';
import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Validation schema
const productSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(80, 'Title must be less than 80 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
});

// Props for the component
interface ProductUploadModalProps {
  open: boolean;
  onClose: () => void;
  onProductCreated: (productId: number) => void;
}

// Slide transition for mobile
const SlideUpTransition = React.forwardRef(function SlideUpTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ProductUploadModal({ 
  open, 
  onClose,
  onProductCreated,
}: ProductUploadModalProps) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { toast } = useToast();
  
  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();
  
  const { 
    control, 
    handleSubmit, 
    reset,
    setValue,
    formState: { errors },
    getValues
  } = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      price: undefined,
      description: '',
      category: '',
    }
  });
  
  // Handle speech recognition results
  React.useEffect(() => {
    if (transcript && activeField && !listening && isListening) {
      // Update the form field with the transcribed text
      const currentValue = getValues(activeField as any) || '';
      
      if (activeField === 'price') {
        // Try to extract a number from the transcript
        const priceMatch = transcript.match(/\d+(\.\d+)?/);
        if (priceMatch) {
          setValue(activeField as any, parseFloat(priceMatch[0]));
        }
      } else if (typeof currentValue === 'string') {
        setValue(activeField as any, 
          currentValue ? `${currentValue} ${transcript}` : transcript
        );
      }
      
      // Reset for next use
      resetTranscript();
      setIsListening(false);
      setActiveField(null);
    }
  }, [transcript, listening, activeField, isListening, setValue, getValues, resetTranscript]);
  
  const startListening = (fieldName: string) => {
    if (browserSupportsSpeechRecognition) {
      setActiveField(fieldName);
      setIsListening(true);
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
      
      toast({
        title: 'Voice Input Active',
        description: `Speak now to add text to the ${fieldName} field`,
      });
    } else {
      toast({
        title: 'Voice Input Not Supported',
        description: 'Your browser does not support speech recognition.',
        variant: 'destructive',
      });
    }
  };
  
  const stopListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
  };
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const formData = new FormData();
      
      // Add product data
      formData.append('title', data.title);
      formData.append('price', data.price.toString());
      formData.append('description', data.description);
      formData.append('category', data.category);
      
      // Add media files
      data.media.forEach(file => {
        formData.append('media', file);
      });
      
      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Reset form and close modal
      reset();
      setMediaFiles([]);
      onProductCreated(data.id);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });
  
  const handleFormSubmit = (data: z.infer<typeof productSchema>) => {
    stopListening();
    mutate({
      ...data,
      media: mediaFiles,
    });
  };
  
  const handleMediaChange = (files: File[]) => {
    setMediaFiles(files);
  };
  
  const handleClose = () => {
    if (!isPending) {
      reset();
      setMediaFiles([]);
      stopListening();
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      fullScreen={isMobile}
      fullWidth
      maxWidth="md"
      TransitionComponent={isMobile ? SlideUpTransition : undefined}
      PaperProps={{
        sx: isMobile ? {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          m: 0,
          bottom: 0,
          position: 'absolute',
          maxHeight: '90vh',
        } : {}
      }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Add New Product</Typography>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={handleClose} 
            aria-label="close"
            disabled={isPending}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <MediaUpload onFilesChange={handleMediaChange} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 2, mt: 4 }}>
            Product Details
          </Typography>
          
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Box sx={{ position: 'relative' }}>
                <TextField
                  {...field}
                  label="Product Title"
                  fullWidth
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors.title?.message || 'Keep it short and specific (max 80 characters)'}
                  disabled={isPending || isListening && activeField === 'title'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Voice input" placement="top">
                          <IconButton
                            onClick={() => startListening('title')}
                            disabled={isPending || (isListening && activeField !== 'title')}
                            color={isListening && activeField === 'title' ? "primary" : "default"}
                            size="small"
                          >
                            {isListening && activeField === 'title' ? <MicIcon color="primary" /> : <MicOffIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          />
          
          <Controller
            name="price"
            control={control}
            render={({ field: { value, onChange, ...field } }) => (
              <Box sx={{ position: 'relative' }}>
                <TextField
                  {...field}
                  label="Price"
                  fullWidth
                  type="number"
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Voice input" placement="top">
                          <IconButton
                            onClick={() => startListening('price')}
                            disabled={isPending || (isListening && activeField !== 'price')}
                            color={isListening && activeField === 'price' ? "primary" : "default"}
                            size="small"
                          >
                            {isListening && activeField === 'price' ? <MicIcon color="primary" /> : <MicOffIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
                  value={value === undefined ? '' : value}
                  error={!!errors.price}
                  helperText={errors.price?.message}
                  disabled={isPending || isListening && activeField === 'price'}
                />
              </Box>
            )}
          />
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Box sx={{ position: 'relative' }}>
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  error={!!errors.description}
                  helperText={errors.description?.message || 'Describe your product in detail (materials, features, condition, etc.)'}
                  disabled={isPending || isListening && activeField === 'description'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ position: 'absolute', top: 10, right: 10 }}>
                        <Tooltip title="Voice input" placement="top">
                          <IconButton
                            onClick={() => startListening('description')}
                            disabled={isPending || (isListening && activeField !== 'description')}
                            color={isListening && activeField === 'description' ? "primary" : "default"}
                            size="small"
                          >
                            {isListening && activeField === 'description' ? <MicIcon color="primary" /> : <MicOffIcon />}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
                {isListening && activeField === 'description' && (
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: '20px', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      p: 1,
                      px: 2,
                      borderRadius: 3,
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      boxShadow: 3,
                    }}
                  >
                    <MicIcon fontSize="small" />
                    <Typography variant="body2">
                      {transcript ? transcript : 'Listening...'}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          />
          
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <FormControl 
                fullWidth 
                margin="normal" 
                error={!!errors.category}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  {...field}
                  labelId="category-label"
                  label="Category"
                  disabled={isPending}
                >
                  <MenuItem value="">Select Category</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                  <MenuItem value="clothing">Clothing & Accessories</MenuItem>
                  <MenuItem value="home">Home & Garden</MenuItem>
                  <MenuItem value="beauty">Beauty & Personal Care</MenuItem>
                  <MenuItem value="toys">Toys & Games</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.category && (
                  <FormHelperText>{errors.category.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </form>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2, flexDirection: 'column' }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          form="product-form"
          disabled={isPending}
          sx={{ py: 1.5, mb: 1 }}
        >
          {isPending ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'List Product'
          )}
        </Button>
        
        <Button 
          color="inherit" 
          disabled={isPending}
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'transparent',
              color: 'primary.main',
            },
          }}
        >
          Save as Draft
        </Button>
      </DialogActions>
    </Dialog>
  );
}
