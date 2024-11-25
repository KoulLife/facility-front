import React, { useState, useEffect, useCallback } from 'react';
import validationAuth from '../../validationAuth';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import * as common from '../../commons/common';
import UNIlogo from '../../images/UNI_LOGO_BLUE.png';
import { styled } from '@mui/material/styles';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import {
    Container, Box, IconButton, Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import { AccountTreeOutlined, PersonSearch, DisplaySettings, QrCode, CheckCircleOutline, Menu as MenuIcon } from '@mui/icons-material';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import MuiAppBar from '@mui/material/AppBar';
import ListItemButton from '@mui/material/ListItemButton';
import Toolbar from '@mui/material/Toolbar';
import MuiDrawer from '@mui/material/Drawer';
import useRoleBasedAccess from "../../commons/useRoleBasedAccess";

const GeneralManager = () => {

    useRoleBasedAccess(['ADMIN']);

    const navigate = useNavigate();
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const baseUrl = common.getApiUrl();

    const drawerWidth = 240;

    const AppBar = styled(MuiAppBar)(({ theme }) => ({
        zIndex: theme.zIndex.drawer + 1,
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: 'none',
        color: '#707070',
    }));

    const DrawerHeader = styled('div')({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 8px',
        minHeight: '60px'
    });

    const Drawer = styled(MuiDrawer)(({ theme }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            position: 'fixed',
            top: 64,  // AppBar의 높이만큼 내려서 고정
            height: 'calc(100% - 70px)'
        },
    }));

    const menuItems = [
        { text: '조직 관리', path: 'org-management', icon: <AccountTreeOutlined /> },
        { text: '사용자 설정', path: 'member-management', icon: <PersonSearch /> },
        { text: '시설 관리', path: 'facility-management', icon: <InventoryOutlinedIcon /> },
        { text: '화면 설정', path: 'screen-management', icon: <DisplaySettings /> },
        { text: 'QR코드 관리', path: 'qr-management', icon: <QrCode /> },
    ];

    const handleMenuClick = useCallback((item) => {
        setSelectedMenu(item.text);
        ScrollToTop();
        navigate(`/admin/${item.path}`);
    }, [navigate]);

    const ScrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${baseUrl}/auth/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <Helmet>
                <style>{'body { background-color: var(--main-white-color); }'}</style>
            </Helmet>
            <Box sx={{ display: 'flex' }}>
                <AppBar position="fixed" sx={{borderBottom:'1px solid rgba(0, 0, 0, 0.12)'}}>
                    <Toolbar style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <button
                                    onClick={() => navigate('/admin/org-management')}
                                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
                                >
                                    <img src={UNIlogo} alt="unicheck logo" style={{ width: '90px' }} />
                                </button>
                                <Typography
                                    color="inherit"
                                    noWrap
                                    style={{ marginLeft: '20px' }}
                                >
                                    시스템 관리자
                                </Typography>
                            </div>
                        </Box>
                        <IconButton onClick={handleLogout} color="inherit">
                            <ExitToAppIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={isSidebarOpen}>
                    <List>
                        {menuItems.map((item, index) => (
                            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        color: selectedMenu === item.text ? 'var(--main-blue-color)' : '#000'
                                    }}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: 1,
                                            justifyContent: 'left',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <DrawerHeader />
                    <Outlet />
                </Box>
            </Box>
        </>

    );
};

export default validationAuth(GeneralManager);