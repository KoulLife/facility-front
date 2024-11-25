import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as common from '../../../../commons/common';
import { Box, Button, Modal, TextField, Typography, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AlertForConfirm from '../../../../components/alertForConfirm';

function GuideRegistrationModal({ open, handleClose, ruleId }) {
    const [addYn, setAddYn] = useState(true);
    const [noticeDtl, setNoticeDtl] = useState({
        noticeId: 0,
        noticeNm: '',
        deleteFileIds: []
    });
    const [newFiles, setNewFiles] = useState([]); //신규 File array
    const [existingFiles, setExistingFiles] = useState([]); //기존 File array
    const [error, setError] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false); // 삭제 경고 alert
    const [isSubmitting, setIsSubmitting] = useState(false); // 중복 api 호출을 막기위해 버튼 비활성화(최선의방법아님)

    useEffect(() => {
        if (ruleId) {
            setIsSubmitting(false)
            setAddYn(false);
            setNoticeDtl({ ...noticeDtl, noticeId: ruleId });
            fetchRuleDetail(ruleId);
        } else {
            setAddYn(true);
        }
    }, [ruleId]);

    const fetchRuleDetail = async (noticeId) => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/qr/notice/${noticeId}`, {
                headers: {'Content-Type': 'application/json'},
            });

            if (response.status === 200) {
                if (response.data.result === 'ERROR') {
                    alert('작업에 실패했습니다.');
                }
                setNoticeDtl({ ...noticeDtl, noticeId: response.data.noticeId, noticeNm: response.data.noticeNm, });
                setExistingFiles(response.data.noticeFiles);
            }
        } catch (error) {
            console.error('실패', error);
        }
    }

    const handleTitleChange = (event) => {
        setNoticeDtl({ ...noticeDtl, noticeNm: event.target.value, });
    };

    const handleFileAdd = (event) => {
        const selectedFiles = Array.from(event.target.files);

        // 중복 파일 필터링
        const filteredFiles = selectedFiles.filter(
            (file) => !newFiles.some((existingFile) => existingFile.name === file.name && existingFile.size === file.size)
        );

        if (filteredFiles.length === 0) {
            setError('이미 추가한 파일입니다.')
            return;
        }

        setNewFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
        setError('');

        event.target.value = '';
    };

    const handleSubmit = async () => {
        const trimNoticeTitle = noticeDtl.noticeNm.trim();

        if (addYn) {
            if (!trimNoticeTitle || newFiles.length === 0) {
                setError('제목과 파일을 모두 입력해 주세요.');
                return;
            }
        } else {
            if (!trimNoticeTitle || (existingFiles.length === 0 && newFiles.length === 0) ) {
                setError('제목과 파일을 모두 입력해 주세요.');
                return;
            }
        }

        try {
            setIsSubmitting(true)
            await handleNotice();
            resetForm();
            handleCloseAndReset();
        } catch (error) {
            console.error('작업에 실패했습니다:', error);
            alert('작업에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        }
    };

    const handleRemoveFile = (type, index) => {
        switch (type) {
            case 'existing':
                setExistingFiles((prevFileInfos) => prevFileInfos.filter((file) => file.fileId !== index));
                setNoticeDtl({
                    ...noticeDtl,
                    deleteFileIds: Array.isArray(noticeDtl.deleteFileIds)
                        ? [...noticeDtl.deleteFileIds, Number(index)] : [Number(index)],
                });
                
                break;
            case 'new':
                setNewFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
                break;
            default:
                return null;
        }
    }

    const clickRemoveRule = () => {
        setIsAlertOpen(true);
    };

    const handleRemoveRule = async () => {
        setIsAlertOpen(false);
        const url = `${common.getApiUrl()}/notice/${noticeDtl.noticeId}`;
        const token = localStorage.getItem('access_token');

        try {
            await axios.delete(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            handleCloseAndReset();
        } catch (error) {
            console.error("점검항목 삭제 실패:", error);
            alert(`Error: ${error.response?.data?.message || '오류가 발생했습니다.'}`);
        }
    }

    const handleAlertClose = () => {
        setIsAlertOpen(false);
    };

    const resetForm = () => {
        setAddYn(true);
        setNoticeDtl({})
        setNewFiles([]);
        setExistingFiles([]);
        setError('');
    };

    const handleCloseAndReset = () => {
        resetForm();
        handleClose();
    };

    const handleNotice = async () => {
        const formData = new FormData();
        const requestData = JSON.stringify(noticeDtl);

        formData.append(addYn ? "insertNoticeRequest" : "updateNoticeRequest", new Blob([requestData], { type: 'application/json' }));

        newFiles.forEach((file) => {
            formData.append("uploadFiles", file);
        });

        try {
            const apiMethod = addYn ? axios.post : axios.put;
            const apiUrl = addYn ? `${common.getApiUrl()}/notice` : `${common.getApiUrl()}/notice/${noticeDtl.noticeId}`;

            const response = await apiMethod(apiUrl, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status >= 200 && response.status < 300) {
                if (response.data.result === 'ERROR') {
                    alert('작업에 실패했습니다.');
                }
            } else {
                alert('작업에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('작업에 실패했습니다:', error);
            alert('작업에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        }
    };


    return (
        <Modal open={open} onClose={handleCloseAndReset}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                py: 3,
                px: 4,
            }}>
                {addYn ? (
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>안전수칙 등록</Typography>
                ) : (
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>안전수칙 수정</Typography>
                )}
                <TextField
                    fullWidth
                    label="제목"
                    variant="outlined"
                    value={noticeDtl.noticeNm || ''}
                    onChange={handleTitleChange}
                    autoComplete="off"
                    sx={{ mb: 2 }}
                    required
                />
                <Button
                    variant="contained"
                    component="label"
                    sx={{ mb: 2, bgcolor: 'var(--sub-darkblue-color)' }}
                >
                    {addYn ? '파일 첨부' : '파일 추가'}
                    <input
                        type="file"
                        hidden
                        onChange={handleFileAdd}
                        multiple
                        accept=".pdf, image/*, video/*"  // 파일 타입 제한 추가
                    />
                </Button>
                {existingFiles.length > 0 &&
                    (existingFiles.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', padding: '3px', }}>
                            <Typography variant="body2" noWrap
                                onClick={() => window.open(`${common.getImageBaseUrl()}${file.filePath}`, '_blank')}
                                sx={{ cursor: 'pointer', textDecoration: 'underline', }}
                            >
                                {file.fileName}
                            </Typography>
                            <IconButton onClick={() => handleRemoveFile('existing', file.fileId)} size="small" sx={{ ml: 1 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )))}
                {newFiles.length > 0 && (
                    <>
                        {newFiles.map((file, index) => {
                            const fileURL = URL.createObjectURL(file);
                            return (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', padding: '3px' }}>
                                    <a href={fileURL} target="_blank" rel="noopener noreferrer" download={file.name}>
                                        <Typography variant="body2" noWrap sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                                            {file.name}
                                        </Typography>
                                    </a>
                                    <IconButton onClick={() => handleRemoveFile('new', index)} size="small" sx={{ ml: 1 }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            );
                        })}
                    </>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                    <Box>
                        {!addYn ? (
                            <>
                                <Button
                                    color="error"
                                    sx={{ position: 'relative', left: -5 }}
                                    onClick={clickRemoveRule}
                                >
                                    삭제
                                </Button>
                                <AlertForConfirm
                                    open={isAlertOpen}
                                    onClose={handleAlertClose}
                                    onConfirm={handleRemoveRule}
                                    contentText="해당 안전수칙을 삭제하시겠습니까?"
                                />
                            </>
                        ) : (null)}
                    </Box>
                    <Box>
                        <Button onClick={handleCloseAndReset} sx={{ mr: 1 }}>
                            취소
                        </Button>
                        <Button variant="contained" sx={{ bgcolor: 'var(--main-blue-color)' }} onClick={handleSubmit} disabled={isSubmitting}>
                            {addYn ? '등록' : '수정'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}

export default GuideRegistrationModal;