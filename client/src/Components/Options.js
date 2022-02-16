import React, { useContext } from 'react';
import { Slider, Grid, Switch } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ImageContext } from '../context/ImageContext';
import '../assets/css/options.css';

const Sliderr = styled(Slider)({
	height: 6,
	color: '#e2e8f0',
	'& .MuiSlider-track': {
		border: 'none',
	},
	'&.Mui-disabled': {
		color: '#e6eaf0',
	},
	'& .MuiSlider-thumb.Mui-disabled': {
		backgroundColor: '#b99bff',
	},
	'& .MuiSlider-thumb': {
		height: 18,
		width: 18,
		backgroundColor: '#8b5cf6',
	},
});

const Switchh = styled((props) => <Switch focusVisibleClassName='.Mui-focusVisible' disableRipple {...props} />)(
	({ theme }) => ({
		width: 42,
		height: 24,
		padding: 0,
		'& .MuiSwitch-switchBase': {
			padding: 0,
			margin: 3.2,
			transitionDuration: '300ms',
			'&.Mui-checked': {
				transform: 'translateX(16px)',
				color: '#ffffff',
				'& + .MuiSwitch-track': {
					backgroundColor: theme.palette.mode === 'dark' ? '#e1e8ef' : '#8b5cf6',
					opacity: 1,
					border: 0,
				},
			},
		},
		'& .MuiSwitch-thumb': {
			boxSizing: 'border-box',
			width: 17,
			height: 17,
		},
		'& .MuiSwitch-track': {
			borderRadius: 24 / 2,
			backgroundColor: theme.palette.mode === 'light' ? '#e1e8ef' : '#8b5cf6',
			opacity: 0.9,
			transition: theme.transitions.create(['background-color'], {
				duration: 500,
			}),
		},
	}),
);

