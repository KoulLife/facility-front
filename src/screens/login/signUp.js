import React, { useEffect, useState } from 'react';
import { Box, Container, Button, Checkbox, Divider, Typography, Alert, TextField, Link, Grid, } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Stack from '@mui/material/Stack'; //???
import axios from "axios";
import * as common from '../../commons/common';
import SignUpTerms from './signUpTerms';

export default function SignUp() {
    const [inputId, setInputId] = useState('');
    const [inputPw, setInputPw] = useState('');
    const [inputConfirmPw, setInputConfirmPw] = useState('');
    const [inputName, setInputName] = useState('');
    const [inputEmail, setInputEmail] = useState('');
    const [inputPhone, setInputPhone] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [formAlert, setFormAlert] = useState('');
    const [openTermsModal, setIsOpenTermsModal] = useState(false);

    const [termsCheck, setTermsCheck] = useState({
        all: false,
        termsOfService: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'id':
                const trimmedValue = value.replace(/\s+/g, '');
                setInputId(trimmedValue);
                break;
            case 'password':
                setInputPw(value);
                break;
            case 'confirmPassword':
                setInputConfirmPw(value);
                break;
            case 'name':
                setInputName(value);
                break;
            case 'email':
                setInputEmail(value);
                break;
            default:
                break;
        }
    };

    const handlePhoneChange = (e) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9]/g, '');

        let formattedValue = '';

        for (let i = 0; i < numericValue.length; i++) {
            if (i === 3 || i === 7) {
                formattedValue += '-';
            }
            formattedValue += numericValue[i];
        }

        setInputPhone(formattedValue);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    const handleAllTermsCheck = (event) => {
        const isChecked = event.target.checked;
        setTermsCheck({
            all: isChecked,
            termsOfService: isChecked,
        });
    };

    const handleEachTermsCheck = (event) => {
        const { name, checked } = event.target;
        setTermsCheck((prevState) => ({
            ...prevState,
            [name]: checked,
            all: checked,
        }));
    };

    // 약관 모달 열기
    const handleOpenTermsModal = () => {
        setIsOpenTermsModal(true);
    };

    // 약관 모달 닫기
    const handleCloseTermsModal = () => {
        setIsOpenTermsModal(false);
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        const phoneNumber = inputPhone.replace(/-/g, '');

        const registerRequest = {
            memberId: inputId,
            password: inputPw,
            memberNm: inputName,
            email: inputEmail,
            phone: phoneNumber,
        };

        if (Object.values(registerRequest).some(value => !value)) {
            setFormAlert("모든 항목을 입력해주세요.");
            return;
        }

        if (inputPw !== inputConfirmPw) {
            setFormAlert("비밀번호가 일치하지 않습니다.");
            return;
        }

        if (!termsCheck.all) {
            setFormAlert("서비스 약관 동의는 필수입니다.");
            return;
        }


        const token = localStorage.getItem('access_token');
        const payload = new FormData();



        payload.append('registerRequest', new Blob([JSON.stringify(registerRequest)], { type: "application/json" }));

        if (imageFile) {
            payload.append('uploadFile', imageFile);
        }

        try {
            const response = await axios.post(`${common.getApiUrl()}/auth/register`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert("회원가입이 완료되었습니다.");
            document.location.href = '/';
        } catch (error) {
            console.error('Error occurred during sign up:', error);
            setFormAlert(`${error.response ? error.response.data.message : '오류가 발생했습니다. 관리자에게 문의하세요'}`);
        }
    };

    return (
        <Box
            id="LoginContainer"
            sx={{
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(180deg, #CEE5FD, #FFF)',
                backgroundSize: '100% 20%',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: { xs: 10, sm: 6 },
                    pb: { xs: 6, sm: 4 },
                }}
            >
                <Stack spacing={2} useFlexGap sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <Box
                        sx={{
                            marginTop: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                        component="form"
                        onSubmit={handleSignUp}
                        noValidate
                        autoComplete="off"
                    >
                        <Box noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="id"
                                label="아이디"
                                name="id"
                                autoComplete="off"
                                autoFocus
                                onChange={handleInputChange}
                                value={inputId || ''}
                                inputProps={{
                                    pattern: "^[a-zA-Z0-9]+$",
                                    title: "아이디는 알파벳 대소문자 또는 숫자로 구성되어야 하며, 공백이 포함될 수 없습니다.",
                                }}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="비밀번호"
                                type="password"
                                id="password"
                                autoComplete="off"
                                onChange={handleInputChange}
                                value={inputPw || ''}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="비밀번호 확인"
                                type="password"
                                id="confirmPassword"
                                autoComplete="off"
                                onChange={handleInputChange}
                                value={inputConfirmPw || ''}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="이름"
                                name="name"
                                autoComplete="off"
                                onChange={handleInputChange}
                                value={inputName || ''}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="이메일"
                                name="email"
                                autoComplete="off"
                                onChange={handleInputChange}
                                value={inputEmail || ''}
                                type="email"
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="phone"
                                label="휴대폰"
                                name="phone"
                                autoComplete="off"
                                value={inputPhone || ''}
                                inputProps={{
                                    maxLength: 13,
                                    placeholder: "000-0000-0000",
                                    onChange: handlePhoneChange,
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Checkbox
                                        name="termsOfService"
                                        checked={termsCheck.termsOfService}
                                        onChange={handleEachTermsCheck}
                                    />
                                    <Typography variant="body1" sx={{ fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '8px' }}>
                                        서비스 이용 약관 동의
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleOpenTermsModal}>
                                    <Typography variant="body1" sx={{ fontSize: '0.7rem', color: 'black', marginRight: '4px' }}>
                                        약관 보기
                                    </Typography>
                                    <ChevronRightIcon sx={{ color: 'black' }} />
                                </Box>
                            </Box>
                            <SignUpTerms open={openTermsModal} onClose={handleCloseTermsModal} />
                            {formAlert && (
                                <Alert severity="warning" sx={{ mb: 2 }}>
                                    {formAlert}
                                </Alert>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, py: 1.5 }}
                            >
                                회원가입
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/" variant="body2">
                                        이미 계정이 있으신가요? 로그인
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
}