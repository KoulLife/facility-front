import React, { useEffect, useState } from 'react';
import validationAuth from '../../../validationAuth';
import { Box, Button, Divider, CircularProgress, Typography, FormControl, Select, MenuItem, TextField, InputLabel } from '@mui/material';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { ko } from 'date-fns/locale';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import axios from 'axios';
import * as common from '../../../commons/common';
import WeekPicker from './weekPicker';

const DashBoardFacility = () => {
    const navigate = useNavigate();

    const getCurrentQuarter = () => {
        const currentMonth = new Date().getMonth() + 1;
        return Math.ceil(currentMonth / 3);
    };
    const currentQuarter = String(getCurrentQuarter())

    const [selectedCheckCycle, setSelectedCheckCycle] = useState('DAILY');
    const today = format(new Date(), 'yyyy-MM-dd');
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedDateOfWeek, setSelectedDateOfWeek] = useState(today);
    const [selectedMonth, setSelectedMonth] = useState(today);
    const [selectedYearForQuarter, setSelectedYearForQuarter] = useState(new Date().getFullYear());
    const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);

    const [statistics, setStatistics] = useState([])

    const [checkCycles, setCheckCycles] = useState([
        { eng: 'DAILY', kor: '일간' },
        { eng: 'WEEKLY', kor: '주간' },
        { eng: 'MONTHLY', kor: '월간' },
        { eng: 'QUARTER', kor: '분기' }
    ])

    useEffect(() => {
        fetchData('DAILY', today, today)
    }, [])

    const handleCheckCycleChange = (cycle) => {
        setSelectedDate(today);
        setSelectedDateOfWeek(today);
        setSelectedMonth(today);
        setSelectedYearForQuarter(new Date().getFullYear());
        setSelectedQuarter(currentQuarter);
        setSelectedCheckCycle(cycle);
    
        const nowDate = new Date();
        const formattedDate = format(nowDate, 'yyyy-MM-dd');
    
        switch (cycle) {
            case 'DAILY':
                fetchData('DAILY', formattedDate, formattedDate);
                break;
            case 'WEEKLY':
                const startDate = format(startOfWeek(nowDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
                const endDate = format(endOfWeek(nowDate, { weekStartsOn: 0 }), 'yyyy-MM-dd');
                fetchData('WEEKLY', startDate, endDate);
                break;
            case 'MONTHLY':
                const startMonth = format(startOfMonth(nowDate), 'yyyy-MM-dd');
                const endMonth = format(endOfMonth(nowDate), 'yyyy-MM-dd');
                fetchData('MONTHLY', startMonth, endMonth);
                break;
            case 'QUARTER':
                const year = selectedYearForQuarter; // 선택된 연도 사용
                const quarter = selectedQuarter; // 선택된 분기 사용
    
                const startQuarter = new Date(year, (quarter - 1) * 3, 1);
                const endQuarter = new Date(year, quarter * 3, 0);
    
                const formattedStartQuarter = format(startQuarter, 'yyyy-MM-dd');
                const formattedEndQuarter = format(endQuarter, 'yyyy-MM-dd');
                fetchData('QUARTER', formattedStartQuarter, formattedEndQuarter);
                break;
            default:
                break;
        }
    };

    const handleDateChange = (newValue) => {
        const formattedDate = format(newValue, 'yyyy-MM-dd');
        setSelectedDate(formattedDate);
        fetchData('DAILY', formattedDate, formattedDate)
    };

    const handleWeekChange = (newValue) => {
        // 주의 시작일 (일요일)과 마지막 날 (토요일) 계산
        const startDate = format(startOfWeek(newValue, { weekStartsOn: 0 }), 'yyyy-MM-dd');
        const endDate = format(endOfWeek(newValue, { weekStartsOn: 0 }), 'yyyy-MM-dd');

        setSelectedDateOfWeek(startDate);

        fetchData('WEEKLY', startDate, endDate);
    };

    const handleMonthChange = (newValue) => {
        const startDate = format(startOfMonth(newValue), 'yyyy-MM-dd');
        const endDate = format(endOfMonth(newValue), 'yyyy-MM-dd');
        setSelectedMonth(startDate);
        fetchData('MONTHLY', startDate, endDate);
    };

    // 연도 선택 핸들러
    const handleYearChange = (event) => {
        const year = event.target.value;
        setSelectedYearForQuarter(year);
        fetchData('QUARTER', year, selectedQuarter); // 분기와 함께 호출
    };

    // 분기 선택 핸들러
    const handleQuarterChange = (event) => {
        const quarter = Number(event.target.value);
        const year = selectedYearForQuarter; // 선택된 연도 사용
        const startQuarter = new Date(year, (quarter - 1) * 3, 1);
        const endQuarter = new Date(year, quarter * 3, 0);

        const formattedStartQuarter = format(startQuarter, 'yyyy-MM-dd');
        const formattedEndQuarter = format(endQuarter, 'yyyy-MM-dd');

        setSelectedQuarter(event.target.value);
        fetchData('QUARTER', formattedStartQuarter, formattedEndQuarter);
    };


    const fetchData = async (checkCycle, startDt, endDt) => {
        const token = localStorage.getItem('access_token');

        try {
            const params = {
                checkCycle: checkCycle,
                startCheckTime: startDt,
                endCheckTime: endDt
            };

            const response = await axios.get(`${common.getApiUrl()}/dashboard`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                params
            });

            if (response.data) {
                const statistics = [
                    {
                        key: 'totalFacilityCount',
                        title: '점검대상 시설',
                        count: response.data.totalFacilityCount.count,
                        // percentage: response.data.totalFacilityCount.percentage,
                    },
                    {
                        key: 'inspectedCount',
                        title: '점검 시설',
                        count: response.data.inspectedCount.count,
                        path: '/manager/status/check',
                        percentage: response.data.inspectedCount.percentage,
                    },
                    {
                        key: 'unInspectedCount',
                        title: '미점검 시설',
                        count: response.data.unInspectedCount.count,
                        path: '/manager/status/uncheck',
                        percentage: response.data.unInspectedCount.percentage,
                    },
                    {
                        key: 'breakdownCount',
                        title: '고장 A/S',
                        count: response.data.breakdownCount.count,
                        path: '/manager/as',
                        // percentage: response.data.breakdownCount.percentage,
                    },
                    {
                        key: 'complaintCount',
                        title: '민원접수',
                        count: response.data.complaintCount.count,
                        path: '/manager/customer-voice',
                        // percentage: response.data.complaintCount.percentage,
                    },
                ];

                setStatistics(statistics);
            }

        } catch (error) {
            console.error("데이터를 가져오는 데 실패했습니다:", error);
        }
    }

    // 선 그래프용 임시 데이터
    const lineChartData = [
        { name: '01월 01일', 점검: 35, 미점검: 15, '고장 A/S': 1 },
        { name: '01월 02일', 점검: 40, 미점검: 10, '고장 A/S': 2 },
        { name: '01월 03일', 점검: 35, 미점검: 15, '고장 A/S': 3 },
        { name: '01월 04일', 점검: 41, 미점검: 9, '고장 A/S': 2 },
        { name: '01월 05일', 점검: 37, 미점검: 13, '고장 A/S': 1 },
        { name: '01월 06일', 점검: 32, 미점검: 18, '고장 A/S': 2 },
        { name: '01월 07일', 점검: 42, 미점검: 8, '고장 A/S': 3 },
    ];

    // 원형 차트용 임시 데이터
    const pieChartData = [
        { name: '점검', value: 67 },
        { name: '미점검', value: 29 },
        { name: '고장 A/S', value: 4 },
    ];

    const CircularProgressWithLabel = ({ value, color }) => {
        return (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress
                    variant="determinate"
                    value={100}
                    style={{ color: '#E0E0E0', transform: 'rotate(0deg)' }} // Rotate to reverse direction
                    thickness={7}
                    size={60}
                />
                <CircularProgress
                    variant="determinate"
                    value={value}
                    style={{
                        color,
                        position: 'absolute',
                        left: 0,
                        transform: 'rotate(20deg)'
                    }}
                    thickness={7}
                    size={60}
                />
                <Box
                    sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        variant="caption"
                        component="div"
                        color="textSecondary"
                        sx={{
                            fontSize: '1.0rem',
                            fontWeight: 900,
                        }}
                    >
                        {`${value}%`}
                    </Typography>
                </Box>
            </Box>
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
            <Box>
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='h6'>점검주기별 시설 통계</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" sx={{ paddingY: 2, }}>
                        <Box>
                            <Box>
                                {checkCycles.map((cycle, index) => (
                                    <Button
                                        key={index}
                                        variant="contained"
                                        onClick={() => handleCheckCycleChange(cycle.eng)}
                                        sx={{
                                            marginRight: 1,
                                            width: 130,
                                            backgroundColor: selectedCheckCycle === cycle.eng ? '#7A8493' : '#9DAFCC',
                                            boxShadow: 'none',
                                            '&:hover': {
                                                backgroundColor: selectedCheckCycle === cycle.eng ? '#7A8493' : '#9DAFCC',
                                                boxShadow: 'none'
                                            },
                                        }}
                                    >
                                        {cycle.kor}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                    {selectedCheckCycle === 'DAILY' && (
                        <FormControl variant="outlined" sx={{ marginY: 2 }}>
                            <DatePicker
                                label="선택"
                                value={new Date(selectedDate)}
                                onChange={(newValue) => handleDateChange(newValue)}
                                format="yyyy-MM-dd"
                                views={["year", "month", "day"]}
                                openTo="day"
                            />
                        </FormControl>
                    )}
                    {selectedCheckCycle === 'WEEKLY' && (
                        <WeekPicker value={new Date(selectedDateOfWeek)} onChange={(newValue) => handleWeekChange(newValue)} />
                    )}
                    {selectedCheckCycle === 'MONTHLY' && (
                        <FormControl variant="outlined" sx={{ marginY: 2 }}>
                            <DatePicker
                                label="선택"
                                value={new Date(selectedMonth)}
                                onChange={(newValue) => handleMonthChange(newValue)}
                                views={["year", "month"]}
                                format="yyyy년 MM월"
                                openTo="month"
                                maxDate={new Date(today)}
                            />
                        </FormControl>
                    )}
                    {selectedCheckCycle === 'QUARTER' && (
                        <>
                            <Box sx={{ marginY: 2, display: 'flex' }}>
                                <FormControl variant="outlined" sx={{ marginRight: '10px' }}>
                                    <Select
                                        value={selectedYearForQuarter}
                                        onChange={handleYearChange}
                                    >
                                        {Array.from({ length: 5 }, (_, index) => {
                                            const year = new Date().getFullYear() - index; // 5년 전부터 올해까지
                                            return <MenuItem key={year} value={year}>{year}</MenuItem>;
                                        })}
                                    </Select>
                                </FormControl>
                                <FormControl variant="outlined">
                                    <Select
                                        value={selectedQuarter}
                                        onChange={handleQuarterChange}
                                        sx={{ minWidth: '150px', padding: '0 !important' }}
                                    >
                                        <MenuItem value={"1"}>1분기</MenuItem>
                                        <MenuItem value={"2"}>2분기</MenuItem>
                                        <MenuItem value={"3"}>3분기</MenuItem>
                                        <MenuItem value={"4"}>4분기</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </>
                    )}
                </Box>
                <Box sx={{ backgroundColor: '#fff', padding: 2, borderRadius: '10px' }}>
                    <Box display="flex" justifyContent="space-between" sx={{ width: '100%', marginBottom: '10px' }}>
                        {statistics.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flexGrow: '1',
                                    marginRight: '10px',
                                    borderRadius: '10px',
                                    border: '2px solid #E0E0E0',
                                    padding: '5px 15px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer'
                                }}
                                onClick={() => {
                                    if (item.path) {
                                        navigate(item.path);
                                    }
                                }}
                            >
                                <Box>
                                    <Typography sx={{
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold',
                                        mt: 1,
                                    }}>
                                        {item.title}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '2.4rem',
                                        fontWeight: 'bold',
                                    }}>
                                        {item.count}
                                    </Typography>
                                </Box>
                                {item.percentage && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgressWithLabel value={item.percentage} color={item.title == '미점검 시설' ? '#FA6342' : '#2196F3'} />
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                    {/* <Box display="flex" justifyContent="space-between" >
                    <Box sx={{
                        width: '57%',
                        borderRadius: '10px',
                        border: '2px solid #E0E0E0',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px',
                        justifyContent: 'center'
                    }}>
                        <LineChart
                            width={650}
                            height={280}
                            data={lineChartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                wrapperStyle={{ paddingLeft: 20 }}  // 범례와 차트 사이 여백
                            />
                            <Line type="linear" dataKey="점검" stroke="#2196F3" strokeWidth={3} activeDot={{ r: 8 }} />
                            <Line type="linear" dataKey="미점검" stroke="#FFA726" strokeWidth={3} />
                            <Line type="linear" dataKey="고장 A/S" stroke="#66BB6A" strokeWidth={3} />
                        </LineChart>
                    </Box>
                    <Box sx={{
                        width: '42%',
                        borderRadius: '10px',
                        border: '2px solid #E0E0E0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'start',
                        alignItems: 'center'
                    }}>
                        <Typography sx={{
                            p: 2,
                            fontWeight: 'bold',
                            alignSelf: 'flex-start',
                            fontSize: '1.1rem'
                        }}>점검현황</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignSelf: 'center', mt: -2 }}>
                            <PieChart width={300} height={250}>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </Box>
                    </Box>
                </Box> */}
                </Box>
            </Box>
        </LocalizationProvider>
    );
};

export default validationAuth(DashBoardFacility);