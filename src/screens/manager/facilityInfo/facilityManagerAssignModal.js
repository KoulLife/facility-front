import React, { useState, useEffect } from 'react';
import {
    Box, Button, Typography, TextField, Modal, Grid, IconButton, List, Dialog, DialogTitle, DialogContent,
    Select, FormControl, Radio, RadioGroup, Checkbox, FormControlLabel, FormGroup, FormLabel, InputLabel, MenuItem, ListItem, ListItemText,
    Accordion, Alert, AccordionSummary, AccordionDetails,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import * as common from '../../../commons/common';

//시설 담당 등록 모달
const FacilityManagerAssignModal = ({ open, onClose, facilityId }) => {

    const [error, setError] = useState('');

    const [deptList, setDeptList] = useState([]); //전체 부서 리스트
    const [topDeptList, setTopDeptList] = useState([]); //Tier1 Dept List

    const [checkers, setCheckers] = useState([]); // 점검자 목록
    const [managers, setManagers] = useState([]); // 관리자 목록

    const [facilityCheckers, setFacilityCheckers] = useState([]); //해당 시설 점검자list
    const [facilityComplaintManagers, setFacilityComplaintManagers] = useState([]); //해당 시설 민원 담당자list

    const [checkerAllocateOpen, setCheckerAllocateOpen] = useState(false); //점검자 할당 모달 
    const [complaintManagerAllocateOpen, setComplaintManagerAllocateOpen] = useState(false); //민원담당자 할당 모달
    const [complaintMngInputMode, setComplaintMngInputMode] = useState('select'); //민원담당자 추가 옵션(select/직접입력)
    const [managerName, setManagerName] = useState('');
    const [managerPhone, setManagerPhone] = useState('');
    const [managerEmail, setManagerEmail] = useState('');

    //하위 dept 필터링을 위해 선택 dept 저장
    const [selectedTopDept, setSelectedTopDept] = useState('')
    const [selectedMidDept, setSelectedMidDept] = useState('')
    const [selectedBotDept, setSelectedBotDept] = useState('');

    const [expandedChecker, setExpandedChecker] = useState(false); //점검자 정보 펼치기
    const [expandedManager, setExpandedManager] = useState(false); //민원담당자 정보 펼치기

    const [selectedChecker, setSelectedChecker] = useState(''); //선택된 점검자
    const [selectedComplaintManager, setSelectedComplaintManager] = useState(''); //선택된 관리자(민원담당자)
    const [selectedComplaintOption, setSelectedComplaintOption] = useState("phone"); //민원 수신 방식

    useEffect(() => {
        if (open && facilityId) {
            fetchCheckersData(facilityId);
            fetchComplaintManagersInfo(facilityId);
        }
    }, [open, facilityId]);

    //전체 조직 가져오기
    const fetchDeptData = async () => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/dept/all`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            const topDeptList = response.data.filter((dept) => dept.deptLevel === 1);
            const midDeptList = response.data.filter((dept) => dept.deptLevel === 2);
            const botDeptList = response.data.filter((dept) => dept.deptLevel === 3);
            setTopDeptList(topDeptList);
            setDeptList(response.data)
        } catch (error) {
            alert('조직 데이터를 가져올 수 없습니다.');
        }
    };

    // 선택 시설 점검자 리스트 불러오기
    const fetchCheckersData = async (facilityId) => {
        if (!facilityId) {
            console.error('No facilityId provided');
            return;
        }

        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/checker-list?facilityId=${facilityId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.data && response.status === 200) {
                setFacilityCheckers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch checkers:', error);
        }
    };

    // 선택 시설 민원 담당자 리스트 불러오기
    const fetchComplaintManagersInfo = async (facilityId) => {
        if (!facilityId) {
            console.error('No facilityId provided');
            return;
        }

        try {
            const response = await axios.get(`${common.getApiUrl()}/facility/complaint-manager/${facilityId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });
            if (response.data && response.status === 200) {
                setFacilityComplaintManagers(response.data);
            }
        } catch (error) {
            alert('민원 담당자를 불러오는 데 실패했습니다.');
        }
    };

    //점검자 상세보기
    const handleExpandChecker = (panel) => {
        setExpandedChecker((prevExpanded) =>
            prevExpanded === panel ? false : panel
        );
    };

    //민원 담당자 상세보기
    const handleExpandManager = (panel) => {
        setExpandedManager((prevExpanded) =>
            prevExpanded === panel ? false : panel
        );
    };

    //점검자 할당 모달 open
    const handleOpenAddCheckerModal = () => {
        setCheckerAllocateOpen(true);
        fetchDeptData();
    };

    //점검자 할당 모달 close
    const handleCloseAddCheckerModal = () => {
        setCheckerAllocateOpen(false);
        setSelectedTopDept('');
        setSelectedMidDept('');
        setSelectedBotDept('');
        setSelectedChecker('');
        setError('');
        setCheckers([])
    };

    //점검자 할당 관리부서 change event (하위 부서 필터링)
    const handleDepartmentChangeOnChecker = (event, deptLevel) => {
        const selectedDeptId = event.target.value;
        if (deptLevel == 1) {
            setSelectedTopDept(selectedDeptId);
            setSelectedMidDept('');
            setSelectedBotDept('');
            setSelectedChecker('');
        }
        else if (deptLevel == 2) {
            setSelectedMidDept(selectedDeptId);
            setSelectedBotDept('');
            setSelectedChecker('');
        }
        else if (deptLevel == 3) {
            setSelectedBotDept(selectedDeptId);
            setSelectedChecker('');
            fetchCheckerData(selectedDeptId);
        }
        setCheckers([])
    };

    // 점검자 리스트 (선택한 Tier3 부서의 점검자들만 가져옴)
    const fetchCheckerData = async (botDeptId) => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await axios.get(`${common.getApiUrl()}/member?role=CHECKER&botDeptId=${botDeptId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200 && response.data) {
                setCheckers(response.data.content);
            }
        } catch (error) {
            alert('점검자 데이터를 가져오는데 실패했습니다.');
        }
    }

    //점검자 할당 모달 - 점검자 선택
    const handleCheckerChange = (event) => setSelectedChecker(event.target.value);

    // 점검자 할당 모달 - 할당하기 클릭 
    const handleAddChecker = async () => {
        if (!selectedChecker || !facilityId) {
            setError('점검자를 선택해주세요.');
            return;
        }

        const params = {
            facilityId: parseInt(facilityId, 10),
            checkerId: selectedChecker,
        };

        try {
            const response = await axios.post(`${common.getApiUrl()}/facility/checker-list`, params, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            if (response.status === 200) {

                const checkerDetails = checkers.find((checker) => checker.memberId === selectedChecker);
                if (checkerDetails) {
                    const newCheckerInfo = {
                        checkerId: checkerDetails.memberId,
                        checkerNm: checkerDetails.memberNm,
                    };
                    setFacilityCheckers([...facilityCheckers, newCheckerInfo]);
                }
                handleCloseAddCheckerModal();
                fetchCheckersData(facilityId)
            }
            else {
                alert('점검자 추가에 실패했습니다.');
            }
        } catch (error) {
            if (error.response.data.errorCode === 'DUPLICATE_REQUEST') {
                setError('이미 등록된 점검자입니다.');
                return;
            }
        }

        handleCloseAddCheckerModal()
    };

    // 점검자 삭제
    const handleDeleteChecker = async (facilityToCheckerId, event) => {
        event.stopPropagation();

        if (window.confirm('이 점검자를 정말 삭제하시겠습니까?')) {
            try {
                const response = await axios.delete(`${common.getApiUrl()}/facility/checker-list/${facilityToCheckerId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                if (response.status === 200) {
                    alert('점검자가 삭제되었습니다.');
                    const updatedCheckersInfo = facilityCheckers.filter((checker) => checker.facilityToCheckerId !== facilityToCheckerId);
                    setFacilityCheckers(updatedCheckersInfo);
                } else {
                    alert('점검자 삭제에 실패했습니다.');
                }
            } catch (error) {
                alert('점검자 삭제에 실패했습니다.');
            }
        }
    };

    // 민원담당자 추가 모달 open
    const handleOpenAddComplaintManagerModal = async () => {
        setComplaintManagerAllocateOpen(true);
        fetchDeptData();
    };

    // 민원담당자 추가 모달 close
    const handleCloseAddComplaintManagerModal = () => {
        setComplaintManagerAllocateOpen(false);
        setSelectedTopDept('');
        setSelectedComplaintManager('');
        setManagerName('')
        setManagerPhone('')
        setManagerEmail('')
        setComplaintMngInputMode('select')
        setManagers([])
        setError('')
        fetchComplaintManagersInfo(facilityId)
        setSelectedComplaintOption('phone')
    };

    useEffect(() => {
        setSelectedTopDept('');
        setSelectedComplaintManager('');
        setManagerName('')
        setManagerPhone('')
        setManagerEmail('')
        setManagers([])
        setError('')
        fetchComplaintManagersInfo(facilityId)
        setSelectedComplaintOption('phone')
    }, [complaintMngInputMode])

    //민원담당자 추가 모달 - 관리부서 선택
    const handleDepartmentChangeOnComplaint = (event) => {
        setSelectedTopDept(event.target.value)
        fetchManagerData(event.target.value);
    };

    // 관리자 리스트 (선택한 관리부서의 관리자들만 가져옴)
    const fetchManagerData = async (deptId) => {
        const token = localStorage.getItem('access_token');
        try {
            let url = `${common.getApiUrl()}/member/manager-list?role=MANAGE`;
            if (deptId) {
                url += `&deptId=${deptId}`;
            }
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200 && response.data) {
                setManagers(response.data);
            }
        } catch (error) {
            alert('관리자 데이터를 가져오는데 실패했습니다.');
        }
    };

    //민원담당자 추가 모달 - 관리자 선택
    const handleManagerChange = (event) => setSelectedComplaintManager(event.target.value);

    //민원담당자 추가 모달 - 수신 방식 선택
    const handleCheckboxChange = (event) => {
        setManagerPhone('')
        setManagerEmail('')
        setSelectedComplaintOption(event.target.name);
    }

    //민원담당자 추가 모달 - 직접 입력 - phone/email 값
    const handleManagerInfoChange = (event) => {
        const { name, value } = event.target;
        if (name === 'phone') {
            setManagerPhone(value.replace(/\D/g, ''));
        } else if (name === 'email') {
            setManagerEmail(value.trim());
        }
    };

    //이메일 정규식 체크
    function validateEmail() {
        if (!(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(managerEmail))) {
            setError('유효하지 않은 이메일 주소입니다.');
            return false;
        }
    }

    // 민원담당자 추가 모달 - 추가하기 클릭
    const handleAddComplaintManager = async () => {
        const params = {};

        if (complaintMngInputMode === 'input') {
            if (!managerName || (!managerPhone && !managerEmail) || (managerPhone && managerEmail)) {
                setError('이름과 전화번호 또는 이메일 중 하나를 입력해주세요.');
                return;
            }
            if (selectedComplaintOption === 'email') {
                const validate = validateEmail()
                if (validate === false) {
                    setError('유효한 이메일 형식이 아닙니다.')
                    return;
                }
            }
            params.facilityId = parseInt(facilityId, 10);
            params.complaintManagerNm = managerName;
            params.notificationMethod = selectedComplaintOption;
            if (selectedComplaintOption === 'phone') {
                params.complaintManagerPhone = managerPhone;
            } else if (selectedComplaintOption === 'email') {
                params.complaintManagerEmail = managerEmail;
            }
        } else if (complaintMngInputMode === 'select') {
            if (!selectedComplaintManager || !facilityId) {
                setError('관리자를 선택해주세요.');
                return;
            }
            const managerDetails = managers.find((manager) => manager.memberId === selectedComplaintManager);
            if (!managerDetails) {
                setError('선택한 담당자의 상세 정보를 찾을 수 없습니다.');
                return;
            }
            params.facilityId = parseInt(facilityId, 10);
            params.managerId = managerDetails.memberId;
            params.complaintManagerNm = managerDetails.memberNm;
            params.notificationMethod = selectedComplaintOption;
        }

        try {
            const response = await axios.post(`${common.getApiUrl()}/facility/complaint-manager/${facilityId}`, params, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
            });

            if (response.status === 200) {
                handleCloseAddComplaintManagerModal();
            }
        } catch (error) {
            if (error.response.data.message) {
                setError(error.response.data.message)
            } else {
                alert('민원 담당자 추가에 실패했습니다.');
                handleCloseAddComplaintManagerModal();
            }
        }
    };

    // 민원 담당자 삭제
    const handleDeleteComplaintManager = async (managerId, event) => {
        event.stopPropagation();

        if (window.confirm('이 민원 담당자를 정말 삭제하시겠습니까?')) {
            try {
                const response = await axios.delete(`${common.getApiUrl()}/facility/complaint-manager/${facilityId}/${managerId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                });
                if (response.status === 200) {
                    const updatedManagersInfo = facilityComplaintManagers.filter((manager) => manager.complaintManagerId !== managerId);
                    setFacilityComplaintManagers(updatedManagersInfo);
                } else {
                    alert('민원 담당자 삭제에 실패했습니다.');
                }
            } catch (error) {
                alert('민원 담당자 삭제에 실패했습니다.');
            }
        }
    };

    // 모달 닫기
    const handleCloseAndReset = () => {
        setFacilityCheckers([]);
        setFacilityComplaintManagers([]);
        onClose();
    }

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 1000,
                    bgcolor: 'var(--main-white-color)',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                            담당자 등록
                        </Typography>
                        <IconButton onClick={handleCloseAndReset} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <Box
                        sx={{
                            bgcolor: '#fff',
                            p: 3,
                            borderRadius: 2,
                            height: '520px', // 고정 높이 설정
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexGrow: 1,
                                height: 'calc(100% - 40px)', // 버튼 높이 계산
                            }}
                        >
                            <Box
                                sx={{
                                    width: '45%',
                                    overflowY: 'auto',
                                    maxHeight: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    점검자
                                </Typography>
                                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {facilityCheckers.length > 0 ? (
                                        facilityCheckers.map((checker, idx) => (
                                            <Accordion
                                                disableGutters
                                                key={idx}
                                                expanded={expandedChecker === `checker-${checker.facilityToCheckerId}`}
                                                onChange={() => handleExpandChecker(`checker-${checker.facilityToCheckerId}`)}
                                                sx={{
                                                    border: '1px solid #e0e0e0',
                                                    boxShadow: 'none',
                                                    marginBottom: '10px',
                                                    '&:before': {
                                                        display: 'none',
                                                    }
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', }}
                                                >
                                                    <Box
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteChecker(checker.facilityToCheckerId, event);
                                                        }}
                                                        sx={{
                                                            backgroundColor: '#BABABA',
                                                            fontSize: '0.8rem',
                                                            color: '#fff',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            marginRight: '12px',
                                                            cursor: 'pointer',
                                                            '&:hover': { backgroundColor: '#929292' },
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '40px',
                                                            height: '24px',
                                                        }}
                                                    >
                                                        삭제
                                                    </Box>
                                                    <Typography sx={{ color: '#ccc', flexGrow: 1 }}>{checker.checkerNm}</Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <List dense>
                                                                <ListItem>
                                                                    <ListItemText primary="이름" secondary={checker.checkerNm || ''} />
                                                                </ListItem>
                                                                <ListItem>
                                                                    <ListItemText primary="휴대폰 번호" secondary={checker.phone || ''} />
                                                                </ListItem>
                                                                <ListItem>
                                                                    <ListItemText primary="이메일" secondary={checker.email || '-'} />
                                                                </ListItem>
                                                            </List>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <List dense>
                                                                <ListItem>
                                                                    <ListItemText primary="팀" secondary={checker.lastDeptNm || '-'} />
                                                                </ListItem>
                                                                <ListItem>
                                                                    <ListItemText primary="직위" secondary={checker.position || ''} />
                                                                </ListItem>
                                                            </List>
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        <Typography>점검자 정보가 없습니다.</Typography>
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        boxShadow: 'none',
                                        backgroundColor: '#1E88E5',
                                        '&:hover': { backgroundColor: '#1A4080' },
                                        padding: '2px 4px',
                                        minWidth: '60px',
                                        fontSize: '1.2rem',
                                        mt: 2,
                                    }}
                                    onClick={handleOpenAddCheckerModal}
                                >
                                    점검자 추가
                                </Button>
                            </Box>
                            <Box
                                sx={{
                                    width: '45%',
                                    overflowY: 'auto',
                                    maxHeight: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
                                    민원 담당자
                                </Typography>
                                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                    {facilityComplaintManagers.length > 0 ? (
                                        facilityComplaintManagers.map((manager, index) => (
                                            <Accordion
                                                disableGutters
                                                key={index}
                                                expanded={expandedManager === `manager-${index}`}
                                                onChange={() => handleExpandManager(`manager-${index}`)}
                                                sx={{
                                                    border: '1px solid #e0e0e0',
                                                    boxShadow: 'none',
                                                    marginBottom: '10px',
                                                    '&:before': {
                                                        display: 'none',
                                                    }
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon />}
                                                    sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', }}
                                                >
                                                    <Box
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleDeleteComplaintManager(manager.complaintManagerId, event);
                                                        }}
                                                        sx={{
                                                            backgroundColor: '#BABABA',
                                                            fontSize: '0.8rem',
                                                            color: '#fff',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            marginRight: '12px',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                backgroundColor: '#929292',
                                                            },
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            minWidth: '40px',
                                                            height: '24px',
                                                        }}
                                                    >
                                                        삭제
                                                    </Box>
                                                    <Typography sx={{ color: '#ccc', flexGrow: 1 }}>
                                                        {manager.complaintManagerNm || ''}
                                                    </Typography>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <List dense>
                                                                <ListItem>
                                                                    <ListItemText primary="이름" secondary={manager.complaintManagerNm || ''} />
                                                                </ListItem>
                                                                <ListItem>
                                                                    {manager.complaintManagerPhone ? (
                                                                        <ListItemText primary="휴대폰 번호" secondary={manager.complaintManagerPhone || ''} />
                                                                    ) : (
                                                                        <ListItemText primary="이메일" secondary={manager.complaintManagerEmail || '-'} />

                                                                    )}
                                                                </ListItem>
                                                            </List>
                                                        </Grid>
                                                    </Grid>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))
                                    ) : (
                                        <Typography>민원 담당자 정보가 없습니다.</Typography>
                                    )}
                                </Box>
                                <Button
                                    variant="contained"
                                    sx={{
                                        boxShadow: 'none',
                                        backgroundColor: '#1E88E5',
                                        '&:hover': { backgroundColor: '#1A4080' },
                                        padding: '2px 4px',
                                        minWidth: '60px',
                                        fontSize: '1.2rem',
                                        mt: 2,
                                    }}
                                    onClick={handleOpenAddComplaintManagerModal}
                                >
                                    민원 담당자 추가
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Modal>
            {/* 점검자 추가 모달 */}
            <Dialog open={checkerAllocateOpen} onClose={handleCloseAddCheckerModal} fullWidth sx={{ minHeight: '650px' }}>
                <DialogTitle>점검자 추가</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>관리본부 선택</InputLabel>
                        <Select label="관리본부 선택" value={selectedTopDept || ''} onChange={(event) => handleDepartmentChangeOnChecker(event, 1)}>
                            {deptList.filter(dept => dept.deptLevel === 1).length > 0 ? (
                                deptList.filter(dept => dept.deptLevel === 1).map((item) => (
                                    <MenuItem key={item.deptId} value={item.deptId}>
                                        {item.deptNm}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>조직이 없습니다.</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>관리부서 선택</InputLabel>
                        <Select label="관리부서 선택" value={selectedMidDept || ''} onChange={(event) => handleDepartmentChangeOnChecker(event, 2)} disabled={!selectedTopDept}>
                            {deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === selectedTopDept).length > 0 ? (
                                deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === selectedTopDept).map((item) => (
                                    <MenuItem key={item.deptId} value={item.deptId}>
                                        {item.deptNm}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>조직이 없습니다.</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>팀 선택</InputLabel>
                        <Select label="팀 선택" value={selectedBotDept || ''} onChange={(event) => handleDepartmentChangeOnChecker(event, 3)} disabled={!selectedMidDept}>
                            {deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === selectedMidDept).length > 0 ? (
                                deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === selectedMidDept).map((item) => (
                                    <MenuItem key={item.deptId} value={item.deptId}>
                                        {item.deptNm}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>조직이 없습니다.</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>점검자 선택</InputLabel>
                        <Select label="점검자 선택" value={selectedChecker} onChange={(event) => handleCheckerChange(event)} disabled={!selectedBotDept}>
                            {checkers.filter(dept => dept.lastDeptLevel === 3).length > 0 ? (
                                checkers.filter(dept => dept.lastDeptLevel === 3).map((checker) => (
                                    <MenuItem key={checker.memberId} value={checker.memberId}>
                                        {checker.memberNm}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>점검자가 없습니다</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box textAlign="center" marginTop={2}>
                        <Button variant="contained" onClick={handleAddChecker}>
                            할당하기
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
            {/* 민원 담당자 추가 모달 */}
            <Dialog open={complaintManagerAllocateOpen} onClose={handleCloseAddComplaintManagerModal} fullWidth>
                <DialogTitle>민원 담당자 추가</DialogTitle>
                <DialogContent>
                    {/* Mode Selector */}
                    <FormControl component="fieldset" margin="normal">
                        <RadioGroup
                            row
                            value={complaintMngInputMode}
                            onChange={(e) => setComplaintMngInputMode(e.target.value)}
                        >
                            <FormControlLabel value="select" control={<Radio />} label="관리자 선택" />
                            <FormControlLabel value="input" control={<Radio />} label="직접 입력" />
                        </RadioGroup>
                    </FormControl>
                    {complaintMngInputMode === 'select' ? (
                        <>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>관리본부 선택</InputLabel>
                                <Select label="관리본부 선택" value={selectedTopDept} onChange={(event) => handleDepartmentChangeOnComplaint(event)}>
                                    {topDeptList.map((dept) => (
                                        <MenuItem key={dept.deptId} value={dept.deptId}>
                                            {dept.deptNm}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>관리자 선택</InputLabel>
                                <Select
                                    label="관리자 선택"
                                    value={selectedComplaintManager}
                                    onChange={(event) => handleManagerChange(event)}
                                >
                                    {managers.length > 0 ? (
                                        managers.map((manager) => (
                                            <MenuItem key={manager.memberId} value={manager.memberId}>
                                                {manager.memberNm}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem disabled>관리본부를 선택해주세요</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <FormLabel focused='false'>민원알림 수신 선택</FormLabel>
                                <FormGroup row='true'>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedComplaintOption === "phone"}
                                                onChange={handleCheckboxChange}
                                                name="phone"
                                            />
                                        }
                                        label="알림톡/SMS"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedComplaintOption === "email"}
                                                onChange={handleCheckboxChange}
                                                name="email"
                                            />
                                        }
                                        label="이메일"
                                    />
                                </FormGroup>
                            </FormControl>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </>
                    ) : (
                        <>
                            <FormControl fullWidth margin="normal">
                                <TextField
                                    label="담당자 이름"
                                    value={managerName}
                                    autoComplete="off"
                                    onChange={(e) => setManagerName(e.target.value)}
                                />
                            </FormControl>
                            <FormControl fullWidth margin="0">
                                <FormLabel focused='false'>민원알림 수신 선택</FormLabel>
                                <FormGroup row='true'>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedComplaintOption === "phone"}
                                                onChange={handleCheckboxChange}
                                                name="phone"
                                            />
                                        }
                                        label="알림톡/SMS"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={selectedComplaintOption === "email"}
                                                onChange={handleCheckboxChange}
                                                name="email"
                                            />
                                        }
                                        label="이메일"
                                    />
                                </FormGroup>
                            </FormControl>
                            <FormControl fullWidth margin="0">
                                <TextField
                                    label={selectedComplaintOption === 'phone' ? "전화번호" : '이메일'}
                                    name={selectedComplaintOption}
                                    value={selectedComplaintOption === 'phone' ? managerPhone : managerEmail}
                                    onChange={handleManagerInfoChange}
                                    autoComplete="off"
                                />
                            </FormControl>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </>
                    )}
                    <Box textAlign="center" marginTop={2}>
                        <Button variant="contained" onClick={handleAddComplaintManager}>
                            추가하기
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default FacilityManagerAssignModal;
