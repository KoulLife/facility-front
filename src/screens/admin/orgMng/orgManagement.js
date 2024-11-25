import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    useTheme,
    useMediaQuery
} from '@mui/material';
import OrgTree from 'react-org-tree';
import axios from 'axios';
import * as common from '../../../commons/common';

const OrgManagement = () => {
    const [showGeneralDepartmentSelect, setShowGeneralDepartmentSelect] = useState(false);
    const [showManagementDepartmentSelect, setShowManagementDepartmentSelect] = useState(false);
    const [showNewDepartmentInput, setShowNewDepartmentInput] = useState(false);
    const [selectedTeamDepartment, setSelectedTeamDepartment] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [departmentType, setDepartmentType] = useState('');
    const [selectedGeneralDepartment, setSelectedGeneralDepartment] = useState('');
    const [selectedManagementDepartment, setSelectedManagementDepartment] = useState('');
    const [organizationData, setOrganizationData] = useState(null);
    const [generalDepartments, setGeneralDepartments] = useState([]);
    const [managementDepartments, setManagementDepartments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editDepartmentId, setEditDepartmentId] = useState(null);
    const [editDepartmentName, setEditDepartmentName] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetchOrganizationData();
    }, []);

    useEffect(() => {
        if (departmentType === 'Tier2' || departmentType === 'Tier3') {
            fetchDepartments('TOTAL', 0);
        }
    }, [departmentType]);

    useEffect(() => {
        if (selectedGeneralDepartment && (departmentType === 'Tier2' || departmentType === 'Tier3')) {
            fetchDepartments('MANAGE', selectedGeneralDepartment);
        }
        if (selectedManagementDepartment && departmentType === 'Tier3') {
            fetchDepartments('TEAM', selectedManagementDepartment);
        }
    }, [selectedGeneralDepartment, selectedManagementDepartment, departmentType]);

    const fetchDepartments = async (deptType, upperDeptId = 0) => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/dept`, {
                params: { upperDeptId, deptType },
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            if (Array.isArray(response.data)) {
                if (deptType === 'TOTAL') {
                    setGeneralDepartments(response.data);
                } else if (deptType === 'MANAGE') {
                    setManagementDepartments(response.data);
                }
            } else {
                console.error(`Expected an array but got:`, response.data);
            }
        } catch (error) {
            console.error(`Error fetching ${deptType} departments:`, error);
            alert('Failed to fetch department data.');
        }
    };

    // 조직 데이터 가져오기
    const fetchOrganizationData = async () => {
        const token = localStorage.getItem('access_token');
        const url = `${common.getApiUrl()}/dept/all`;

        try {
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setOrganizationData(transformOrganizationData(response.data));
        } catch (error) {
            console.error('조직 데이터를 가져오는데 실패했습니다:', error);
            alert('조직 데이터를 가져올 수 없습니다.');
        }
    };

    // 조직 데이터 변환 (트리 구조로)
    const transformOrganizationData = (data) => {
        const deptMap = {};
        data.forEach(dept => {
            deptMap[dept.deptId] = { ...dept, children: [] };
            if (dept.upperDept) {
                const parent = deptMap[dept.upperDept];
                if (parent) {
                    parent.children.push(deptMap[dept.deptId]);
                }
            }
        });

        const roots = data.filter(dept => !dept.upperDept).map(dept => deptMap[dept.deptId]);
        return {
            label: '조직',
            children: roots.map(dept => transformToTreeData(dept, deptMap))
        };
    };

    const transformToTreeData = (dept, deptMap) => {
        return {
            label: (
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    style={{ width: '100%', height: '100%', textAlign: 'center' }}
                >
                    <Typography
                        onClick={() => handleEditDepartment(dept.deptId, dept.deptNm)}
                        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                    >
                        {dept.deptNm}
                    </Typography>
                </Box>
            ),
            children: (dept.children || []).map(child => transformToTreeData(child, deptMap))
        };
    };

    const handleNewDepartmentChange = (event) => {
        setNewDepartment(event.target.value);
    };

    const handleGeneralDepartmentChange = (event) => {
        const generalDeptId = event.target.value;
        setSelectedGeneralDepartment(generalDeptId);
        setSelectedManagementDepartment('');
        fetchDepartments('MANAGE', generalDeptId);
    };

    const handleManagementDepartmentChange = (event) => {
        const managementDeptId = event.target.value;
        setSelectedManagementDepartment(managementDeptId);
        if (departmentType === 'Tier3') {
            fetchDepartments('TEAM', managementDeptId);
        }
    };

    const handleDepartmentTypeChange = (event) => {
        const type = event.target.value;
        setDepartmentType(type);
        setSelectedGeneralDepartment('');
        setSelectedManagementDepartment('');
        setSelectedTeamDepartment('');
        setNewDepartment('');
        setShowGeneralDepartmentSelect(type === 'Tier2' || type === 'Tier3');
        setShowManagementDepartmentSelect(type === 'Tier3');
        setShowNewDepartmentInput(type !== '');
    };

    // 새 부서 추가
    const handleAddDepartment = async () => {
        if (!newDepartment.trim()) {
            alert('부서명을 입력해주세요.');
            return;
        }

        let upperDeptId = null;
        switch (departmentType) {
            case 'Tier2':
                upperDeptId = selectedGeneralDepartment;
                break;
            case 'Tier3':
                upperDeptId = selectedManagementDepartment;
                break;
        }

        const departmentData = {
            deptNm: newDepartment,
            upperDept: upperDeptId,
            deptType: departmentType === 'Tier1' ? 'TOTAL' :
                departmentType === 'Tier2' ? 'MANAGE' :
                    departmentType === 'Tier3' ? 'TEAM' : null
        };

        try {
            const response = await axios.post(`${common.getApiUrl()}/dept`, departmentData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 200) {
                alert('부서가 성공적으로 추가되었습니다.');
                resetForm();
                await fetchOrganizationData();
            } else {
                alert('부서를 추가하지 못했습니다. 오류를 확인해주세요.');
            }
        } catch (error) {
            console.error('Error adding department:', error);
            alert('부서를 추가하는 데 실패했습니다.');
        }
    };

    const resetForm = () => {
        setNewDepartment('');
        setDepartmentType('');
        setSelectedGeneralDepartment('');
        setSelectedManagementDepartment('');
        setShowGeneralDepartmentSelect(false);
        setShowManagementDepartmentSelect(false);
        setShowNewDepartmentInput(false);
    };

    const handleEditDepartment = (deptId, deptNm) => {
        setEditMode(true);
        setEditDepartmentId(deptId);
        setEditDepartmentName(deptNm);
    };

    // 부서 수정
    const handleUpdateDepartment = async () => {
        if (!editDepartmentName.trim()) {
            alert('부서명을 입력해주세요.');
            return;
        }

        try {
            const response = await axios.put(
                `${common.getApiUrl()}/dept/${editDepartmentId}`,
                {
                    deptId: editDepartmentId,
                    deptNm: editDepartmentName,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.status === 200) {
                alert('부서가 성공적으로 수정되었습니다.');
                setEditMode(false);
                await fetchOrganizationData();
            } else {
                alert('부서를 수정하지 못했습니다. 오류를 확인해주세요.');
            }
        } catch (error) {
            console.error('Error updating department:', error);
            alert('부서를 수정하는 데 실패했습니다.');
        }
    };

    // 부서 삭제
    const handleDeleteDepartment = async () => {
        if (!window.confirm('정말로 이 부서를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await axios.delete(
                `${common.getApiUrl()}/dept/${editDepartmentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                    },
                }
            );

            if (response.status === 200) {
                alert('부서가 성공적으로 삭제되었습니다.');
                setEditMode(false);
                await fetchOrganizationData();
            } else {
                alert('부서를 삭제하지 못했습니다. 오류를 확인해주세요.');
            }
        } catch (error) {
            console.error('Error deleting department:', error);
            alert('부서를 삭제하는 데 실패했습니다.');
        }
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>조직관리</Typography>
            <Box sx={{ backgroundColor: '#fff', marginTop: '10px', p: 2 }}>
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Paper sx={{ p: 2, border: 'none', boxShadow: 'none' }}>
                            <div style={{ width: '100%', overflowX: 'auto', }}>
                                {organizationData && (
                                    <OrgTree
                                        data={organizationData}
                                        horizontal={false}
                                        collapsable={false}
                                        expandAll={!isMobile}
                                        nodeWidth={isMobile ? 140 : 180}
                                        nodeHeight={isMobile ? 100 : 140}
                                    />
                                )}
                            </div>
                        </Paper>
                    </Box>
                </Box>
            </Box>
            <Box sx={{ width: '350px', bgcolor: '', marginTop: '20px' }}>
                <Typography variant="subtitle1" gutterBottom>{editMode ? '부서 수정' : '부서 등록'}</Typography>
                {!editMode && (
                    <>
                        <FormControl variant="outlined" fullWidth margin="normal">
                            <InputLabel>등록할 부서 Tier를 선택해주세요.</InputLabel>
                            <Select
                                value={departmentType}
                                onChange={handleDepartmentTypeChange}
                                label="등록할 부서 Tier를 선택해주세요."
                            >
                                <MenuItem value="Tier1">Tier1</MenuItem>
                                <MenuItem value="Tier2">Tier2</MenuItem>
                                <MenuItem value="Tier3">Tier3</MenuItem>
                            </Select>
                        </FormControl>
                        {showGeneralDepartmentSelect && (
                            <FormControl variant="outlined" fullWidth margin="normal">
                                <InputLabel>Tier1 선택</InputLabel>
                                <Select
                                    value={selectedGeneralDepartment}
                                    onChange={handleGeneralDepartmentChange}
                                    label="Tier1 선택"
                                >
                                    {generalDepartments.map((dept) => (
                                        <MenuItem key={dept.deptId}
                                            value={dept.deptId}>{dept.deptNm}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {showManagementDepartmentSelect && (
                            <FormControl variant="outlined" fullWidth margin="normal">
                                <InputLabel>Tier2 선택</InputLabel>
                                <Select
                                    value={selectedManagementDepartment}
                                    onChange={handleManagementDepartmentChange}
                                    label="Tier2 선택"
                                >
                                    {managementDepartments.map((dept) => (
                                        <MenuItem key={dept.deptId}
                                            value={dept.deptId}>{dept.deptNm}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        {showNewDepartmentInput && (
                            <TextField
                                label="신규 부서명"
                                variant="outlined"
                                fullWidth
                                autoComplete="off"
                                value={newDepartment || ''}
                                onChange={handleNewDepartmentChange}
                                margin="normal"
                            />
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddDepartment}
                            disabled={!newDepartment.trim()}
                            sx={{ mt: 2 }}
                            fullWidth
                        >
                            부서 등록
                        </Button>
                    </>
                )}
                {editMode && (
                    <>
                        <TextField
                            label="부서명 수정"
                            variant="outlined"
                            fullWidth
                            autoComplete="off"
                            value={editDepartmentName || ''}
                            onChange={(e) => setEditDepartmentName(e.target.value)}
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateDepartment}
                            disabled={!editDepartmentName.trim()}
                            sx={{ mt: 2 }}
                            fullWidth
                        >
                            저장
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeleteDepartment}
                            sx={{ mt: 1 }}
                            fullWidth
                        >
                            삭제
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => setEditMode(false)}
                            sx={{ mt: 1 }}
                            fullWidth
                        >
                            취소
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default validationAuth(OrgManagement);