/* eslint-disable react/prop-types */
import React, { useContext, useState, useRef } from 'react';
import Alert from '@mui/material/Alert';
import '../assets/css/afterUpload.css';
import { ImageContext } from '../context/ImageContext';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { v4 as uuid } from 'uuid';

const ProcessFile = ({ file }) => {
	const [src, setSrc] = React.useState(null);

	React.useEffect(() => {
		const reader = new FileReader();
		reader.onload = () => {
			setSrc(reader.result);
		};
		reader.readAsDataURL(file);
	}, [setSrc, file]);

	if (!src) return null;

	return <img className='previewImage' src={src} alt='' />;
};

export const AfterUpload = () => {
	const { data, dispatch } = useContext(ImageContext);
	const folderRef = useRef();
	const urlRef = useRef();
	const sizeRef = useRef();
	const [response, setResponse] = useState({
		isPresent: false,
		loading: false,
		isError: false,
		errorCode: false,
	});

	const compressHandler = async () => {
		setResponse({ ...response, loading: true });
		const formData = new FormData();
		const responseArr = [];
		const sizeAfter = [];
		const zip = new JSZip();
		folderRef.current = zip.folder('collection');
		formData.append('isLossy', !data.options.lossless);
		formData.append('stripMeta', !data.options.keepMetadata);
		formData.append('imgQuality', data.options.quality);
		for (var i = 0; i < data.files.length; i++) {
			formData.append('inImgs', data.files[i]);
		}
		const requestOptions = {
			method: 'POST',
			headers: {
				'Access-Control-Allow-Origin': 'https://compressio.app',
				'Access-Control-Allow-Credentials': 'true',
			},
			body: formData,
		};
		const r = await fetch('https://compressio.app/api/compress', requestOptions);
		if (r.status !== 200) {
			const res = await r.json();
			setResponse({ ...response, loading: false, isError: true, errorCode: res.Error });
			return;
		}
		const res = await r.json();
		for (const item of res.responseData) {
			responseArr.push(item.outImgURL);
			sizeAfter.push(item.sizeAfter);
		}
		if (responseArr.length !== data.files.length) {
			setResponse({ ...response, loading: false });
			return;
		}
		urlRef.current = responseArr;
		sizeRef.current = sizeAfter;
		responseArr.forEach(async (url, idx) => {
			const imageBlob = await fetch(url, {
				method: 'GET',
				headers: {
					'Access-Control-Allow-Origin': 'https://compressio.app',
					'Access-Control-Allow-Credentials': 'true',
				},
			}).then((response) => response.blob());
			folderRef.current.file(`${data.files[idx].name}`, imageBlob, { binary: true });
		});
		setResponse({ isPresent: true, loading: false });
	};

	const downloadImages = async () => {
		if (response.isPresent) {
			await folderRef.current.generateAsync({ type: 'blob' }).then((content) => saveAs(content, 'compressio-' + uuid()));
		}
	};
	const downloadSingle = async (el, idx) => {
		const imageBlob = await fetch(urlRef.current[idx], {
			method: 'GET',
			headers: {
				'Access-Control-Allow-Origin': 'https://compressio.app',
				'Access-Control-Allow-Credentials': 'true',
			},
		}).then((response) => response.blob());
		saveAs(imageBlob, el.name);
	};
	return (
		<div className='AfterUpload'>
			{response.isError ? (
				<Alert
					variant='filled'
					severity='error'
					sx={{
						backgroundColor: '#ff686b',
						marginTop: 0,
						marginBottom: 5,
						borderRadius: '6px',
						padding: '0.25rem 1.2rem',
					}}
				>
					{response.errorCode}
				</Alert>
			) : (
				''
			)}
			<div className='allFiles'>
				{data.files.map((el, idx) => {
					return (
						<div key={el.lastModified} className='itemWrapper' style={{ marginBottom: 15 }}>
							<div className='fileContainer'>
								<div className='fileName'>{el.name}</div>
								<div className='fileSize' style={{ marginBottom: 4 }}>
									<span className='sizeBefore' style={{ textDecoration: response.isPresent ? 'line-through' : 'none' }}>
										{Math.round((el.size / 1024) * 100) / 100 + ' KB'}
									</span>
									{response.isPresent ? <span className='sizeAfter'>&nbsp; - &nbsp;{sizeRef.current[idx]}</span> : ''}
								</div>
								<ProcessFile file={el} />
								{response.isPresent ? (
									<div
										onClick={() => downloadSingle(el, idx)}
										style={{
											marginTop: -35,
											display: 'flex',
											float: 'right',
											color: '#8B5CF6',
											cursor: 'pointer',
										}}
									>
										<i style={{ marginTop: 5, marginRight: 5, fontSize: '0.8rem' }} className='fas fa-download'></i>
										<div style={{ fontSize: '0.9rem' }}>Download</div>
									</div>
								) : (
									<div
										onClick={() => dispatch({ type: 'delete-file', payload: idx })}
										style={{
											marginTop: -38,
											fontSize: '0.9rem',
											float: 'right',
											color: 'tomato',
											cursor: 'pointer',
										}}
									>
										<i className='fas fa-trash-alt'></i>
									</div>
								)}
							</div>
							{response.loading ? (
								<div className='loader'>
									<div className='loader__element'></div>
								</div>
							) : (
								<div
									style={{
										backgroundColor: response.isPresent ? '#8B5CF6' : '#e2e8f0',
									}}
									className='fileLine'
								></div>
							)}
						</div>
					);
				})}
			</div>
			{response.isPresent ? (
				<div className='afterCompress'>
					<button style={{ marginTop: '20px' }} onClick={() => dispatch({ type: 'delete-all' })} className='again'>
						Compress Again
					</button>
					<button
						onClick={downloadImages}
						style={{ marginTop: '20px', paddingLeft: '21.5px', paddingRight: '21.5px' }}
						className='download'
					>
						<i style={{ marginRight: 4 }} className='fas fa-cloud-download-alt'></i>
						Download All
					</button>
				</div>
			) : (
				<>
					{data.files.length < 5 && (
						<div
							style={{
								position: 'relative',
								marginTop: 20,
								display: 'inline-flex',
								color: '#8B5CF6',
								cursor: 'pointer',
							}}
							className='add'
						>
							<div
								style={{
									display: 'none',
									marginLeft: 3,
									'&:hover': { textDecoration: 'underline' },
								}}
							>
								Add...
								<input
									accept='image/jpeg, image/png, image/gif, image/svg'
									style={{
										cursor: 'pointer',
										position: 'absolute',
										top: 0,
										left: 0,
										bottom: 0,
										right: 0,
										opacity: 0,
										width: '100%',
										height: '100%',
									}}
									type='file'
									onChange={(e) => dispatch({ type: 'add-file', payload: e.target.files })}
								/>
							</div>
						</div>
					)}
					<div
						onClick={() => dispatch({ type: 'delete-all' })}
						style={{
							float: 'right',
							cursor: 'pointer',
							fontSize: '.8rem',
							display: 'inline-flex',
							color: '#8b5cf6',
						}}
					>
						<div style={{ marginTop: 31 }}>
							<i style={{ marginRight: 5, padding: 0 }} className='fas fa-trash-alt'></i>
						</div>
						<div style={{ marginTop: 27, fontSize: '1rem' }}>Clear list</div>
					</div>
					<button className={'uploadButton'} onClick={compressHandler} style={{ marginTop: '20px' }}>
						Compress
					</button>
				</>
			)}
		</div>
	);
};
