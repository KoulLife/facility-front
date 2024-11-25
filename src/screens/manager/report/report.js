import React, { useState } from 'react';
import validationAuth from '../../../validationAuth';
import { Tab, Box, Typography } from '@mui/material';
import { TabList, TabPanel, TabContext } from '@mui/lab';
import CheckReport1 from './checkReport1';
import CheckReport2 from './checkReport2';
import AsReport from './asReport';

const Report = () => {
    const [selectTab, setSelectTab] = useState("1")
 
    const handleTabChange = (event, tab) => {
        setSelectTab(tab)
    }

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant='h6'>보고서</Typography>
            <Box sx={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
                <TabContext value={selectTab}>
                    <TabList onChange={handleTabChange} >
                        <Tab disableRipple label="평화의전당 자체 안전검사표" value="1" />
                        <Tab disableRipple label="기타시설 자체 안전검사표" value="2" />
                        {/* <Tab disableRipple label="고장A/S 보고서" value="3" /> */}
                    </TabList>
                    <TabPanel sx={{width:'100%', padding:0, borderTop:'1px solid #ccc'}} value="1"><CheckReport1 /></TabPanel>
                    <TabPanel sx={{width:'100%', padding:0, borderTop:'1px solid #ccc'}} value="2"><CheckReport2 /></TabPanel>
                    {/* <TabPanel sx={{width:'100%', padding:0, borderTop:'1px solid #ccc'}} value="3"><AsReport /></TabPanel> */}
                </TabContext>
            </Box>
        </Box>
    );
};

export default validationAuth(Report);