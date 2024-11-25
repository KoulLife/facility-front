import { Button } from "@mui/material";

const ButtonOnTable = ({ variant = 'contained', size = 'small', bgColor = 'var(--main-softblue-color)', text, sx = {}, ...props }) => {
    return (
        <Button
            variant={variant}
            size={size}
            disableElevation
            disableRipple	
            sx={{
                boxShadow: 'none',
                padding: '2.5px 5px',
                borderRadius:'15px',
                backgroundColor: bgColor,
                fontSize: '12px',
                color: '#fff',
                '&:hover': { backgroundColor: bgColor ,boxShadow:'none'},
                ...sx
            }}
            {...props}
        >
            {text}
        </Button>
    );
};

export default ButtonOnTable;