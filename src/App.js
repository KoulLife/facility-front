import './App.css';
import React from 'react';
import {Reset} from 'styled-reset';
import {BrowserRouter as Router, Route, Routes, Navigate, useLocation} from 'react-router-dom';
import {ThemeProvider} from '@mui/material/styles';
import {theme} from './styles/theme';
// import {MenuProvider} from './components/MenuContext';
import {IsLoginProvider} from './components/IsLoginContext';

import LandingPage from "./landing";
import SignUp from './screens/login/signUp';

//admin_통합관리자
import GeneralManager from './screens/admin/adminLayout';
import OrgManagement from "./screens/admin/orgMng/orgManagement";
import MemberManagement from './screens/admin/memberMng/memberManagement';
import QrManagement from './screens/admin/qrMng/qrManagement';
import ScreenManagement from './screens/admin/screenMng/screenManagement';
import FacilityManagement from './screens/admin/facilityMng/facilityManagement';

// manager_관리자
import ManagerLayout from "./screens/manager/managerLayout";
import DashBoardFacility from "./screens/manager/dashBoard/dashBoardFacility";
import DashBoardPerson from "./screens/manager/dashBoard/dashBoardPerson";
import FacilityInfo from "./screens/manager/facilityInfo/facilityInfo";
import FcltyRgstr from "./screens/manager/facilityInfo/fcltyRgstr";
import FcltyRgstrEdt from "./screens/manager/facilityInfo/fcltyRgstrEdt";
import FacilityCheckStatus from "./screens/manager/checkStatus/facilityCheckStatus";
import CheckStatusSheet from "./screens/manager/checkStatus/facilitycheckStatusDetail";
import FacilityUncheckStatus from "./screens/manager/checkStatus/facilityUncheckStatus";
import CustomerVoice from "./screens/manager/customerVoice/customerVoice";
import AS from "./screens/manager/as/as";
import ShowOrg from "./screens/manager/org/showOrg";
import PersonalInfo from './screens/manager/personalInfo';
import RegularInspection from './screens/manager/bulletinBoard/regularInspection/regularInspection';
import GuidesArchive from './screens/manager/bulletinBoard/safetyGuide/guidesArchieve';
import Report from './screens/manager/report/report';

//checker_점검자
import CheckerLayout from './screens/checker/checkerLayout';
import CheckerSignUp from "./screens/checker/checkerSignUp";
import PersonalPage from './screens/checker/personal';
import ToRegisterList from './screens/checker/toRegisterList';
import RegisterCheck from './screens/checker/registerCheck';
import RegisteredList from './screens/checker/registeredList';
import RegisteredDetail from './screens/checker/registeredDetail';
import ImprovementRegistrationList from './screens/checker/improvementRegistrationList';
import ImprovementInfo from "./screens/checker/improvementInfo";
import ImprovementInfoRegistration from "./screens/checker/improvementInfoRegistration";
import ImprovementList from './screens/checker/improvementList';
import ImprovementRegistration from './screens/checker/improvementRegistration';

//complaints_민원인(일반 시민)
import ComplaintIntro from "./screens/complaints/complaintIntro";
import ComplaintInput from './screens/complaints/complaintInput';
import ComplaintCheckList from "./screens/complaints/complaintCheckList";
import ForceRegister from './screens/manager/forceRegister/forceRegister';

