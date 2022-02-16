/* eslint-disable react/prop-types */
import React from 'react';
import Logo from '../assets/images/logo.png';
import '../assets/css/uploadfiles.css';

export const BeforeUpload = ({ getInputProps, getRootProps }) => {
	return (
		<div className='uploadFiles' {...getRootProps()}>
			<input {...getInputProps()} />
			<img className='logo' src={Logo} alt='Hello' />
			<div className='uploadText'>Drop files here</div>
			<div className='or'>
				<div className='line'></div>
				<div className='orText'>OR</div>
				<div className='line'></div>
			</div>
			<button className='uploadButton'>
				<div className='buttonContainer'>
					<i style={{ marginTop: 3 }} className='fas fa-folder'></i>
					<div className='browseBtn'>Browse...</div>
				</div>
			</button>
		</div>
	);
};
