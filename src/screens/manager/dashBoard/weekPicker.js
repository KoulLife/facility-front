import { FormControl, TextField } from '@mui/material';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  .css-inrir7-MuiButtonBase-root-MuiPickersDay-root.Mui-selected {
    color: unset !important;
    background-color: unset !important;
  }
  
    .css-yc22np.Mui-selected {
        color: unset !important;
        background-color: unset !important;
    }

  .MuiDayCalendar-weekContainer:hover {
    background-color: lightblue !important;
  }
`;

const WeekPicker = ({ value, onChange }) => {
    // 주의 시작일과 마지막일 계산
    const startDate = startOfWeek(value, { weekStartsOn: 0 });
    const endDate = endOfWeek(value, { weekStartsOn: 0 });
    const displayValue = `${format(startDate, 'yyyy/MM/dd')} ~ ${format(endDate, 'yyyy/MM/dd')}`; // 시작일 ~ 마지막일 문자열
    return (
        <>
            <GlobalStyle />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <FormControl variant="outlined" sx={{ marginY: 2 }}>
                    <DatePicker
                        label="선택"
                        value={value}
                        onChange={onChange}
                        format={displayValue}
                    />
                </FormControl>
            </LocalizationProvider>
        </>
    );
};

export default WeekPicker;