export const Options = () => {
	const { data, dispatch } = useContext(ImageContext);

	return (
		<div className='Options'>
			<div className='optionText'>Options</div>
			<Grid container className='optionContainerXS' pb={5} sx={{ borderBottom: 1, borderColor: '#cbd5e1' }}>
				<Grid item xs={12} sm={12} md={12} lg={12} className='qualityContainer'>
					<div style={{ marginTop: 6, color: data.options.lossless ? '#b7babe' : '#1f2937' }}>Quality</div>
					<div
						style={{ marginTop: -25, float: 'right', display: 'flex', color: data.options.lossless ? '#b7babe' : '#1f2937' }}
					>
						{data.options.quality}
					</div>
					<div>
						{data.options.lossless ? (
							<Sliderr value={data.options.quality} disabled />
						) : (
							<Sliderr
								value={data.options.quality}
								min={1}
								max={100}
								onChange={(e, nv) => dispatch({ type: 'change-quality', payload: nv })}
							/>
						)}
					</div>
				</Grid>
				<Grid item style={{ color: '#1f2937' }} xs={12} sm={12} md={12} lg={12}>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Lossless
						</Grid>
						<Grid style={{ marginTop: -3, marginBottom: 9, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.lossless}
								onChange={(e) => dispatch({ type: 'toggle-lossless', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Keep Metadata
						</Grid>
						<Grid style={{ marginTop: 0, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.keepMetadata}
								onChange={(e) => dispatch({ type: 'toggle-keepmetadata', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			<Grid container className='optionContainerSM' pb={5} sx={{ borderBottom: 1, borderColor: '#cbd5e1' }}>
				<Grid item xs={12} sm={12} md={12} lg={12} className='qualityContainer'>
					<div style={{ marginTop: 6, color: data.options.lossless ? '#b7babe' : '#1f2937' }}>Quality</div>
					<div
						style={{ marginTop: -25, float: 'right', display: 'flex', color: data.options.lossless ? '#b7babe' : '#1f2937' }}
					>
						{data.options.quality}
					</div>
					<div>
						{data.options.lossless ? (
							<Sliderr value={data.options.quality} disabled />
						) : (
							<Sliderr
								value={data.options.quality}
								min={1}
								max={100}
								onChange={(e, nv) => dispatch({ type: 'change-quality', payload: nv })}
							/>
						)}
					</div>
				</Grid>
				<Grid item xs={12} sm={12} md={12} lg={12} style={{ color: '#1f2937' }}>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Lossless Compression
						</Grid>
						<Grid style={{ marginTop: -3, marginBottom: 9, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.lossless}
								onChange={(e) => dispatch({ type: 'toggle-lossless', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Keep Metadata
						</Grid>
						<Grid style={{ marginTop: 0, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.keepMetadata}
								onChange={(e) => dispatch({ type: 'toggle-keepmetadata', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			<Grid container className='optionContainerMD' pb={5} sx={{ borderBottom: 1, borderColor: '#cbd5e1' }}>
				<Grid item xs={12} sm={12} md={12} lg={12} className='qualityContainer'>
					<div style={{ marginTop: 6, color: data.options.lossless ? '#b7babe' : '#1f2937' }}>Quality</div>
					<div
						style={{ marginTop: -25, float: 'right', display: 'flex', color: data.options.lossless ? '#b7babe' : '#1f2937' }}
					>
						{data.options.quality}
					</div>
					<div>
						{data.options.lossless ? (
							<Sliderr value={data.options.quality} disabled />
						) : (
							<Sliderr
								value={data.options.quality}
								min={1}
								max={100}
								onChange={(e, nv) => dispatch({ type: 'change-quality', payload: nv })}
							/>
						)}
					</div>
				</Grid>
				<Grid item xs={12} sm={12} md={12} lg={12} style={{ color: '#1f2937' }}>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Lossless Compression
						</Grid>
						<Grid style={{ marginTop: -3, marginBottom: 9, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.lossless}
								onChange={(e) => dispatch({ type: 'toggle-lossless', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Keep Metadata
						</Grid>
						<Grid style={{ marginTop: 0, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.keepMetadata}
								onChange={(e) => dispatch({ type: 'toggle-keepmetadata', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>

			<Grid container className='optionContainerLG' pb={5} sx={{ borderBottom: 1, borderColor: '#cbd5e1' }}>
				<Grid item xs={6} sm={6} md={6} lg={6} className='qualityContainer' pr={4}>
					<div style={{ marginTop: 6, color: data.options.lossless ? '#b7babe' : '#1f2937' }}>Quality</div>
					<div
						style={{ marginTop: -25, float: 'right', display: 'flex', color: data.options.lossless ? '#b7babe' : '#1f2937' }}
					>
						{data.options.quality}
					</div>
					<div>
						{data.options.lossless ? (
							<Sliderr value={data.options.quality} disabled />
						) : (
							<Sliderr
								value={data.options.quality}
								min={1}
								max={100}
								onChange={(e, nv) => {
									console.log(2);
									dispatch({ type: 'change-quality', payload: nv });
								}}
							/>
						)}
					</div>
				</Grid>
				<Grid item xs={6} sm={6} md={6} lg={6} style={{ color: '#1f2937' }} pl={4}>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Lossless Compression
						</Grid>
						<Grid style={{ marginTop: -1, marginBottom: 9, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.lossless}
								onChange={(e) => dispatch({ type: 'toggle-lossless', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
					<Grid container direction='row'>
						<Grid item xs={8}>
							Keep Metadata
						</Grid>
						<Grid style={{ marginTop: 0, textAlign: 'end' }} item xs={4}>
							<Switchh
								value={data.options.keepMetadata}
								onChange={(e) => dispatch({ type: 'toggle-keepmetadata', payload: e.target.checked })}
							/>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			<Grid pt={5} pb={10}>
				<div className='optionText'>Restrictions</div>
				<div>Max 10 images at a time.</div>
				<div>Max 50MB total image size.</div>
				<div>All Images will be deleted in 1 hour.</div>
			</Grid>
		</div>
	);
};
