import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header/Header';
import { Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage';
import Form from './components/Form/Form';
import Autosearch from './components/Autosearch/Autosearch';
import { useTelegram } from '../../hooks/useTelegram';

const App = () => {
  const { tg } = useTelegram();

  useEffect(() => {
    const initData = tg.initData;
    const initDataURLSP = new URLSearchParams(initData);
    const hash = initDataURLSP.get('hash');

    initDataURLSP.delete('hash');
    initDataURLSP.sort();
    const checkDataString = initDataURLSP.toString().replaceAll('&', '\n');

    const xhrURL = new URL('https://bot.fatir.su/userIsValid');
    xhrURL.searchParams.set('hash', hash);
    xhrURL.searchParams.set('checkDataString', checkDataString);

    fetch(xhrURL)
      .then((response) => response.json())
      .then((data) => {
        if (data.result === true) {
          tg.showAlert(`Добро пожаловать, @${tg.WebAppUser.username}.`);
        } else {
          tg.showAlert("Ошибка");
          tg.close();
        }
      });
    
    tg.ready();
  }, [tg]);

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="form" element={<Form />} />
        <Route path="autosearch" element={<Autosearch />} />
      </Routes>
    </div>
  );
};

export default App;
