import React from "react";

import { Avatar, Card, CardHeader, Typography } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import { makeStyles } from "@material-ui/core/styles";
import { grey } from '@material-ui/core/colors';

const useStyles = makeStyles(theme => ({
	cardContainer: {
		borderRadius: '16px',
		padding: theme.spacing(1),
		backgroundColor: theme.palette.type === 'dark' ? '#1E293B' : '#FFFFFF',
		border: theme.palette.type === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #E2E8F0',
		boxShadow: theme.palette.type === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
		transition: 'transform 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: theme.palette.type === 'dark' ? '0 8px 30px rgba(0, 0, 0, 0.35)' : '0 8px 30px rgba(16, 185, 129, 0.1)',
		}
	},
	cardAvatar: {
		color: theme.palette.primary.main,
		backgroundColor: theme.palette.type === 'dark' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(16, 185, 129, 0.1)',
		width: theme.spacing(6.5),
		height: theme.spacing(6.5),
		borderRadius: '12px',
	},
	cardTitle: {
		fontSize: '13px',
		fontWeight: 600,
		color: theme.palette.type === 'dark' ? '#94A3B8' : '#64748B',
		textTransform: 'uppercase',
		letterSpacing: '0.5px',
	},
	cardSubtitle: {
		color: theme.palette.text.primary,
		fontSize: '22px',
		fontWeight: 700,
		marginTop: '2px',
	}
}));

export default function CardCounter(props) {
    const { icon, title, value, loading } = props
	const classes = useStyles();
    return ( !loading ? 
        <Card className={classes.cardContainer}>
            <CardHeader
                avatar={
                    <Avatar className={classes.cardAvatar}>
                        {icon}
                    </Avatar>
                }
                title={
                    <Typography variant="h6" component="h2" className={classes.cardTitle}>
                        { title }
                    </Typography>
                }
                subheader={
                    <Typography variant="subtitle1" component="p" className={classes.cardSubtitle}>
                        { value }
                    </Typography>
                }
            />
        </Card>
        : <Skeleton variant="rect" height={90} style={{ borderRadius: 16 }} />
    )
    
}