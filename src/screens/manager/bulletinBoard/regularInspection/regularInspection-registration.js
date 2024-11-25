import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as common from '../../../../commons/common';
import { Box, Button, Modal, TextField, Typography, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AlertForConfirm from '../../../../components/alertForConfirm';

function RegularInspectionRegistrationModal({ open, handleClose, id }) {
    const [addYn, setAddYn] = useState(true);
    const [boardDtl, setBoardDtl] = useState({
        boardId: 0,
        boardNm: '',
        deleteFileIds: []
    });
    const [newFiles, setNewFiles] = useState([]); //신규 File array
    const [existingFiles, setExistingFlies] = useState([]); //기존 File array
    const [error, setError] = useState('');
    const [isAlertOpen, setIsAlertOpen] = useState(false); // 삭제 alert

    useEffect(() => {
        if (id) {
            setAddYn(false);
            setBoardDtl({ ...boardDtl, boardId: id });
            fetchDetailData(id);
        } else {
            setAddYn(true);
        }
    }, [id]);

    const fetchDetailData = async (boardId) => {
        try {
            const response = await axios.get(`${common.getApiUrl()}/board/${boardId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                },
            });

            if (response.status === 200) {
                if (response.data.result === 'ERROR') {
                    alert('작업에 실패했습니다.');
                    return; // 오류 발생 시 함수 종료
                }

                // 기존 파일 리스트의 하나만 받음
                const selectedFile = response.data.boardFiles.length > 0 ? [response.data.boardFiles[0]] : [];

                setBoardDtl({
                    ...boardDtl,
                    boardId: boardId,
                    boardNm: response.data.boardNm,
                });

                setExistingFlies(selectedFile);
            }
        } catch (error) {
            console.error('실패', error);
        }
    };


    const handleTitleChange = (event) => {
        setBoardDtl({ ...boardDtl, boardNm: event.target.value, });
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        // 파일 대체 로직: 기존 파일 삭제 후 새 파일 추가
        if (selectedFiles.length > 0) {
            setNewFiles(selectedFiles); // 기존 파일을 새 파일로 대체
            setError('');
        }

        event.target.value = '';
    };

    const handleSubmit = async () => {
        const trimBoardTitle = boardDtl.boardNm.trim();

        if (addYn) {
            if (!trimBoardTitle || newFiles.length === 0) {
                setError('제목과 파일을 모두 입력해 주세요.');
                return;
            }
        } else {
            if (!trimBoardTitle || (existingFiles.length === 0 && newFiles.length === 0)) {
                setError('제목과 파일을 모두 입력해 주세요.');
                return;
            }
        }

        try {
            await handleBoardPostAndPut();
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
                setExistingFlies((prevExistingFiles) => prevExistingFiles.filter(f => f.fileId !== index));
                setBoardDtl({
                    ...boardDtl,
                    deleteFileIds: Array.isArray(boardDtl.deleteFileIds)
                        ? [...boardDtl.deleteFileIds, index] : [index],
                });
                break;
            case 'new':
                setNewFiles([]);
                break;
            default:
                return null;
        }
    }

    const clickRemoveBoard = () => {
        setIsAlertOpen(true);
    };

    const handleRemoveBoard = async () => {
        setIsAlertOpen(false);
        const url = `${common.getApiUrl()}/board/${boardDtl.boardId}`;
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
        setBoardDtl({});
        setNewFiles([]);
        setExistingFlies([]);
        setError('');
    };

    const handleCloseAndReset = () => {
        resetForm();
        handleClose();
    };

    const handleBoardPostAndPut = async () => {
        const formData = new FormData();
        const requestData = JSON.stringify(boardDtl);

        const apiMethod = addYn ? axios.post : axios.put;
        const apiUrl = addYn ? `${common.getApiUrl()}/board` : `${common.getApiUrl()}/board/${boardDtl.boardId}`;

        formData.append(addYn ? "insertBoardRequest" : "modifiedBoardRequest", new Blob([requestData], { type: 'application/json' }));

        newFiles.forEach((f) => {
            formData.append("uploadFiles", f);
        });

        try {
            const response = await apiMethod(apiUrl, formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 && response.data.result === 'ERROR') {
                alert('작업에 실패했습니다.');
            } else if (response) {
                // console.log("requestData", requestData)
            }
        } catch (error) {
            console.error('작업에 실패했습니다:', error);
            alert('작업에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        }
    };

    return (
        <>
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
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>정기검사 등록</Typography>
                    ) : (
                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>정기검사 수정</Typography>
                    )}
                    <TextField
                        fullWidth
                        label="제목"
                        variant="outlined"
                        value={boardDtl.boardNm || ''}
                        autoComplete="off"
                        onChange={handleTitleChange}
                        sx={{ mb: 2 }}
                        required
                    />
                    {newFiles.length > 0 || existingFiles.length > 0 ? (null)
                        : (<Button
                            variant="contained"
                            component="label"
                            sx={{ mb: 2, bgcolor: 'var(--sub-darkblue-color)' }}
                        >
                            파일 첨부
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>)
                    }
                    {existingFiles.length > 0 && (
                        <Box key={existingFiles[0].fileId} sx={{ display: 'flex', alignItems: 'center', padding: '3px' }}>
                            <Typography variant="body2" noWrap
                                sx={{ cursor: 'pointer', textDecoration: 'underline', cursor: 'auto' }}
                            >
                                {existingFiles[0].fileName}
                            </Typography>
                            <IconButton onClick={() => handleRemoveFile('existing', existingFiles[0].fileId)} size="small" sx={{ ml: 1 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}

                    {newFiles.length > 0 && (
                        <Box key={newFiles[0].name} sx={{ display: 'flex', alignItems: 'center', padding: '3px' }}>
                            <a href={URL.createObjectURL(newFiles[0])} target="_blank" rel="noopener noreferrer" download={newFiles[0].name}>
                                <Typography variant="body2" noWrap sx={{ color: 'rgba(0, 0, 0, 0.87)' }}>
                                    {newFiles[0].name}
                                </Typography>
                            </a>
                            <IconButton onClick={() => handleRemoveFile('new', 0)} size="small" sx={{ ml: 1 }}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    )}
                    {/* 파일 multiple일때 */}
                    {/* {existingFiles.length > 0 &&
                    (existingFiles.map((file, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', padding: '3px', }}>
                            <Typography variant="body2" noWrap
                                sx={{ cursor: 'pointer', textDecoration: 'underline', cursor: 'auto' }}
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
                )} */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '25px' }}>
                        <Box>
                            {!addYn && (
                                <>
                                    <Button
                                        color="error"
                                        sx={{ position: 'relative', left: -5 }}
                                        onClick={clickRemoveBoard}
                                    >
                                        삭제
                                    </Button>
                                </>
                            )}
                        </Box>
                        <Box>
                            <Button onClick={handleCloseAndReset} sx={{ mr: 1 }}>
                                취소
                            </Button>
                            <Button variant="contained" sx={{ bgcolor: 'var(--main-blue-color)' }} onClick={handleSubmit}>
                                {addYn ? '등록' : '수정'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal >
            <AlertForConfirm
                open={isAlertOpen}
                onClose={handleAlertClose}
                onConfirm={handleRemoveBoard}
                contentText="해당 정기검사 게시물을 삭제하시겠습니까?"
            />
        </>
    );
}

export default RegularInspectionRegistrationModal;