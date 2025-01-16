import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import Header from './components/Header/Header'
import { Route, Routes } from 'react-router-dom';
import MainPage from './components/MainPage/MainPage'
import Form from './components/Form/Form'
import Autosearch from './components/Autosearch/Autosearch';
import Ads from './components/Ads/Ads'
import SearchResults from './components/SearchResults/SearchResults'

function App() {
  const {tg, onToggleButton} = useTelegram();

  useEffect(() => {
    tg.ready();
    tg.expand()
  }, [])

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route index element={<MainPage />}/>
        <Route path={'form'} element={<Form />}/>
        <Route path={'autosearch'} element={<Autosearch />}/>
        <Route path={'ads'} element={<Ads />}/>
        <Route path={'search_results'} element={<SearchResults />}/>
      </Routes>
    </div>
  );
}

export default App;
