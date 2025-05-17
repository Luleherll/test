import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  useTheme,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  LightbulbOutlined as LightbulbIcon,
  PhotoCamera as PhotoCameraIcon,
  Collections as CollectionsIcon,
} from '@mui/icons-material';
import { nanoid } from 'nanoid';
import { UploadedFile } from '@/lib/types';

interface MediaUploadProps {
  onFilesChange: (files: File[]) => void;
}

export default function MediaUpload({ onFilesChange }: MediaUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [cameraSupported, setCameraSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  
  // Check if camera is supported on this device
  useEffect(() => {
    if (navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices) {
      setCameraSupported(true);
    }
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCameraClick = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: UploadedFile[] = [];
      
      Array.from(files).forEach(file => {
        // Determine if it's an image or video
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Create object URL for preview
        const preview = URL.createObjectURL(file);
        
        newFiles.push({
          id: nanoid(),
          file,
          preview,
          type: fileType,
        });
      });
      
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      
      // Pass the file objects to parent component
      onFilesChange(updatedFiles.map(f => f.file));
      
      // Reset input value to allow selecting the same file again
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== id);
    setUploadedFiles(updatedFiles);
    
    // Pass the updated file objects to parent component
    onFilesChange(updatedFiles.map(f => f.file));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
        Product Media
      </Typography>
      
      <Box 
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
        }}
      >
        <Box 
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 3,
            background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="camera"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          
          <CloudUploadIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Add photos and videos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Up to 5 files (max 10MB each)
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            <Button
              variant="contained"
              startIcon={<CollectionsIcon />}
              onClick={handleUploadClick}
              color="primary"
              sx={{ borderRadius: 6, px: 3 }}
            >
              Gallery
            </Button>
            
            {cameraSupported && (
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                onClick={handleCameraClick}
                sx={{ borderRadius: 6, px: 3 }}
              >
                Camera
              </Button>
            )}
          </Stack>
        </Box>
        
        {uploadedFiles.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'file' : 'files'} selected
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: 6,
                  },
                  '&::-webkit-scrollbar-track': {
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: 'action.disabled',
                    borderRadius: 1,
                  },
                }}
              >
                {uploadedFiles.map((file) => (
                  <Tooltip key={file.id} title={file.file.name}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        flexShrink: 0,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <Box
                        component={file.type === 'image' ? 'img' : 'video'}
                        src={file.preview}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.8)',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.95)',
                          },
                          width: 22,
                          height: 22,
                        }}
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: theme.palette.background.default, 
          p: 2, 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LightbulbIcon 
            fontSize="small" 
            color="primary" 
            sx={{ mr: 1 }} 
          />
          <Typography variant="subtitle2">
            Tips for great product photos:
          </Typography>
        </Box>
        <List dense disablePadding>
          <ListItem sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Use good lighting to clearly show your product"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Include multiple angles to show all features"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0.25 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Add a video to demonstrate how it works"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
}
