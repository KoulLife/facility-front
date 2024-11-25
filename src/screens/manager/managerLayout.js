import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import * as common from '../../commons/common';
import { useIsLoginState } from '../../components/IsLoginContext';
import useRoleBasedAccess from "../../commons/useRoleBasedAccess";
import UNIlogo from '../../images/UNI_LOGO_BLUE.png';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Divider,
    Collapse,
    ListItemIcon,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
// icons
import MenuIcon from '@mui/icons-material/Menu';
import ListItemButton from '@mui/material/ListItemButton';
import AddchartIcon from '@mui/icons-material/Addchart';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DialpadOutlinedIcon from '@mui/icons-material/DialpadOutlined';
import DvrIcon from '@mui/icons-material/Dvr';
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { BorderRight, BuildOutlined } from '@mui/icons-material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';

const ManagerLayout = ({ children }) => {

    useRoleBasedAccess(['MANAGE']);

    const location = useLocation();
    const navigate = useNavigate();
    const { user, setIsLogin } = useIsLoginState();

    const [open, setOpen] = useState(true);
    const [openMenus, setOpenMenus] = useState(false); //서브메뉴 open
    const [selectedMenu, setSelectedMenu] = useState(null);

    const menuItems = [
        // { text: '대시보드', subItems: ['시설별', '인원별'], path: 'dashboard', icon: <AddchartIcon /> },
        { text: '대시보드', path: 'dashboard/facility', icon: <AddchartIcon /> },
        { text: '시설 설정', path: 'facility-info', icon: <DvrIcon /> },
        { text: '시설 점검 현황', subItems: ['점검현황', '미점검현황'], path: 'status', icon: <DialpadOutlinedIcon /> },
        { text: '고장 A/S 현황', path: 'as', icon: <BuildOutlined /> },
        { text: '고객의 소리', path: 'customer-voice', icon: <SentimentSatisfiedAltOutlinedIcon /> },
        { text: '보고서', path: 'report', icon: <InventoryOutlinedIcon /> },
        { text: '게시판', subItems: ['정기검사', '안전수칙'], path: 'bulletin-board', icon: <FormatListBulleted /> },
        { text: '조직관리', path: 'showOrg', icon: <AccountTreeOutlinedIcon /> },
        { text: '점검 강제등록', path: 'force-register', icon: <WarningAmberIcon /> },
    ];

    const ScrollToTop = () => {
        window.scrollTo(0, 0);
    };

    const handleDrawer = useCallback(() => {
        setOpen(prevState => !prevState);
        setOpenMenus(prevState => !prevState);
    }, []);

    const handleMenuClick = useCallback((item) => {
        if (item.subItems) {
            setOpen(true);
            setOpenMenus(prevState => ({
                ...Object.fromEntries(Object.entries(prevState).map(([key]) => [key, false])),
                [item.text]: !prevState[item.text]
            }));
        } else {
            setSelectedMenu(item.text);
            setOpenMenus(prevState => ({
                ...Object.fromEntries(Object.entries(prevState).map(([key]) => [key, false]))
            }));
            if (item.path) {
                ScrollToTop();
                navigate(`/manager/${item.path}`);
            }
        }
    }, [navigate]);

    const handleSubMenuClick = useCallback((item, subItem) => {
        ScrollToTop();
        if (item.text === '시설 점검 현황') {
            navigate(`/manager/status/${subItem === '점검현황' ? 'check' : 'uncheck'}`);
        } else if (item.text === '게시판') {
            navigate(`/manager/bulletin-board/${subItem === '정기검사' ? 'regularInspection' : 'guides'}`);
        }
    }, [navigate]);

    useEffect(() => {
        let activeMenu = menuItems.find(item => location.pathname.includes(item.path));
        let foundSubItem = null;

        if (activeMenu) {
            setSelectedMenu(activeMenu.text); // 상위 메뉴 강조
            if (activeMenu.subItems) {
                foundSubItem = activeMenu.subItems.find(subItem => {
                    const subPath = activeMenu.text === '시설 점검 현황'
                        ? `/manager/status/${subItem === '점검현황' ? 'check' : 'uncheck'}`
                        : `/manager/bulletin-board/${subItem === '정기검사' ? 'regularInspection' : 'guides'}`;
                    return location.pathname.includes(subPath);
                });
                if (foundSubItem) {
                    setSelectedMenu(foundSubItem); // 서브메뉴 강조
                    setOpenMenus(prevState => ({
                        ...Object.fromEntries(Object.entries(prevState).map(([key]) => [key, false])),
                        [activeMenu.text]: true  // 현재 활성화된 서브메뉴 열기
                    }));
                } else {
                    setOpenMenus(prevState => ({
                        ...Object.fromEntries(Object.entries(prevState).map(([key]) => [key, false]))
                    }));
                }
            } else {
                setOpenMenus(prevState => ({
                    ...Object.fromEntries(Object.entries(prevState).map(([key]) => [key, false]))
                }));
            }
        }
    }, [location.pathname]);


    const handleLogout = async () => {
        const url = `${common.getApiUrl()}/auth/logout`;
        const accessToken = localStorage.getItem('access_token');

        try {
            const response = await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsLogin(false);
            navigate('/', { replace: true });
        } catch (error) {
            common.handleApiError(error);
        }
    };

    const drawerWidth = 220;
    const drawerHeight = 65;

    const openedMixin = {
        width: drawerWidth,
        overflowX: 'hidden',
        borderRight: 0
    };

    const closedMixin = {
        overflowX: 'hidden',
        width: 56
    };

    const DrawerHeader = styled('div')({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '0 8px',
        minHeight: `${drawerHeight}px`,
        height: `${drawerHeight}px`,
        lineHeight: `${drawerHeight}px`,
        boxSizing: 'border-box',
        borderRight: '0',
    });

    const AppBar = styled(MuiAppBar, {
        shouldForwardProp: (prop) => prop !== 'open',
    })(({ open }) => ({
        zIndex: 1300,
        marginLeft: open ? drawerWidth : 56,
        lineHeight: `${drawerHeight}px`,
        overflow: 'hidden',
        backgroundColor: '#fff',
        boxShadow: 'none',
        boxSizing: 'border-box',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        color: '#707070',
        width: `calc(100% - ${open ? drawerWidth : 56}px)`
    }));

    const Drawer = styled(MuiDrawer, {
        shouldForwardProp: (prop) => prop !== 'open',
    })(({ open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        border: 'none',
        ...(open && {
            ...openedMixin,
            '& .MuiDrawer-paper': openedMixin,
        }),
        ...(!open && {
            ...closedMixin,
            '& .MuiDrawer-paper': closedMixin,
        })
    }));

    const logo = useMemo(() => (
        <Box
            component="img"
            src={UNIlogo}
            alt="KyungHeeUniversity Logo"
            sx={{
                maxWidth: '80px',
                height: 'auto',
                marginLeft: '10px',
                cursor: 'pointer',
            }}
            onClick={() => navigate('/manager/dashboard/facility')}
        />
    ), []);

    return (
        <>
            <Helmet>
                <style>{'body { background-color: var(--main-white-color); }'}</style>
            </Helmet>
            <Box sx={{ width: '100%' }}>
                <AppBar position="fixed" open={open} >
                    <Toolbar sx={{ height: '65px', lineHeight: '65px', minHeight: '65px !important', boxSizing: 'border-box' }}>
                        <Typography variant='subtitle2' noWrap component="div" sx={{ color: '#000' }}>관리자</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                            <Link to="/manager/personal-info" style={{ textDecoration: 'none', display: 'flex' }}>
                                <AccountCircleOutlinedIcon sx={{ color: 'var(--main-blue-color)', marginRight: '5px' }} />
                            </Link>
                            <Typography variant="body2" sx={{ mr: 2 }} >
                                {user ? `${user.memberNm}님 안녕하세요` : '관리자님 안녕하세요'}
                            </Typography>
                            <Button color="inherit"
                                sx={{ ml: 1, fontSize: '0.8rem' }}
                                onClick={handleLogout}>
                                로그아웃
                            </Button>
                        </Box>
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open}>
                    <DrawerHeader>
                        <IconButton onClick={handleDrawer}>
                            <MenuIcon />
                        </IconButton>
                        {<Box
                            component="img"
                            src={UNIlogo}
                            alt="KyungHeeUniversity Logo"
                            sx={{
                                maxWidth: '80px',
                                height: 'auto',
                                marginLeft: '10px',
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate('/manager/dashboard/facility')}
                        />}
                    </DrawerHeader>
                    <Divider />
                    <List sx={{ padding: '13px 0' }}>
                        {menuItems.map((item, index) => (
                            <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        color: selectedMenu === item.text ? 'var(--main-blue-color)' : null
                                    }}
                                    onClick={() => handleMenuClick(item)}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 1 : 'auto',
                                            color: selectedMenu === item.text ? 'var(--main-blue-color)' : null,
                                            justifyContent: 'left',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                                    {item.subItems && open ?
                                        (openMenus[item.text] ? <ExpandLess sx={{ color: '#CCCCCC' }} /> : <ExpandMore sx={{ color: 'var(--sub-darkgrey-color)' }} />) : null}
                                </ListItemButton>
                                {item.subItems && (
                                    <Collapse in={openMenus[item.text]} unmountOnExit={true}>
                                        <Box sx={{ mb: 2 }}>
                                            <List component="div" disablePadding>
                                                {item.subItems.map((subItem, subIndex) => (
                                                    <ListItemButton
                                                        key={subIndex}
                                                        sx={{
                                                            pl: 6,
                                                            height: '36px',
                                                            color: selectedMenu === subItem ? 'var(--main-blue-color)' : null
                                                        }}
                                                        onClick={() => handleSubMenuClick(item, subItem)}
                                                    >
                                                        <ListItemText
                                                            disableTypography
                                                            primary={subItem}
                                                            sx={{ fontSize: '0.9rem', fontFamily: 'Pretendard-Regular' }}
                                                        />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Box>
                                    </Collapse>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
            </Box>
            <DrawerHeader />
            <Box sx={{ p: 3, marginLeft: open ? `${drawerWidth}px` : '56px'}}>
                <Outlet />
            </Box>
        </>
    );
};

export default ManagerLayout;