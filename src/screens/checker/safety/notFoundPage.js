import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
    return (
        <Box sx={{
            height:'100vh',
            display:'flex',
            flexDirection:'column',
            justifyContent:'center',
            alignItems:'center'
        }}>
            <Typography variant="h4">404 - Page Not Found</Typography>
            <Typography variant="body1">허용되지 않는 접근입니다.</Typography>
        </Box>
    );
}