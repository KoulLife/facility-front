import React, {useState, useEffect} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Divider,
    Radio,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import * as common from '../../commons/common';

export default function ComplainForm() {
    const [selectedComplaint, setSelectedComplaint] = useState('');
    const [customComplaint, setCustomComplaint] = useState('');
    const [complaints, setComplaints] = useState([]);
    const [facilityName, setFacilityName] = useState('');
    const [checkResults, setCheckResults] = useState(null);
    const [comCdDtlList, setComCdDtlList] = useState([]);
    const {facilityId} = useParams();

    // 이상 사항 목록과 시설 정보를 가져오는 API 호출
    useEffect(() => {
        const fetchComplaintsData = async () => {
            const url = `${common.getApiUrl()}/qr/${facilityId}`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data) {
                    const fetchedComplaints = response.data.complaintCdList.map(item => item.complaintNm);
                    setComplaints([...fetchedComplaints, '기타']);
                    setFacilityName(response.data.facilityNm);
                }
            } catch (error) {
                common.handleApiError(error);
            }
        };

        // 점검 결과를 가져오는 API 호출
        const fetchCheckResults = async () => {
            const url = `${common.getApiUrl()}/qr/result/${facilityId}`;
            try {
                const response = await axios.get(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data) {
                    setCheckResults(response.data.checkRslt);
                    setComCdDtlList(response.data.comCdDtlList);
                }
            } catch (error) {
                common.handleApiError(error);
            }
        };

        fetchComplaintsData();
        fetchCheckResults();
    }, [facilityId]);

    const handleComplaintSelect = (complaint) => {
        setSelectedComplaint(complaint);
        if (complaint !== '기타') {
            setCustomComplaint('');
        }
    };

    const handleCustomComplaintChange = (event) => {
        setCustomComplaint(event.target.value);
    };
    
    // 불만 사항 제출 처리
    const handleSubmit = async (event) => {
        event.preventDefault();
        const finalComplaint = selectedComplaint === '기타' ? customComplaint : selectedComplaint;
        const requestData = {
            complaintNm: finalComplaint,
            facilityId: parseInt(facilityId, 10),
        };

        try {
            const url = `${common.getApiUrl()}/qr`;
            const response = await axios.post(url, requestData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            common.handleApiError(error);

        }
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            width: '100%',
            maxWidth: '800px',
            mx: 'auto'
        }}>
            <Card sx={{width: '100%', boxShadow: 3, border: '1px solid #ddd', borderRadius: '16px'}}>
                <CardContent>
                    <Typography
                        variant="h4"
                        component="div"
                        gutterBottom
                        sx={{
                            color: '#1976d2',
                            padding: 2,
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '2.5rem'
                        }}
                    >
                        {facilityName}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom
                                sx={{mt: 3, mb: 2, textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold'}}>
                        요청사항을 선택해주세요.
                    </Typography>
                    <Divider sx={{my: 2, borderColor: 'grey.400'}}/>
                    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off"
                         sx={{display: 'flex', flexDirection: 'column', gap: 1, mt: 1}}>
                        {complaints.map((complaint) => (
                            <Button
                                key={complaint}
                                variant={selectedComplaint === complaint ? 'contained' : 'outlined'}
                                onClick={() => handleComplaintSelect(complaint)}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1.3rem',
                                    borderRadius: '8px',
                                    height: '60px',
                                    padding: '6px 12px',
                                    color: selectedComplaint === complaint ? 'white' : '#1976d2',
                                    backgroundColor: selectedComplaint === complaint ? '#d32f2f' : 'transparent',
                                    '&:hover': {
                                        backgroundColor: selectedComplaint === complaint ? '#b71c1c' : '#ffcccb',
                                        color: selectedComplaint === complaint ? 'white' : '#1976d2',
                                    },
                                }}
                            >
                                {complaint}
                            </Button>
                        ))}
                        {selectedComplaint === '기타' && (
                            <TextField
                                label="직접 입력"
                                variant="outlined"
                                value={customComplaint}
                                onChange={handleCustomComplaintChange}
                                autoComplete="off"
                                sx={{mt: 2, borderRadius: '8px'}}
                                fullWidth
                            />
                        )}
                        <Button type="submit" variant="contained" size="large" color="primary"
                                sx={{mt: 3, borderRadius: '8px', py: 3, fontSize: '2.0rem'}}>
                            접수하기
                        </Button>
                    </Box>
                    <Divider sx={{my: 3, borderColor: 'grey.400'}}/>
                    <Box>
                        <Typography variant="h6" color="text.secondary" gutterBottom
                                    sx={{mt: 3, mb: 2, textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold'}}>
                            점검 기록
                        </Typography>
                        {checkResults && (
                            <Box sx={{width: '100%'}}>
                                <Typography variant="body1" gutterBottom>점검자: {checkResults.checkerNm}</Typography>
                                <Typography variant="body1" gutterBottom>점검일시: {checkResults.checkTime}</Typography>
                                {checkResults.checkType.map((type) => (
                                    <Box key={type.checkTypeId} sx={{mt: 3}}>
                                        <Typography variant="h6" sx={{
                                            fontWeight: 'bold',
                                            mb: 2,
                                            textAlign: 'center',
                                            backgroundColor: '#f5f5f5',
                                            padding: 1,
                                            borderRadius: 1
                                        }}>{type.checkTypeNm}</Typography>
                                        <TableContainer component={Paper}
                                                        sx={{mb: 3, width: '100%', overflow: 'visible'}}>
                                            <Table size="small" sx={{tableLayout: 'fixed'}}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 'bold',
                                                            textAlign: 'left',
                                                            width: '30%'
                                                        }}>항목</TableCell>
                                                        {comCdDtlList.map((comCd) => (
                                                            <TableCell key={comCd.comDtlId} sx={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: 'bold',
                                                                textAlign: 'center',
                                                                whiteSpace: 'nowrap',
                                                                width: `${70 / comCdDtlList.length}%` // 나머지 열의 넓이를 동적으로 설정
                                                            }}>{comCd.comDtlNm}</TableCell>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {type.checkRsltDtlList.map((item) => (
                                                        <TableRow key={item.checkItemId}>
                                                            <TableCell component="th" scope="row" sx={{
                                                                fontSize: '0.7rem',
                                                                textAlign: 'left',
                                                                width: '30%'
                                                            }}>{item.checkItemNm}</TableCell>
                                                            {item.textYn === 'Y' ? (
                                                                <TableCell colSpan={comCdDtlList.length}
                                                                           sx={{paddingX: '2px'}}>
                                                                    <TextField
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        value={item.checkRsltValNm || ''}
                                                                        disabled
                                                                        autoComplete="off"
                                                                        sx={{
                                                                            width: '100%',
                                                                            margin: 0,
                                                                            '& .MuiInputBase-root': {
                                                                                height: '25px',
                                                                                fontSize: '0.7rem'
                                                                            }
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                            ) : (
                                                                comCdDtlList.map((comCd) => (
                                                                    <TableCell key={comCd.comDtlId} align="center" sx={{
                                                                        padding: '2px',
                                                                        whiteSpace: 'nowrap',
                                                                        width: `${70 / comCdDtlList.length}%`
                                                                    }}>
                                                                        <Radio
                                                                            checked={item.checkRsltValNm === comCd.comDtlNm}
                                                                            value={comCd.comDtlNm}
                                                                            disabled
                                                                            sx={{padding: '2px'}}
                                                                        />
                                                                    </TableCell>
                                                                ))
                                                            )}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

