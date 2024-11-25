import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box,
    Typography,
    Paper
} from '@mui/material';
import OrgTree from 'react-org-tree';
import axios from 'axios';
import * as common from '../../../commons/common';

const ShowOrg = () => {
    const [organizationData, setOrganizationData] = useState(null);

    useEffect(() => {
        fetchOrganizationData();
    }, []);

    const fetchOrganizationData = async () => {
        const token = localStorage.getItem('access_token');
        const url = `${common.getApiUrl()}/dept/all`;

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = transformOrganizationData(response.data);
            setOrganizationData(data);
        } catch (error) {
            console.error('조직 데이터를 가져오는데 실패했습니다:', error);
            alert('조직 데이터를 가져올 수 없습니다.');
        }
    };

    const transformOrganizationData = (data) => {
        const deptMap = {};

        data.forEach(dept => {
            deptMap[dept.deptId] = {
                label: dept.deptNm,
                id: dept.deptId,
                children: []
            };
        });

        data.forEach(dept => {
            if (dept.upperDept && dept.upperDept !== 0) {
                if (deptMap[dept.upperDept]) {
                    deptMap[dept.upperDept].children.push(deptMap[dept.deptId]);
                }
            }
        });

        const roots = data.filter(dept => dept.upperDept === 0).map(dept => deptMap[dept.deptId]);

        return {
            label: '조직',
            children: roots
        };
    };

    const transformToTreeData = (dept) => {
        return {
            label: (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: '100%', height: '100%', textAlign: 'center' }}
                >
                    <Typography>{dept.label}</Typography>
                </Box>
            ),
            key: dept.id,
            children: (dept.children || []).map(child => transformToTreeData(child))
        };
    };

    return (
        <Box sx={{
            width: '100%',
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
                <Typography variant='h6'>조직관리</Typography>
            <Box sx={{
                backgroundColor: '#fff',
                borderRadius: '10px',
                p: 2,
                marginTop: 2
            }}>
                <Box sx={{ display: 'flex' }}>
                    <Box>
                        <Paper sx={{ p: 2 }}>
                            <div style={{ width: '100%', overflowX: 'auto' }}>
                                {organizationData && (
                                    <OrgTree
                                        data={organizationData}
                                        horizontal={false}
                                        collapsable={false}
                                        style={{
                                            width: 'auto',
                                            minHeight: '500px',
                                            backgroundColor: '#F5F5F5',
                                        }}
                                    />
                                )}
                            </div>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default validationAuth(ShowOrg);
