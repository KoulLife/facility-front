import React, { useState, useEffect } from 'react';
import validationAuth from '../../../validationAuth';
import {
    Box, Typography, Select, InputLabel, MenuItem, FormControl,
    Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle, Divider,
    IconButton, Pagination, Stepper, Step, StepLabel, StepContent, Alert, FormHelperText
} from '@mui/material';
import Input from '@mui/material/Input';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as common from "../../../commons/common";
import SearchArea from '../../../components/managerPage/searchArea';
import AlertForConfirm from '../../../components/alertForConfirm';

const MemberManagement = () => {
    const [memberList, setMemberList] = useState({}); //전체 사용자 리스트
    const [roleList, setRoleList] = useState([]); // 전체 권한 리스트
    const [deptList, setDeptList] = useState([]); //전체 부서 리스트
    const [positionList, setPositionList] = useState([]); // 전체 직위 리스트
    //사용자 조직 책임자인지 여부
    const orgPosition = [{ position: '0', positionNm: '일반' }, { position: '1', positionNm: '관리본부(Tier1) 책임자' }, { position: '2', positionNm: '관리부서(Tier2) 책임자' }, { position: '3', positionNm: '팀(Tier3) 책임자' },];

    const [selectedMemberId, setSelectedMemberId] = useState(null); // 사용자 선택 조회
    const [detailMemberInfo, setDetailMemberInfo] = useState({
        memberId: '',
        memberNm: '',
        topDeptId: '',
        topDeptNm: '',
        midDeptId: '',
        midDeptNm: '',
        botDeptId: '',
        botDeptNm: '',
        lastDeptLevel: '',
        lastDeptId: '',
        role: '',
        roleNm: '',
        orgPosition: '', // 부서 책임자
        phone: '',
        email: '',
        position: '',
        imgSrc: '',
    }); //사용자 상세정보

    const [registerOpen, setRegisterOpen] = useState(false); // 신규 사용자 정보등록 모달 open
    const [detailOpen, setDetailOpen] = useState(false); // 상세정보 모달 open

    const [activeStep, setActiveStep] = useState(0); //신규 사용자 정보등록 모달 form step
    const [isPwInitAlertOpen, setIsPwInitAlertOpen] = useState(false); //비밀번호 초기화 alert
    const [isMemDelAlertOpen, setIsMemDelAlertOpen] = useState(false); //사용자 삭제 alert

    const [error, setError] = useState(''); //form 유효성 error

    const [searchRole, setSearchRole] = useState(''); // 검색 조건_역할(권한)
    const [searchName, setSearchName] = useState(''); // 검색 조건_사용자명
    const [isSave, setIsSave] = useState(false)
    const [isSearch, setIsSearch] = useState(false)
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [searchParams, setSearchParams] = useState({
        role: '',
        deptId: '',
        memberNm: '',
        teamId: '',
        pageSize: '',
        pageNumber: '',
    });

    const token = localStorage.getItem('access_token');
    const positionComMstrId = 'CM1';

    useEffect(() => { //role 리스트 불러오기
        const fetchRoleData = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/common/role`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.data) {
                    const fetchedItems = response.data.map((role) => ({
                        value: role.code,
                        label: role.title,
                    }));
                    fetchedItems.unshift({ value: ' ', label: '전체' });
                    setRoleList(fetchedItems)
                }
            } catch (error) {
                console.error("데이터를 가져오는 데 실패했습니다:", error);
            }
        }
        fetchRoleData();
    }, [])

    useEffect(() => { //전체부서 리스트 불러오기. 이후 depthLevel로 구분
        const fetchDeptData = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/admin/dept`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                if (response.data) {
                    const fetchedList = response.data.map(dept => ({
                        ...dept,
                        deptId: String(dept.deptId),
                    }));

                    setDeptList(fetchedList);
                }

            } catch (error) {
                console.error("데이터를 가져오는 데 실패했습니다:", error);
            }
        }
        fetchDeptData();
    }, [])

    useEffect(() => { //직위 리스트 불러오기
        const fetchPositionData = async () => {
            try {
                const response = await axios.get(`${common.getApiUrl()}/admin/com-dtl`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    params: {
                        comMstrId: positionComMstrId,
                    },
                });

                if (response.data) {
                    const item = response.data
                    item.unshift({ comDtlId: '0', comDtlNm: '없음' });
                    setPositionList(item)
                }
            } catch (error) {
                console.error("데이터를 가져오는 데 실패했습니다:", error);
            }
        }
        fetchPositionData();
    }, [])

    useEffect(() => {
        fetchData();
    }, [isSave, isSearch, page, rowsPerPage]);

    //사용자 리스트 불러오기
    const fetchData = async () => {
        try {
            const params = {
                role: searchParams.role,
                deptId: searchParams.deptId,
                memberNm: searchParams.memberNm,
                teamId: searchParams.teamId,
                page: page,
                pageSize: rowsPerPage,
            };

            const response = await axios.get(`${common.getApiUrl()}/admin/member`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params,
            });

            if (response.data && Array.isArray(response.data.content)) {
                let fetchedMembers = response.data.content.map((item) => ({
                    roleNm: item.roleNm || '',
                    memberId: item.memberId || '',
                    memberNm: item.memberNm || '',
                    email: item.email || '',
                    phone: item.phone || '',
                    deptNm: item.deptNm || '',
                }));

                setTotalElements(response.data.totalElements); //총 데이터 갯수

                // 초기가입자 맨 위로 보여주기
                const initialMembers = fetchedMembers.filter(member => member.roleNm === '초기사용자');
                if (initialMembers.length > 0) {
                    initialMembers.forEach(initialMember => {
                        fetchedMembers = fetchedMembers.filter(member => member.memberId !== initialMember.memberId);
                        fetchedMembers.unshift(initialMember);
                    });
                }

                setMemberList(fetchedMembers);
                setIsSave(false);
                setIsSearch(false);
            }
        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    };

    const handleSearchChanges = (name, value) => {
        if (name === 'role') {
            setSearchRole(value.trim());
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value.trim(),
            }));
        } else if (name === 'memberNm') {
            setSearchName(value);
            setSearchParams(prevState => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        const newSize = Number(event.target.value, 10);
        setRowsPerPage(newSize);
        setPage(1);
    };

    useEffect(() => { //사용자 디테일 정보 불러오기
        if (detailOpen | registerOpen) getMemberDetailInfo(selectedMemberId)
    }, [detailOpen, registerOpen])

    const getMemberDetailInfo = async (selectedMemberId) => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/admin/member/${selectedMemberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data) {
                const data = response.data;

                const modifyData = {
                    memberId: data.memberId,
                    memberNm: data.memberNm,
                    topDeptId: Array.isArray(data.dept) && data.dept[0] ? String(data.dept[0].deptId) : "",
                    topDeptNm: Array.isArray(data.dept) && data.dept[0] ? data.dept[0].deptNm : "",
                    midDeptId: Array.isArray(data.dept) && data.dept[1] ? String(data.dept[1].deptId) : "",
                    midDeptNm: Array.isArray(data.dept) && data.dept[1] ? data.dept[1].deptNm : "",
                    botDeptId: Array.isArray(data.dept) && data.dept[2] ? String(data.dept[2].deptId) : "",
                    botDeptNm: Array.isArray(data.dept) && data.dept[2] ? data.dept[2].deptNm : "",
                    lastDeptLevel: data.lastDeptLevel || 3,
                    lastDeptId: Array.isArray(data.dept) && data.dept.length > 0 ? String(data.dept[data.dept.length - 1].deptId) : "",
                    role: data.role === 'INIT' ? '' : data.role,
                    roleNm: data.roleNm,
                    orgPosition: data.orgPosition ? String(data.orgPosition) : "0",
                    phone: data.phone,
                    email: data.email,
                    position: data.position === null ? '' : data.position,
                    imgSrc: data.imgSrc || '',
                };
                setDetailMemberInfo(modifyData);
            }

        } catch (error) {
            console.error("상세 정보를 가져오는 데 실패했습니다:", error);
        }
    }

    const clickPWInit = () => {
        setIsPwInitAlertOpen(true);
    };

    const handlePwInitAlertClose = () => {
        setIsPwInitAlertOpen(false);
    };

    const pwInit = async () => {
        try {
            const response = await axios.put(`${common.getApiUrl()}/admin/password-init?memberId=${selectedMemberId}`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            if (response.data) {
                handlePwInitAlertClose();
            }
        } catch (error) {
            console.error("비밀번호 초기화에 실패했습니다:", error);
        }
    }

    //모달 close, state 초기화
    useEffect(() => {
        if (!detailOpen && !registerOpen) {
            setDetailMemberInfo({});
            setSelectedMemberId(null);
        }
    }, [detailOpen, registerOpen]);

    const saveMemberDetailInfo = async () => {

        const params = {
            memberId: detailMemberInfo.memberId,
            memberNm: detailMemberInfo.memberNm,
            phone: detailMemberInfo.phone,
            email: detailMemberInfo.email,
            lastDeptId: Number(detailMemberInfo.lastDeptId),
            lastDeptLevel: detailMemberInfo.lastDeptLevel ? Number(detailMemberInfo.lastDeptLevel) : 0,
            position: detailMemberInfo.position,
            role: detailMemberInfo.role,
            orgPosition: detailMemberInfo.lastDeptLevel ? Number(detailMemberInfo.lastDeptLevel) : 0,
        };

        try {
            await axios.put(`${common.getApiUrl()}/admin/member`, params, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setIsSave(true);
            setError('');
            handleDetailClose();
            handleRegisterClose();
        } catch (error) {
            if (error.response && error.response.data) {
                setError(error.response.data.message);
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    const handleSearch = () => {
        setIsSearch(true)
        setPage(1);
    };

    const handleRegisterOpen = (memberId) => {
        setSelectedMemberId(memberId);
        setRegisterOpen(true);
    };

    const handleRegisterClose = () => {
        setRegisterOpen(false);
        setActiveStep(0);
        setError('')
    };

    const handleNextStepRegiForm = () => {
        if (activeStep === 0) {
            if (!detailMemberInfo.memberNm) {
                setError('이름은 필수값입니다.')
                return;
            }
            else {
                setActiveStep(1);
                setError('')
            }
        }
        else {
            setActiveStep(0);
            setError('')
        }
    };

    const handleDetailOpen = (memberId) => {
        setSelectedMemberId(memberId);
        setDetailOpen(true);
    };

    const handleDetailClose = () => {
        setDetailOpen(false);
        setError('')
    };

    const handleDetailSave = () => {
        if (!detailMemberInfo.role) {
            setError('사용 권한은 필수값입니다.');
            return;
        }

        // 관리처 선택 검사
        if (detailMemberInfo.role !== 'ADMIN') {
            if (detailMemberInfo.lastDeptLevel === 1) {
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    midDetpId: '',
                    midDetpNm: '',
                    botDetpId: '',
                    botDetpNm: '',
                }));
                if (!detailMemberInfo.topDeptId) {
                    setError('관리본부를 선택해주세요.');
                    return;
                }
            } else if (detailMemberInfo.lastDeptLevel === 2) {
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    botDetpId: '',
                    botDetpNm: '',
                }));
                if (!detailMemberInfo.topDeptId) {
                    setError('관리본부를 선택해주세요.');
                    return;
                }
                if (!detailMemberInfo.midDeptId) {
                    setError('관리부서를 선택해주세요.');
                    return;
                }
            } else if (detailMemberInfo.lastDeptLevel === 0 || detailMemberInfo.lastDeptLevel === 3) {
                if (!detailMemberInfo.topDeptId) {
                    setError('관리본부를 선택해주세요.');
                    return;
                }
                if (!detailMemberInfo.midDeptId) {
                    setError('관리부서를 선택해주세요.');
                    return;
                }
                if (!detailMemberInfo.botDeptId) {
                    setError('팀을 선택해주세요.');
                    return;
                }
            }
        }
        saveMemberDetailInfo();
    };

    const handleMemberDelete = () => {
        setIsMemDelAlertOpen(true);
    };

    //사용자 삭제
    const deleteMember = async () => {
        try {
            const response = await axios.delete(`${common.getApiUrl()}/admin/member/${selectedMemberId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response) {
                setIsMemDelAlertOpen(false);
                setDetailOpen(false);
                setIsSave(true);
            }

        } catch (error) {
            console.error("사용자 삭제에 실패했습니다:", error);
        }
    }

    const handleMemDelAlertClose = () => setIsMemDelAlertOpen(false);

    const handleSelectedMemberInfoChange = (event) => {
        setError('')
        const { name, value } = event.target;
        switch (name) {
            case 'role':
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    role: value,
                    topDeptId: '',
                    topDeptNm: '',
                    midDeptId: '',
                    midDeptNm: '',
                    botDeptId: '',
                    botDeptNm: '',
                }));
                break;
            case 'orgPosition':
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    orgPosition: value,
                    topDeptId: '',
                    topDeptNm: '',
                    midDeptId: '',
                    midDeptNm: '',
                    botDeptId: '',
                    botDeptNm: '',
                    ...(value === '1' || value === '2' || value === '3' ? { lastDeptLevel: Number(value) } : {}),
                    ...(value === '0' ? { lastDeptLevel: 3 } : {})
                }));
                break;
            case 'topDeptId':
                const topDeptNm = deptList.find(item => item.deptId === value)?.deptNm;
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    topDeptId: value,
                    topDeptNm: topDeptNm,
                    midDeptId: '',
                    midDeptNm: '',
                    botDeptId: '',
                    botDeptNm: '',
                    lastDeptId: value,
                }));
                break;
            case 'midDeptId':
                const midDeptNm = deptList.find(item => item.deptId === value)?.deptNm;
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    midDeptId: value,
                    midDeptNm: midDeptNm,
                    botDeptId: '',
                    botDeptNm: '',
                    lastDeptId: value,
                }));
                break;
            case 'botDeptId':
                const botDeptNm = deptList.find(item => item.deptId === value)?.deptNm;
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    botDeptId: value,
                    botDeptNm: botDeptNm,
                    lastDeptId: value,
                }));
                break;
            case 'position':
                setDetailMemberInfo(prevState => ({
                    ...prevState,
                    position: value,
                }));
                break;
            default:
                break;
        }
    };

    //text field 값은 따로 관리
    const handleMemberInfoChange = (event) => {
        const { name, value } = event.target;

        setDetailMemberInfo(prevState => {
            // 전화번호 필드의 경우: 숫자만 남기기
            const phoneNormalize = name === 'phone' ? value.replace(/\D/g, '') : value;
            // 이름 필드의 경우: 앞뒤 공백 제거
            const normalizedValue = name === 'memberNm' ? value.trim() : phoneNormalize;

            return {
                ...prevState,
                [name]: normalizedValue
            };
        });
    };

    return (
        <Box sx={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>사용자 설정</Typography>
            <SearchArea
                searchValues={{ role: searchRole, memberNm: searchName }}
                handleSearchChanges={(name, value) => { handleSearchChanges(name, value); }}
                fields={[
                    {
                        fieldnm: '구분',
                        name: 'role',
                        type: 'select',
                        options: roleList
                    },
                    {
                        fieldnm: '사용자명',
                        name: 'memberNm',
                        type: 'input',
                    }
                ]}
                onSearchClick={handleSearch}
            />
            <Box sx={{ marginTop: '10px' }}>
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                        <Table stickyHeader sx={{ padding: '0 10px' }}>
                            <TableHead sx={{ backgroundColor: '#fff', }}>
                                <TableRow sx={{ height: '57px' }}>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>역할</TableCell>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>사용자 ID</TableCell>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>이름</TableCell>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>이메일</TableCell>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold' }}>연락처</TableCell>
                                    <TableCell sx={{ padding: '8px', fontWeight: 'bold', textAlign: 'center', }}>수정</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody sx={{ backgroundColor: '#fff' }}>
                                {Object.values(memberList)
                                    .map((member, index) => (
                                        <TableRow key={member.id || index} sx={{ height: '24px' }}>
                                            <TableCell sx={{ padding: '8px', color: 'rgb(112, 112, 112)' }}>{member.roleNm}</TableCell>
                                            <TableCell sx={{ padding: '8px', color: 'rgb(112, 112, 112)' }}>{member.memberId}</TableCell>
                                            <TableCell sx={{ padding: '8px', color: 'rgb(112, 112, 112)' }}>{member.memberNm}</TableCell>
                                            <TableCell sx={{ padding: '8px', color: 'rgb(112, 112, 112)' }}>{member.email}</TableCell>
                                            <TableCell sx={{ padding: '8px', color: 'rgb(112, 112, 112)' }}>{member.phone}</TableCell>
                                            <TableCell sx={{ textAlign: 'center', padding: '8px', color: 'rgb(112, 112, 112)' }}>
                                                {member.roleNm === '초기사용자' ? (
                                                    <Button variant="contained" color="primary"
                                                        onClick={() => handleRegisterOpen(member.memberId)}>
                                                        정보 등록
                                                    </Button>
                                                ) : (
                                                    <IconButton onClick={() => handleDetailOpen(member.memberId)}
                                                        color="primary">
                                                        <SearchIcon />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {Array.from({ length: rowsPerPage - memberList.length }).map((_, index) => (
                                    <TableRow key={`empty-row-${index}`} sx={{ height: '56.95px' }}>
                                        <TableCell colSpan={6} sx={{ padding: '8px' }} />
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 2, }}>
                        <Box>
                            <Pagination
                                count={Math.ceil(totalElements / rowsPerPage)}
                                page={page}
                                onChange={(event, newPage) => handleChangePage(event, newPage)}
                                showFirstButton
                                showLastButton
                            />
                        </Box>
                        <Box sx={{ position: 'absolute', top: 5, left: 0 }}>
                            <TablePagination
                                labelDisplayedRows={() => ''}
                                component="div"
                                page={page - 1}
                                count={totalElements}
                                rowsPerPageOptions={[10, 25, 50]}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={handleRowsPerPageChange}
                                ActionsComponent={() => null}
                                onPageChange={() => null}
                            />
                        </Box>
                    </Box>
                </Paper>
                <Dialog open={detailOpen} onClose={handleDetailClose} maxWidth="md" fullWidth>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mr: 2 }}>
                        <DialogTitle>사용자 수정 / 삭제</DialogTitle>
                        <IconButton onClick={handleDetailClose} size="small" >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <DialogContent>
                        <Box sx={{
                            display: 'flex',
                            marginTop: '10px',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '40%'
                            }}>
                                <FormControl variant="standard" sx={{ marginBottom: 2 }}>
                                    <InputLabel shrink={true}>이름</InputLabel>
                                    <Input
                                        name="memberNm"
                                        value={detailMemberInfo.memberNm || ''}
                                        onChange={handleMemberInfoChange}
                                    >
                                    </Input>
                                </FormControl>
                                <FormControl variant="standard" sx={{ marginBottom: 2 }}>
                                    <InputLabel shrink={true}>연락처</InputLabel>
                                    <Input
                                        name='phone'
                                        value={detailMemberInfo.phone || ''}
                                        onChange={handleMemberInfoChange}
                                    >
                                    </Input>
                                </FormControl>
                                <FormControl variant="standard" sx={{ marginBottom: 2 }}>
                                    <InputLabel shrink={true}>이메일</InputLabel>
                                    <Input
                                        name='email'
                                        value={detailMemberInfo.email || ''}
                                        onChange={handleMemberInfoChange}
                                    >
                                    </Input>
                                </FormControl>
                                <FormControl variant="standard" sx={{ marginBottom: 2 }}>
                                    <InputLabel shrink={true}>아이디</InputLabel>
                                    <Input
                                        name='memberId'
                                        value={detailMemberInfo.memberId || ''}
                                        disabled
                                    >
                                    </Input>
                                </FormControl>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginBottom: 2
                                }}>
                                    <Typography sx={{ marginRight: 2 }}>비밀번호 초기화</Typography>
                                    <Button variant="contained" color="secondary" onClick={clickPWInit}>초기화</Button>
                                    <AlertForConfirm
                                        open={isPwInitAlertOpen}
                                        onClose={handlePwInitAlertClose}
                                        onConfirm={pwInit}
                                        contentText="해당 사용자의 비밀번호를 초기화하시겠습니까?"
                                        severity='warning'
                                    />
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '55%',
                                mt: '10px'
                            }}>
                                <FormControl sx={{ marginBottom: 2 }} size="small">
                                    <InputLabel>사용 권한</InputLabel>
                                    <Select
                                        name='role'
                                        label="사용 권한"
                                        value={detailMemberInfo.role || ''}
                                        onChange={handleSelectedMemberInfoChange}
                                        disabled
                                    >
                                        {roleList.slice(1, -1).map((role) => (
                                            <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText sx={{ marginLeft: '5px' }}>*사용 권한은 수정할 수 없습니다.</FormHelperText>
                                </FormControl>
                                {detailMemberInfo.role === 'MANAGE' ? ( //관리자만 관리 포지션 선택함
                                    <FormControl sx={{ marginBottom: 2 }} size="small" fullWidth required>
                                        <InputLabel id="register-role-label">관리 포지션</InputLabel>
                                        <Select
                                            name='orgPosition'
                                            label="관리 포지션"
                                            value={detailMemberInfo.orgPosition || '0'}
                                            onChange={handleSelectedMemberInfoChange}
                                        >
                                            {orgPosition.map((item) => (
                                                <MenuItem key={item.position} value={item.position}>{item.positionNm}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                ) : null}
                                {detailMemberInfo.role !== '' && detailMemberInfo.role !== 'ADMIN' ? (
                                    <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                                        <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                            <InputLabel id="register-department-label">관리본부</InputLabel>
                                            <Select
                                                name='topDeptId'
                                                label="관리본부"
                                                value={detailMemberInfo.topDeptId || ''}
                                                onChange={handleSelectedMemberInfoChange}
                                            >
                                                {deptList.filter(dept => dept.deptLevel === 1).map((item) => (
                                                    <MenuItem key={item.deptId} value={item.deptId}>
                                                        {item.deptNm}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {(detailMemberInfo.orgPosition === '0' || detailMemberInfo.orgPosition === '2' || detailMemberInfo.orgPosition === '3') && (
                                            <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                                <InputLabel id="register-department-label">관리부서</InputLabel>
                                                <Select
                                                    name='midDeptId'
                                                    label="관리부서"
                                                    value={detailMemberInfo.midDeptId || ''}
                                                    onChange={handleSelectedMemberInfoChange}
                                                    disabled={!detailMemberInfo.topDeptId}
                                                >
                                                    {deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === Number(detailMemberInfo.topDeptId)).map((item) => (
                                                        <MenuItem key={item.deptId} value={item.deptId}>
                                                            {item.deptNm}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                        {(detailMemberInfo.orgPosition === '0' || detailMemberInfo.orgPosition === '3') && (
                                            <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                                <InputLabel id="register-team-label">팀</InputLabel>
                                                <Select
                                                    name='botDeptId'
                                                    label="팀"
                                                    value={detailMemberInfo.botDeptId || ''}
                                                    onChange={handleSelectedMemberInfoChange}
                                                    disabled={!detailMemberInfo.midDeptId}
                                                >
                                                    {deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === Number(detailMemberInfo.midDeptId)).map((item) => (
                                                        <MenuItem key={item.deptId} value={item.deptId}>
                                                            {item.deptNm}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Box>
                                ) : null}
                                {detailMemberInfo.role !== 'ADMIN' && (
                                    <FormControl sx={{ marginBottom: 2 }} size="small">
                                        <InputLabel>직위</InputLabel>
                                        <Select
                                            name='position'
                                            label="직위"
                                            value={detailMemberInfo.position || ''}
                                            onChange={handleSelectedMemberInfoChange}
                                        >
                                            {positionList.map((item, index) => (
                                                <MenuItem key={index} value={item.comDtlNm}>
                                                    {item.comDtlNm}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            </Box>
                        </Box>
                    </DialogContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <DialogActions
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                        <Button onClick={() => handleMemberDelete(detailMemberInfo.memberId)} color="error">사용자 삭제</Button>
                        <Button onClick={handleDetailSave} color="primary">저장</Button>
                    </DialogActions>
                    <AlertForConfirm
                        open={isMemDelAlertOpen}
                        onClose={handleMemDelAlertClose}
                        onConfirm={deleteMember}
                        contentText="해당 사용자를 삭제하시겠습니까?"
                        severity='warning'
                    />
                </Dialog>
                {/* 신규 사용자 정보 등록 모달 */}
                <Dialog open={registerOpen} onClose={handleRegisterClose} maxWidth="md" fullWidth>
                    <DialogTitle>신규 사용자 정보 등록</DialogTitle>
                    <DialogContent sx={{ padding: '16px' }}>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            <Step>
                                <StepLabel>기본 정보 입력</StepLabel>
                                {activeStep === 0 && (
                                    <Alert severity="warning" sx={{ marginBottom: 2 }}>
                                        기본 정보는 가입 시 사용자가 입력한 값입니다. 수정에 유의하세요.
                                    </Alert>
                                )}
                                <StepContent>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', mt: '10px', mx: 'auto' }}>
                                        <Box sx={{ flex: 1, mr: 2 }}>
                                            <FormControl variant="standard" sx={{ marginBottom: 2 }} fullWidth>
                                                <InputLabel shrink={true} htmlFor="register-name">이름</InputLabel>
                                                <Input
                                                    name='memberNm'
                                                    value={detailMemberInfo.memberNm || ''}
                                                    onChange={handleMemberInfoChange}
                                                />
                                            </FormControl>
                                            <FormControl variant="standard" sx={{ marginBottom: 2 }} fullWidth>
                                                <InputLabel shrink={true} htmlFor="register-contact">연락처</InputLabel>
                                                <Input
                                                    name='phone'
                                                    value={detailMemberInfo.phone || ''}
                                                    onChange={handleMemberInfoChange}
                                                />
                                            </FormControl>
                                            <FormControl variant="standard" sx={{ marginBottom: 2 }} fullWidth>
                                                <InputLabel shrink={true} htmlFor="register-email">이메일</InputLabel>
                                                <Input
                                                    name='email'
                                                    value={detailMemberInfo.email || ''}
                                                    onChange={handleMemberInfoChange}
                                                />
                                            </FormControl>
                                            <FormControl variant="standard" sx={{ marginBottom: 2 }} fullWidth>
                                                <InputLabel shrink={true}>아이디</InputLabel>
                                                <Input
                                                    name='memberId'
                                                    value={detailMemberInfo.memberId || ''}
                                                    disabled
                                                />
                                            </FormControl>
                                        </Box>
                                    </Box>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                                        <Button onClick={handleNextStepRegiForm} variant="contained">
                                            {activeStep === 0 ? '다음' : '이전'}
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                            <Step>
                                <StepLabel>권한 및 조직 선택</StepLabel>
                                <StepContent>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mt: '10px', mx: 'auto' }}>
                                        <FormControl sx={{ marginBottom: 2 }} size="small" fullWidth required>
                                            <InputLabel id="register-role-label">사용 권한</InputLabel>
                                            <Select
                                                name='role'
                                                label="사용 권한"
                                                value={detailMemberInfo.role || ''}
                                                onChange={handleSelectedMemberInfoChange}
                                            >
                                                {roleList.slice(1, -1).map((role) => (
                                                    <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        {detailMemberInfo.role === 'MANAGE' ? ( //관리자만 관리 포지션 선택함
                                            <>
                                                <Divider sx={{ marginBottom: '20px' }} />
                                                <FormControl sx={{ marginBottom: 2 }} size="small" fullWidth required>
                                                    <InputLabel id="register-role-label">관리 포지션</InputLabel>
                                                    <Select
                                                        name='orgPosition'
                                                        label="관리 포지션"
                                                        value={detailMemberInfo.orgPosition || ''}
                                                        onChange={handleSelectedMemberInfoChange}
                                                    >
                                                        {orgPosition.map((item) => (
                                                            <MenuItem key={item.position} value={item.position}>{item.positionNm}</MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </>
                                        ) : null}
                                        {detailMemberInfo.role !== "" && detailMemberInfo.role !== 'ADMIN' ? (
                                            <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                                                <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                                    <InputLabel id="register-department-label">관리본부</InputLabel>
                                                    <Select
                                                        name='topDeptId'
                                                        label="관리본부"
                                                        value={detailMemberInfo.topDeptId || ''}
                                                        onChange={handleSelectedMemberInfoChange}
                                                    >
                                                        {deptList.filter(dept => dept.deptLevel === 1).map((item) => (
                                                            <MenuItem key={item.deptId} value={item.deptId}>
                                                                {item.deptNm}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {(detailMemberInfo.orgPosition !== '1') && (<FormHelperText>상위 조직부터 순서대로 선택하세요</FormHelperText>)}
                                                </FormControl>
                                                {(detailMemberInfo.orgPosition === '0' || detailMemberInfo.orgPosition === '2' || detailMemberInfo.orgPosition === '3') && (
                                                    <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                                        <InputLabel id="register-department-label">관리부서</InputLabel>
                                                        <Select
                                                            name='midDeptId'
                                                            label="관리부서"
                                                            value={detailMemberInfo.midDeptId || ''}
                                                            onChange={handleSelectedMemberInfoChange}
                                                            disabled={!detailMemberInfo.topDeptId}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 2 && dept.upperDept === Number(detailMemberInfo.topDeptId)).map((item) => (
                                                                <MenuItem key={item.deptId} value={item.deptId}>
                                                                    {item.deptNm}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                                {(detailMemberInfo.orgPosition === '0' || detailMemberInfo.orgPosition === '3') && (
                                                    <FormControl sx={{ minWidth: 120, flex: 1 }} size="small">
                                                        <InputLabel id="register-team-label">팀</InputLabel>
                                                        <Select
                                                            name='botDeptId'
                                                            label="팀"
                                                            value={detailMemberInfo.botDeptId || ''}
                                                            onChange={handleSelectedMemberInfoChange}
                                                            disabled={!detailMemberInfo.midDeptId}
                                                        >
                                                            {deptList.filter(dept => dept.deptLevel === 3 && dept.upperDept === Number(detailMemberInfo.midDeptId)).map((item) => (
                                                                <MenuItem key={item.deptId} value={item.deptId}>
                                                                    {item.deptNm}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                )}
                                            </Box>
                                        ) : null}
                                        <Divider sx={{ marginBottom: '20px' }} />
                                        {detailMemberInfo.role !== 'ADMIN' && (
                                            <FormControl sx={{ marginBottom: 2 }} size="small">
                                                <InputLabel>직위</InputLabel>
                                                <Select
                                                    name='position'
                                                    label="직위"
                                                    value={detailMemberInfo.position || ''}
                                                    onChange={handleSelectedMemberInfoChange}
                                                >
                                                    {positionList.map((item, index) => (
                                                        <MenuItem key={index} value={item.comDtlNm}>
                                                            {item.comDtlNm}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    </Box>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {error}
                                        </Alert>
                                    )}
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
                                        <Button onClick={handleNextStepRegiForm} variant="contained">
                                            {activeStep === 0 ? '다음' : '이전'}
                                        </Button>
                                    </Box>
                                </StepContent>
                            </Step>
                        </Stepper>
                    </DialogContent>
                    <DialogActions sx={{ justifyContent: 'space-between', mt: 2 }}>
                        <Button onClick={handleRegisterClose} color="error">취소</Button>
                        <Button onClick={handleDetailSave} color="primary" disabled={activeStep < 1}>저장</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box >
    );
}

export default validationAuth(MemberManagement);