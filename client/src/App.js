/* eslint-disable react/react-in-jsx-scope */
import './Components/UploadFiles';
import './assets/css/app.css';
import { useReducer } from 'react';
import { UploadFiles } from './Components/UploadFiles';
import { Navbar } from './Components/Navbar';
import { ImageContext } from './context/ImageContext';
import { Options } from './Components/Options';

const Reducer = (state, action) => {
	switch (action.type) {
		case 'add-file':
			return {
				files: [...state.files, ...action.payload],
				totalFiles: state.totalFiles + action.payload.length,
				options: { ...state.options },
			};
		case 'delete-file':
			return {
				files: state.files.filter((e, idx) => idx !== action.payload),
				totalFiles: state.totalFiles - 1,
				options: { ...state.options },
			};
		case 'delete-all':
			return { files: [], totalFiles: 0, options: { ...state.options } };
		case 'change-quality':
			return { ...state, options: { ...state.options, quality: action.payload } };
		case 'toggle-lossless':
			return { ...state, options: { ...state.options, lossless: action.payload } };
		case 'toggle-keepmetadata':
			return { ...state, options: { ...state.options, keepMetadata: action.payload } };
		default:
			return state;
	}
};
function App() {
	const [files, dispatch] = useReducer(Reducer, {
		files: [],
		totalFiles: 0,
		options: { lossless: false, quality: 85, keepMetadata: false },
	});
	// const [isDark,setDark] = useState(false);
	return (
		<ImageContext.Provider value={{ data: files, dispatch }}>
			<Navbar />
			<div className='App'>
				<UploadFiles />
				<Options />
			</div>
		</ImageContext.Provider>
	);
}

export default App;
