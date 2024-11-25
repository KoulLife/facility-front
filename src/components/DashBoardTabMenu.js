// DashBoardTabMenu.js
import React from 'react';
import { Container, Tab, Box } from '@mui/material';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import Header from './Header';

//사용안함
const DashBoardTabMenu = ({ children, selectedMenu, onTabChange }) => {
    return (
        <div>
            <Container maxWidth="lg">
                <TabContext value={selectedMenu}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={onTabChange} aria-label="Dashboard tabs">
                            <Tab label="시설정보" value="시설정보" />
                            <Tab label="시설 미점검 현황" value="시설 미점검 현황" />
                            <Tab label="시설 점검 현황" value="시설 점검 현황" />
                            <Tab label="고장 A/S" value="고장 A/S" />
                            <Tab label="인원정보" value="인원정보" />
                            <Tab label="조직 관리" value="조직 관리" />
                            <Tab label="자료실" value="자료실" />
                            <Tab label="고객의 소리" value="고객의 소리"/>
                        </TabList>
                    </Box>
                    {children}
                </TabContext>
            </Container>
        </div>
    );
};

export default DashBoardTabMenu; 