import SafetyIntro from './screens/checker/safety/safetyIntro';
import SafetyCheckForm from './screens/checker/safety/infoForm';
import SafetyGuide from './screens/checker/safety/safetyGuide';
import NotFound from './screens/checker/safety/notFoundPage';

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <Routes location={location}>
            <Route path="/" element={<LandingPage/>}/>
            {/* checker 관련 페이지 라우팅 */}
            <Route path="/checker/register-check/:facilityId" element={<RegisterCheck/>}/>
            <Route path="/checker/registered-detail/:id" element={<RegisteredDetail/>}/>
            <Route path="/checker/improvement-registration/:id" element={<ImprovementRegistration/>}/>
            <Route path="/checker/sign-up" element={<CheckerSignUp/>}/>
            <Route path="/checker/improvement-info/:id" element={<ImprovementInfo/>}/>
            <Route path="/checker/improvement-info-registration/:id" element={<ImprovementInfoRegistration/>}/>
            <Route path="/checker/personal" element={<PersonalPage/>}/>
            <Route path="/checker" element={<CheckerLayout/>}>
            <Route index element={<Navigate to="/checker/to-register-list" replace/>}/>
                <Route path="to-register-list" element={<ToRegisterList/>}/>
                <Route path="registered-list" element={<RegisteredList/>}/>
                <Route path="improvement-registration-list" element={<ImprovementRegistrationList/>}/>
                <Route path="improvement-list" element={<ImprovementList/>}/>
            </Route>
            {/* 민원인 관련 페이지 라우팅 */}
            <Route path="/complaint/:facilityId" element={<ComplaintIntro/>}/>
            <Route path="/complaint-input/:facilityId" element={<ComplaintInput/>}/>
            <Route path="/complaint-check-list/:facilityId" element={<ComplaintCheckList/>}/>
            {/* 안전수칙 페이지 */}
            <Route path="/safetyIntro/:noticeId" element={<SafetyIntro/>}/>
            <Route path="/safetyInfro" element={<NotFound />} />
            <Route path="/safetyCheckForm/:noticeId" element={<SafetyCheckForm/>}/>
            <Route path="/safetyCheckForm" element={<NotFound />} />
            <Route path="/safetyGuide/:noticeId" element={<SafetyGuide/>}/>
            {/* admin 관련 페이지 라우팅 */}
            <Route path="/admin" element={<GeneralManager/>}>
                <Route index element={<Navigate to="/admin/org-management" replace/>}/>
                <Route path="org-management" element={<OrgManagement/>}/>
                <Route path="member-management" element={<MemberManagement/>}/>
                <Route path="qr-management" element={<QrManagement/>}/>
                <Route path="screen-management" element={<ScreenManagement/>}/>
                <Route path="facility-management" element={<FacilityManagement/>}/>
            </Route>
            <Route path="/improvementRegistration" element={<ImprovementRegistration/>}/>
            <Route path="/sign-up" element={<SignUp/>}/>
            {/* manager 재구성 페이지 라우팅 */}
            <Route path="/manager" element={<ManagerLayout/>}>
                <Route index element={<Navigate to="/manager/dashboard/facility" replace/>}/>
                <Route path="dashboard/facility" element={<DashBoardFacility/>}/>
                <Route path="dashboard/person" element={<DashBoardPerson/>}/>
                <Route path="facility-info" element={<FacilityInfo/>}/>
                <Route path="facility-registration" element={<FcltyRgstr/>}/>
                <Route path="facility-registration-edit/:facilityId" element={<FcltyRgstrEdt/>}/>
                <Route path="status/check" element={<FacilityCheckStatus/>}/>
                <Route path="status/check/sheet/:facilityId" element={<CheckStatusSheet/>}/>
                <Route path="status/uncheck" element={<FacilityUncheckStatus/>}/>
                <Route path="customer-voice" element={<CustomerVoice/>}/>
                <Route path="as" element={<AS/>}/>
                <Route path="report" element={<Report/>}/>
                <Route path="bulletin-board/regularInspection" element={<RegularInspection/>}/>
                <Route path="bulletin-board/guides" element={<GuidesArchive/>}/>
                <Route path="showOrg" element={<ShowOrg/>}/>
                <Route path="force-register" element={<ForceRegister/>}/>
            </Route>
            <Route path="/manager" >
                <Route path="personal-info" element={<PersonalInfo/>}/>
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

function App() {
    return (
        <IsLoginProvider>
                <Reset/>
                <ThemeProvider theme={theme}>
                    <Router>
                        <AnimatedRoutes/>
                    </Router>
                </ThemeProvider>
        </IsLoginProvider>
    );
}

export default App;