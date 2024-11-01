import styled from "@emotion/styled";
import { TextField } from "@mui/material";

export const CssTextField = styled(TextField)(() => ({
    "& label": {
        color: "#000000",
        fontSize: '14px',
        fontWeight: '400',
    },
    "& label.Mui-focused": {
        color: "#000000",
    },
    "& .MuiInput-underline:before": {
        borderColor: "#000000",
    },
    "& .MuiInput-underline:after": {
        borderColor: "#000000",
    },
    "& .MuiInput-root": {
        "& fieldset": {
            borderColor: "#000000",
        },
        "&:hover fieldset": {
            borderColor: "#000000",
        },
        "&.Mui-focused fieldset": {
            borderColor: "#000000",
        },
    }
  }))