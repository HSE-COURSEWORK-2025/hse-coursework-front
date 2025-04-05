// components/GoogleLoginButton.tsx
import { GoogleLogin } from "@react-oauth/google";
import { useSnackbar } from "notistack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

// Кастомные стили для MD3
const Md3Wrapper = styled(Box)(({ theme }) => ({
  "& .google-login": {
    borderRadius: "20px !important",
    height: "40px !important",
    boxShadow: theme.shadows[1] + " !important",
    transition: "all 0.3s ease !important",
    "&:hover": {
      boxShadow: theme.shadows[3] + " !important",
      backgroundColor: `${theme.palette.grey[100]} !important`,
    },
    "&:active": {
      transform: "scale(0.98) !important",
    },
    "& div": {
      margin: "0 auto !important",
      fontFamily: theme.typography.fontFamily + " !important",
      fontWeight: theme.typography.button.fontWeight + " !important",
    },
  },
}));

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

export const GoogleLoginButton = () => {
  const { enqueueSnackbar } = useSnackbar();

  const handleSnackbar = (variant: "success" | "error", message: string) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 3000,
      anchorOrigin: { vertical: "bottom", horizontal: "center" },
      style: {
        borderRadius: "28px",
        fontFamily: "Roboto, sans-serif",
        ...(variant === "success" && {
          backgroundColor: "#B8E6B3",
          color: "#1C4A17",
        }),
        ...(variant === "error" && {
          backgroundColor: "#F9DEDC",
          color: "#B3261E",
        }),
      },
    });
  };

  return (
    <Md3Wrapper>
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          try {
            const response = await fetch("http://localhost:8080/api/v1/auth/google", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: credentialResponse.credential,
              }),
            });

            const data = await response.json();

            if (response.ok) {
              localStorage.setItem("access_token", data.access_token);
              handleSnackbar("success", "Успешный вход через Google");
            } else {
              throw new Error(data.detail || "Ошибка авторизации");
            }
          } catch (error) {
            let errorMessage = "Неизвестная ошибка";

            if (isErrorWithMessage(error)) {
              errorMessage = error.message;
            } else if (typeof error === "string") {
              errorMessage = error;
            }

            handleSnackbar("error", errorMessage);
          }
        }}
        onError={() => {
          handleSnackbar("error", "Не удалось выполнить вход через Google");
        }}
        useOneTap
        size="large"
        width="300"
        shape="pill"
        theme="filled_blue"
        logo_alignment="center"
        text="signin_with"
        // className="google-login"
        ux_mode="popup"
      />
    </Md3Wrapper>
  );
};