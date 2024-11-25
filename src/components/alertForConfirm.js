import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogActions, DialogTitle, DialogContent, DialogContentText, Button } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const AlertForConfirm = ({
  open,
  onClose,
  onConfirm,
  contentText,
  severity = 'info',
  showCancel = true, 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle
        id="alert-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'pretendard-Regular'
        }}
      >
        {severity === 'warning' ? <WarningIcon sx={{ mr: 1, color: 'error.main' }} /> : <InfoIcon sx={{ mr: 1 }} />}
        {severity === 'warning' ? '경고' : '알림'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {contentText}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onConfirm} color="primary">
          예
        </Button>
        {showCancel && (
          <Button onClick={onClose} color="primary" autoFocus>
            아니오
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

AlertForConfirm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  contentText: PropTypes.string.isRequired,  // 누락된 PropTypes 추가
  severity: PropTypes.oneOf(['warning', 'info']),
  showCancel: PropTypes.bool,
};

export default AlertForConfirm;
