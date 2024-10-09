import React from 'react';
import './MainPage.css'
import { Link } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';

const MainPage = () => {
    return (
        <div className="main-page">
            <h1>Добро пожаловать!</h1>
            <div className="button-container">
                <Link to="/form">
                    <button className="navigate-button">Разместить объявление</button>
                </Link>
                <Link to="/autosearch">
                    <button className="navigate-button">Сохраненные поиски</button>
                </Link>
            </div>
        </div>
    );
};

export default MainPage;