import React, { useCallback, useContext } from 'react';
import { BeforeUpload } from './BeforeUpload';
import { AfterUpload } from './AfterUpload';
import { useDropzone } from 'react-dropzone';
import { ImageContext } from '../context/ImageContext';

export const UploadFiles = () => {
	const { data, dispatch } = useContext(ImageContext);

	const onDrop = useCallback(
		(Uploadedfiles) => {
			if (Uploadedfiles.length > 0 && Uploadedfiles.length < 11) {
				dispatch({ type: 'add-file', payload: Uploadedfiles });
			}
		},
		[dispatch],
	);
	const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/jpeg, image/png, image/gif, image/svg+xml' });
	return (
		<>{data.totalFiles > 0 ? <AfterUpload /> : <BeforeUpload getInputProps={getInputProps} getRootProps={getRootProps} />}</>
	);
};
