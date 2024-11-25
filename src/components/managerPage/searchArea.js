import React from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const Container = styled(Box)({});

const ContentWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
    padding: '16px',
    paddingRight: '10px'
});

const InputWrapper = styled(Box)({
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'center',
    width: '80%',
});

const InputField = styled(TextField)({
    backgroundColor: '#fff',
    shrink: false,
    width: '170px',
    '& .MuiOutlinedInput-root': {
        height: '36px',
    },
    '& .MuiOutlinedInput-input': {
        padding: '8px 14px',
    },
});

const RightButton = styled(Button)(({ rightbtnbgcolor }) => ({
    backgroundColor: rightbtnbgcolor,
    boxShadow: 'none',
    width: '130px',
    marginLeft: '16px',
    color: '#fff',
    '&:hover': { backgroundColor: rightbtnbgcolor },
    '&:disabled': {
        backgroundColor: 'var(--sub-mediumgrey-color)',
        color: 'grey',
        cursor: 'not-allowed',
    },
}));


const CustomStyledButton = styled(Button)({
    boxShadow: 'none',
    height: '36px',
    textTransform: 'none',
    padding: '0 40px',
    backgroundColor: 'var(--main-blue-color)',
    '&:hover': { backgroundColor: 'var(--main-blue-color)' },
    color: 'var(--main-white-color)'
});

// 검색 필드 종류 지원
const FieldComponent = ({ type, value, onChange, options = [], ...props }) => {
    switch (type) {
        case 'select':
            const defaultValue = options.length > 0 ? options[0].value : '';
            return (
                <FormControl sx={{ width: '170px' }}>
                    <Select
                        value={value || defaultValue} // value가 없으면 defaultValue 사용
                        onChange={onChange}
                        sx={{ height: '36px', bgcolor: '#fff' }}
                    >
                        {options.map((option, index) => (
                            <MenuItem key={index} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        case 'calendar':
            return (
                <TextField
                    type="date"
                    variant="outlined"
                    size="small"
                    value={value || ''}
                    onChange={onChange}
                    autoComplete="off"
                    sx={{
                        backgroundColor: '#fff',
                        mr: -1,
                        width: '170px',
                        '& .MuiOutlinedInput-root': {
                            height: '36px',
                        },
                        '& .MuiOutlinedInput-input': {
                            padding: '8px 14px',
                        },
                    }}
                    {...props}
                />
            );
        case 'input':
        default:
            return (
                <InputField
                    variant="outlined"
                    size="small"
                    value={value || ''}
                    autoComplete="off"
                    onChange={onChange}
                    {...props}
                />
            );
    }
};

const SearchArea = ({
    searchValues,
    onSearchClick,
    notSearch,
    handleSearchChanges,
    showRightButton,
    onRightBtnClick,
    rightBtnText,
    rightbtnbgcolor,
    fields = []
}) => {
    return (
        <Container>
            <ContentWrapper>
                <InputWrapper>
                    {fields.map((field, index) => (
                        <Box key={index} display="flex" alignItems="center" sx={{ mr: 2.5 }}>
                            <Typography sx={{ marginRight: 1 }}>{field.fieldnm}</Typography>
                            <FieldComponent
                                type={field.type}
                                value={searchValues[field.name]}
                                onChange={(e) => handleSearchChanges(field.name, e.target.value)}
                                {...field}
                            />
                        </Box>
                    ))}
                    {notSearch ? (null) :
                        (
                            <CustomStyledButton onClick={onSearchClick}>검색</CustomStyledButton>
                        )
                    }
                </InputWrapper>
                {showRightButton && (
                    <RightButton onClick={onRightBtnClick} rightbtnbgcolor={rightbtnbgcolor} >
                        {rightBtnText}
                    </RightButton>
                )}
            </ContentWrapper>
        </Container>
    );
};

export default SearchArea;
