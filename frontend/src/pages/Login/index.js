import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

// Material-UI Components
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import CircularProgress from "@material-ui/core/CircularProgress";
import useMediaQuery from "@material-ui/core/useMediaQuery";

// Custom Imports
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";

const useStyles = makeStyles((theme) => {
  const primary = theme.palette.primary?.main || "#10B981";
  const secondary = theme.palette.secondary?.main || "#6366F1";
  return {
    root: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.palette.type === 'dark' 
        ? 'radial-gradient(circle at 15% 15%, #1E293B 0%, #0F172A 70%, #020617 100%)' 
        : `radial-gradient(circle at 15% 15%, ${primary}15 0%, #F1F5F9 50%, #E2E8F0 100%)`,
      position: 'relative',
      overflow: 'hidden',
      padding: theme.spacing(2),
    },
    loginContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: 420,
      zIndex: 1,
    },
    loginCard: {
      padding: theme.spacing(5, 4, 4),
      borderRadius: 24,
      backdropFilter: 'blur(16px)',
      background: theme.palette.type === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.95)',
      boxShadow: theme.palette.type === 'dark'
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        : `0 25px 50px -12px ${primary}25`,
      border: theme.palette.type === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : '1px solid rgba(226, 232, 240, 0.8)',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    logoContainer: {
      width: 90,
      height: 90,
      margin: '0 auto -45px',
      borderRadius: '22px',
      background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 12px 24px ${primary}40`,
      border: '4px solid ' + (theme.palette.type === 'dark' ? '#0F172A' : '#FFFFFF'),
      position: 'relative',
      zIndex: 2,
      '& img': {
        width: '65%',
        height: 'auto',
        objectFit: 'contain',
      }
    },
    formTitle: {
      margin: theme.spacing(4, 0, 1),
      color: theme.palette.text.primary,
      fontWeight: 700,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
    },
    formSubtitle: {
      color: theme.palette.type === 'dark' ? '#94A3B8' : '#64748B',
      marginBottom: theme.spacing(3),
      fontSize: '0.875rem',
    },
    form: {
      width: '100%',
      marginTop: theme.spacing(2),
    },
    inputField: {
      marginBottom: theme.spacing(2.5),
      '& .MuiOutlinedInput-root': {
        borderRadius: 12,
        backgroundColor: theme.palette.type === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC',
        '& fieldset': {
          borderColor: theme.palette.type === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0',
        },
        '&:hover fieldset': {
          borderColor: primary,
        },
        '&.Mui-focused fieldset': {
          borderColor: primary,
          borderWidth: 2,
        },
      },
      '& .MuiInputLabel-root': {
        color: theme.palette.type === 'dark' ? '#94A3B8' : '#64748B',
        '&.Mui-focused': {
          color: primary,
        },
      },
    },
    submitButton: {
      margin: theme.spacing(2, 0, 2),
      padding: theme.spacing(1.5),
      borderRadius: 12,
      fontWeight: 600,
      fontSize: '1rem',
      textTransform: 'none',
      boxShadow: `0 4px 14px ${primary}40`,
      background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
      color: '#FFFFFF',
      transition: 'all 0.2s ease',
      '&:hover': {
        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        opacity: 0.9,
        boxShadow: `0 6px 20px ${primary}60`,
        transform: 'translateY(-1px)',
      },
    },
    linkText: {
      color: theme.palette.type === 'dark' ? '#94A3B8' : '#64748B',
      fontWeight: 500,
      fontSize: '0.875rem',
      textDecoration: 'none',
      transition: 'color 0.2s ease',
      '&:hover': {
        color: primary,
      },
    },
    decorativeCircle: {
      position: 'absolute',
      borderRadius: '50%',
      background: theme.palette.type === 'dark' 
        ? `radial-gradient(circle, ${primary}20 0%, rgba(0,0,0,0) 70%)` 
        : `radial-gradient(circle, ${primary}25 0%, rgba(0,0,0,0) 70%)`,
      pointerEvents: 'none',
      zIndex: 0,
    }
  };
});

const Login = () => {
    const theme = useTheme();
    const classes = useStyles();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [user, setUser] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const { handleLogin, loading } = useContext(AuthContext);
    const { setCustomTheme } = useContext(ColorModeContext);
    const [viewregister, setviewregister] = useState('disabled');

    const handleChangeInput = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    useEffect(() => {
        fetchPublicThemeSettings();
        fetchviewregister();
    }, []);

    const fetchPublicThemeSettings = async () => {
        try {
            const [resPrimary, resSecondary, resFont] = await Promise.allSettled([
                api.get("/settings/primaryColor"),
                api.get("/settings/secondaryColor"),
                api.get("/settings/fontSize")
            ]);
            const pColor = resPrimary.status === "fulfilled" ? resPrimary.value?.data?.value : null;
            const sColor = resSecondary.status === "fulfilled" ? resSecondary.value?.data?.value : null;
            const fSize = resFont.status === "fulfilled" ? resFont.value?.data?.value : null;

            if ((pColor || sColor || fSize) && typeof setCustomTheme === "function") {
                setCustomTheme({
                    primaryColor: pColor,
                    secondaryColor: sColor,
                    fontSize: fSize
                });
            }
        } catch (error) {
            console.error("Error retrieving public theme settings", error);
        }
    };

    const fetchviewregister = async () => {
        try {
            const responsev = await api.get("/settings/viewregister");
            const viewregisterX = responsev?.data?.value;
            setviewregister(viewregisterX);
        } catch (error) {
            console.error('Error retrieving viewregister', error);
        }
    };

    const handlSubmit = (e) => {
        e.preventDefault();
        handleLogin(user);
    };

    const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/login.png`;
    const randomValue = Math.random();
    const logoWithRandom = `${logo}?r=${randomValue}`;

    return (
        <div className={classes.root}>
            {/* Decorative circles */}
            <div className={classes.decorativeCircle} style={{ width: 300, height: 300, top: -150, left: -150 }} />
            <div className={classes.decorativeCircle} style={{ width: 200, height: 200, bottom: -100, right: -100 }} />
            
            <div className={classes.loginContainer}>
                <div className={classes.logoContainer}>
                    <img src={logoWithRandom} alt="Logo" />
                </div>
                
                <div className={classes.loginCard}>
                    <Typography variant="h5" className={classes.formTitle}>
                        Acesse sua conta
                    </Typography>
                    
                    <form className={classes.form} onSubmit={handlSubmit}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label={i18n.t("login.form.email")}
                            name="email"
                            value={user.email}
                            onChange={handleChangeInput}
                            autoComplete="email"
                            className={classes.inputField}
                            placeholder="seu@email.com"
                        />
                        
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label={i18n.t("login.form.password")}
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={user.password}
                            onChange={handleChangeInput}
                            autoComplete="current-password"
                            className={classes.inputField}
                            placeholder="••••••••"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            edge="end"
                                            color={theme.palette.type === 'dark' ? 'default' : 'primary'}
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submitButton}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                i18n.t("login.buttons.submit")
                            )}
                        </Button>
                        
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                {viewregister === "enabled" && (
                                    <Link
                                        component={RouterLink}
                                        to="/signup"
                                        className={classes.linkText}
                                    >
                                        Criar conta
                                    </Link>
                                )}
                            </Grid>
                            <Grid item>
                                <Link
                                    component={RouterLink}
                                    to="/forgetpsw"
                                    className={classes.linkText}
                                >
                                    Esqueceu a senha?
                                </Link>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;