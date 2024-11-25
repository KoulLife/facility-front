import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useTheme, useMediaQuery, Box, Tabs, Tab, AppBar, Toolbar } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import useRoleBasedAccess from "../../commons/useRoleBasedAccess";
import uniLogo from '../../images/UNI_LOGO_BLUE.png';

function CheckerLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();
    const [mainTab, setMainTab] = React.useState('0');
    const [subTab, setSubTab] = React.useState('0');

    useRoleBasedAccess(['CHECKER']);

    const ScrollToTop = () => {
        window.scrollTo(0, 0);
    };

    React.useEffect(() => {
        ScrollToTop();
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const main = pathSegments[1] && pathSegments[1].includes('improvement') ? '1' : '0';
        let sub = '0';

        if (pathSegments[1] === 'improvement-registration-list') {
            sub = '0'; 
        } else if (pathSegments[1] === 'improvement-list') {
            sub = '1'; 
        } else if (pathSegments[1] === 'registered-list') {
            sub = '1';
        }

        setMainTab(main);
        setSubTab(sub);
    }, [location.pathname]);

    const handleMainChange = (event, newValue) => {
        const newPath = newValue === '0' ? 'to-register-list' : 'improvement-registration-list';
        setMainTab(newValue);
        setSubTab('0');
        navigate(`/checker/${newPath}`);
        ScrollToTop();
    };

    const handleSubChange = (event, newValue) => {
        let newPath;
        if (mainTab === '0') {
            newPath = newValue === '0' ? '/checker/to-register-list' : '/checker/registered-list';
        } else {
            newPath = newValue === '0' ? '/checker/improvement-registration-list' : '/checker/improvement-list';
        }
        ScrollToTop();
        setSubTab(newValue);
        navigate(newPath);
    };

    return (
        <>
            <AppBar position="fixed" sx={{ width: '100%', boxShadow: 'none', bgcolor: '#fff', zIndex: theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ minHeight: 65, display: 'flex', justifyContent: 'space-between' }}>
                    <Box component="img" src={uniLogo} sx={{ maxWidth: '70px' }}></Box>
                    <Link to="/checker/personal" style={{ textDecoration: 'none' }}>
                        <AccountCircleOutlinedIcon sx={{ color: 'rgb(112, 112, 112)' }}></AccountCircleOutlinedIcon>
                    </Link>
                </Toolbar>
                <Box sx={{ width: '100%' }}>
                    <TabContext value={`${mainTab}-${subTab}`}>
                        <Box sx={{ pt: 1, pl: 2, pr: 2 }}>
                            <Tabs
                                value={mainTab}
                                onChange={handleMainChange}
                                indicatorColor="none"
                                textColor="inherit"
                                variant="fullWidth"
                                centered
                                sx={{
                                    borderRadius: '10px',
                                    color: '#fff',
                                    fontSize: '1.2rem',
                                    '& .MuiTab-root': {
                                        backgroundColor: 'var(--main-white-color)',
                                        color: '#000',
                                        fontSize: '1.2rem',
                                    },
                                    '& .Mui-selected': {
                                        backgroundColor: 'var(--main-blue-color)',
                                        color: '#fff',
                                    },
                                }}
                            >
                                <Tab label="점검목록" value="0" />
                                <Tab label="고장 A/S" value="1" />
                            </Tabs>
                        </Box>
                        <Box sx={{ backgroundColor: 'white' }}>
                            <TabPanel value={`${mainTab}-${subTab}`} sx={{ pt: 1, pb: 0, px: 0, boxSizing:'border-box' }}>
                                {mainTab === '0' ? (
                                    <Tabs
                                        value={subTab}
                                        onChange={handleSubChange}
                                        variant="fullWidth"
                                        indicatorColor="primary"
                                        sx={{
                                            '& .MuiTab-root': {
                                                color: 'rgb(112, 112, 112)',
                                                fontSize: '0.9rem',
                                            },
                                            '& .Mui-selected': {
                                                color: 'var(--main-blue-color)',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                    >
                                        <Tab label="작성" value="0" />
                                        <Tab label="조회" value="1" />
                                    </Tabs>
                                ) : (
                                    <Tabs
                                        value={subTab}
                                        onChange={handleSubChange}
                                        variant="fullWidth"
                                        indicatorColor="primary"
                                        sx={{
                                            '& .MuiTab-root': {
                                                color: 'rgb(112, 112, 112)',
                                                fontSize: '0.9rem',
                                            },
                                            '& .Mui-selected': {
                                                color: 'var(--main-blue-color)',
                                                fontWeight: 'bold',
                                            },
                                        }}
                                    >
                                        <Tab label="등록" value="0" />
                                        <Tab label="목록" value="1" />
                                    </Tabs>
                                )}
                            </TabPanel>
                        </Box>
                    </TabContext>
                </Box>
            </AppBar>
            <Box sx={{ mt: '180px', width: '100%', p: isMobile ? 0 : 0 }}>
                <Outlet />
            </Box>
        </>
    );
}

export default CheckerLayout;