import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import Header from './components/Header/Header'
import { Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage'
import Form from './components/Form/Form'
import Autosearch from './components/Autosearch/Autosearch';

function App() {
  const {tg, onToggleButton} = useTelegram();

  useEffect(() => {
    tg.ready();
  }, [])

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route index element={<MainPage />}/>
        <Route path={'form'} element={<Form />}/>
        <Route path={'autosearch'} element={<Autosearch />}/>
      </Routes>
    </div>
  );
}

export default App;
